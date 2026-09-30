"""Tests del respaldo del estado personal (scripts/personal_backup.py) contra PostgreSQL real.

Usan una base temporal y un BACKUP_DIR temporal. pg_dump/psql corren según BACKUP_RUNNER
(compose en local, docker-host en la CI). Si Docker no está disponible, se omiten con motivo.
"""

from __future__ import annotations

import shutil
import subprocess
from collections.abc import Iterator
from pathlib import Path

import pytest
from sqlalchemy import Engine, text

from scripts import personal_backup as pb
from tests.conftest import temporary_database


def docker_available() -> bool:
    if shutil.which("docker") is None:
        return False
    return subprocess.run(["docker", "info"], capture_output=True).returncode == 0


@pytest.fixture
def db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[Engine]:
    if pb.setting("BACKUP_RUNNER", "compose") != "local" and not docker_available():
        pytest.skip("Docker no disponible para ejecutar pg_dump/psql")
    with temporary_database() as engine:
        monkeypatch.setenv("DATABASE_URL", engine.url.render_as_string(hide_password=False))
        monkeypatch.setenv("BACKUP_DIR", str(tmp_path / "backups"))
        yield engine


def seed(engine: Engine) -> None:
    with engine.begin() as conn:
        conn.execute(text(
            "INSERT INTO me_study_states (slug, state, pending_deep_dive, last_studied_at, updated_at) "
            "VALUES ('change-data-capture', 'reviewing', true, '2026-09-30T10:00:00Z', now())"
        ))
        conn.execute(text(
            "INSERT INTO me_notes (id, slug, body_markdown, created_at, updated_at) "
            "VALUES ('n-1', 'change-data-capture', 'Nota con ''comillas'' y ñ', now(), now())"
        ))
        conn.execute(text("INSERT INTO me_favorites (slug, favorite, updated_at) VALUES ('sql-merge', true, now())"))


def snapshot(engine: Engine) -> dict[str, list[tuple[object, ...]]]:
    with engine.connect() as conn:
        return {t: sorted(tuple(r) for r in conn.execute(text(f"SELECT * FROM {t}"))) for t in pb.TABLES}


def test_backup_goes_outside_the_repo_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BACKUP_DIR", raising=False)
    monkeypatch.setattr(pb, "dotenv", lambda path=None: {})
    assert pb.ROOT not in pb.backup_dir().parents and pb.backup_dir() != pb.ROOT


def test_backup_dir_from_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BACKUP_DIR", str(tmp_path / "x"))
    assert pb.backup_dir() == (tmp_path / "x").resolve()


def test_backup_and_restore_roundtrip(db: Engine) -> None:
    seed(db)
    original = snapshot(db)
    path = pb.backup()
    assert path.is_file() and path.parent == pb.backup_dir()
    with db.begin() as conn:
        conn.execute(text("DELETE FROM me_notes"))
        conn.execute(text("UPDATE me_study_states SET state = 'applied'"))
        conn.execute(text("INSERT INTO me_favorites (slug, favorite, updated_at) VALUES ('partitioning', true, now())"))
    source, previous = pb.restore(path)
    assert source == path.resolve() and previous.name.endswith("-pre-restore.sql")
    assert snapshot(db) == original


def test_restore_without_file_uses_latest_backup(db: Engine) -> None:
    seed(db)
    pb.backup()
    with db.begin() as conn:
        conn.execute(text("DELETE FROM me_favorites"))
    latest = pb.backup()
    with db.begin() as conn:
        conn.execute(text("INSERT INTO me_favorites (slug, favorite, updated_at) VALUES ('x', true, now())"))
    source, _ = pb.restore()
    assert source == latest.resolve()
    assert snapshot(db)["me_favorites"] == []


def test_pre_restore_backup_is_not_picked_as_latest(db: Engine) -> None:
    seed(db)
    first = pb.backup()
    pb.restore(first)  # crea un -pre-restore más reciente
    assert pb.latest() == first


def test_failed_restore_changes_nothing(db: Engine, tmp_path: Path) -> None:
    seed(db)
    before = snapshot(db)
    broken = tmp_path / "roto.sql"
    broken.write_text("INSERT INTO me_notes (id) VALUES ('sin-columnas-obligatorias');\n", encoding="utf-8")
    with pytest.raises(SystemExit):
        pb.restore(broken)
    assert snapshot(db) == before
