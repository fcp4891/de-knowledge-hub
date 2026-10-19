"""Ejemplos de 14-streaming ejecutados contra un broker Kafka real en Docker (ADR-017).

Un contenedor apache/kafka:4.3.1, fijado por digest, corre en KRaft con un solo nodo durante la sesión. Los bloques
```bash de la sección 10 de cada ficha usan las herramientas de la imagen con docker exec; cada uno crea su topic y lo
borra al salir. La simulación de semánticas de entrega es Python de biblioteca estándar, sin broker. Sin Docker los
tests de Kafka se saltan, salvo con REQUIRE_DOCKER=1 (la CI).
"""

from __future__ import annotations

import re
import subprocess
import sys
import time
from collections.abc import Iterator
from pathlib import Path

import pytest

from tests.test_docker_snippets import bash, blocks, docker, docker_ready, run_snippet  # noqa: F401 - fixtures

KAFKA_IMAGE = "apache/kafka:4.3.1@sha256:77e3df9054047a88b520d0cc46e16696d3b22022e1d580aeccd2632df6532837"
KAFKA_CONTAINER = "dekh-test-kafka"


@pytest.fixture(scope="session")
def kafka(docker_ready: None) -> Iterator[dict[str, str]]:
    """Broker KRaft de un nodo; se borra al terminar la sesión."""
    docker("rm", "-f", KAFKA_CONTAINER)
    started = docker("run", "-d", "--name", KAFKA_CONTAINER, KAFKA_IMAGE)
    assert started.returncode == 0, started.stderr
    try:
        for _ in range(90):
            ready = docker("exec", KAFKA_CONTAINER, "/opt/kafka/bin/kafka-topics.sh",
                           "--bootstrap-server", "localhost:9092", "--list")
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            pytest.fail("Kafka no respondió en 90 s")
        yield {"KAFKA_CONTAINER": KAFKA_CONTAINER}
    finally:
        docker("rm", "-f", KAFKA_CONTAINER)


def run_kafka_snippet(ficha: str, bash: str, kafka: dict[str, str], tmp_path: Path) -> str:
    (code,) = blocks(ficha, "bash")
    return run_snippet(bash, code, tmp_path, kafka)


def test_event_has_key_value_timestamp_and_headers_and_is_not_deleted_on_read(
        kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("events", bash, kafka, tmp_path)
    assert re.search(r"^CreateTime:\d+\torigen:web\tcliente-42\t\{\"evento\": \"pago\", \"monto\": 200\}$", out, re.M), out
    assert "otro lector, mismos eventos: 2" in out


def test_producer_does_not_wait_and_each_group_keeps_its_own_position(
        kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("producers-and-consumers", bash, kafka, tmp_path)
    assert "carga-dwh lee: 3" in out
    assert "carga-dwh vuelve a leer: 0" in out
    assert "alertas lee: 3" in out


def test_broker_keeps_retention_per_topic_and_cannot_replicate_beyond_its_brokers(
        kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("message-brokers", bash, kafka, tmp_path)
    assert out.count("Leader: 1, Replicas: 1") == 2
    assert "retention.ms=86400000" in out
    assert "The target replication factor of 3 cannot be reached because only 1 broker(s) are registered" in out


def test_same_key_always_lands_in_the_same_partition(kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("topics-and-partitions", bash, kafka, tmp_path)
    partitions = dict(re.findall(r"^partición (\d): (.*)$", out, re.M))
    assert sorted(partitions) == ["0", "1", "2"], out
    for user in ("ana", "beto", "carla", "diego"):
        holding = [p for p, keys in partitions.items() if user in keys.split()]
        assert len(holding) == 1 and partitions[holding[0]].split().count(user) == 2, out


def test_committed_offset_lag_and_reset_to_earliest(kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("offsets", bash, kafka, tmp_path)
    assert "primera lectura: 2" in out
    assert "offset confirmado 2, fin del log 4, lag 2" in out
    assert "tras reiniciar al primer offset, el grupo vuelve a leer: 4" in out


def test_events_of_one_key_keep_write_order(kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    out = run_kafka_snippet("event-ordering", bash, kafka, tmp_path)
    for order in ("pedido-1", "pedido-2", "pedido-3"):
        assert f"{order}: creado pagado enviado entregado" in out


def test_delivery_simulation_loses_or_repeats_and_idempotent_sink_absorbs(tmp_path: Path) -> None:
    (code,) = blocks("delivery-semantics", "python")
    script = tmp_path / "delivery.py"
    script.write_text(code, encoding="utf-8", newline="\n")
    out = subprocess.run([sys.executable, script.name], cwd=tmp_path, capture_output=True, text=True,
                         encoding="utf-8", check=True).stdout
    assert "at-most-once: procesados 5, perdidos ['venta-3'], repetidos 0" in out
    assert "at-least-once: procesados 8, perdidos [], repetidos 2" in out
    assert "at-least-once con sink idempotente: 6 filas para 6 eventos" in out
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", script.name], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr
