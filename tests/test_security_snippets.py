"""Ejemplos de 18-security ejecutados en la CI.

- iam-fundamentals y abac: solo biblioteca estándar.
- rbac, least-privilege, service-accounts, row-level-security, column-level-security y data-masking: psycopg contra una
  base temporal en el PostgreSQL de la CI; los roles son del clúster, llevan como sufijo el nombre de la base temporal y
  cada ejemplo los borra al terminar.
- encryption-at-rest, key-management, crypto-shredding y encryption-in-transit: cryptography (ADR-022); el de TLS
  levanta un servidor en 127.0.0.1 con una CA de prueba en un directorio temporal.
- secrets-management: solo biblioteca estándar.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

from tests.test_open_stack_snippets import pg_env, run_python_block  # noqa: F401 - fixture

UTF8 = {"PYTHONIOENCODING": "utf-8"}   # los ejemplos imprimen tildes; en Windows la salida sería cp1252


def assert_mypy_strict(tmp_path: Path) -> None:
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", "snippet.py"], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr


STDLIB = {
    "iam-fundamentals": [
        "usuario:ana tables.read tabla/ventas.consumo.pedidos: permitido (lector en dataset/ventas.consumo (vía grupo:analistas))",
        "sa:pipeline-ventas tables.write tabla/ventas.consumo.pedidos: denegado (sin binding que lo dé)",
        "usuario:plataforma iam.grant tabla/ventas.consumo.pedidos: permitido (admin en proyecto/ventas (vía usuario:plataforma))"],
    "abac": [
        "ana -> finanzas.margen desde red corporativa: permitido (atributos compatibles)",
        "ana -> finanzas.margen desde red externa: denegado (confidencial fuera de la red corporativa)",
        "luis -> finanzas.margen desde red corporativa: denegado (clasificación confidencial > habilitación interno)",
        "ana -> ventas.pedidos desde red corporativa: denegado (área finanzas ≠ ventas)"],
    "secrets-management": [
        "repr del secreto: Secreto(****)", "log: conectando con password=****",
        "sin API_TOKEN: falta la variable API_TOKEN: el proceso no arranca sin ella",
        "archivos con secretos escritos: ['viejo.py']"],
}
CRYPTO = {
    "encryption-at-rest": [
        "guardado en disco contiene el texto: False", "descifrar fila 1: ana.perez@example.com",
        "descifrar con un byte cambiado: InvalidTag", "descifrar movido a la fila 2: InvalidTag",
        "mismo valor, mismo cifrado: False"],
    "key-management": [
        "DEK envuelta con la KEK v1; datos cifrados: 33 bytes",
        "tras rotar: DEK envuelta con la KEK v2; la v1 se destruyó; datos sin volver a cifrar",
        "descifrar: ventas de octubre"],
    "crypto-shredding": [
        "tabla: ['ilegible (clave destruida)', 'luis@example.org', 'ilegible (clave destruida)']",
        "respaldo: ['ilegible (clave destruida)', 'luis@example.org', 'ilegible (clave destruida)']",
        "registros del respaldo modificados: False"],
}
TLS = ["verifica certificado y nombre por defecto: True",
       "cliente sin confiar en la CA: rechazado: unable to get local issuer certificate",
       "cliente con la CA: conectado con TLSv1.3, recibido b'hola'"]
POSTGRES = {
    "rbac": ["ana: leer=sí, escribir=no", "bot: leer=no, escribir=sí", "ana sin el rol analista, leer: no"],
    "least-privilege": ["privilegios: 24 (la vista table_privileges muestra 21: no lista MAINTAIN)",
                        "usados en 30 días: 3; sobran: 21",
                        "REVOKE DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON clientes FROM pipeline_ventas",
                        "quedan: [('staging_ventas', 'INSERT'), ('staging_ventas', 'SELECT'), ('ventas', 'INSERT')]",
                        "MAINTAIN revocado en todas: True"],
    "service-accounts": ["superusuario, crea roles, crea bases: (False, False, False)", "escribe su staging: ok",
                         "lee clientes: denegado (42501)", "crea un rol: denegado (42501)"],
    "row-level-security": ["con RLS y sin política, norte ve: []", "norte ve: [1, 3]", "sur ve: [2]",
                           "superusuario (salta RLS) ve: [1, 2, 3, 4]"],
    "column-level-security": ["SELECT *: denegado", "SELECT email: denegado",
                              "columnas con SELECT para el analista: ['id', 'monto', 'region']"],
    "data-masking": ["dinámico, soporte ve: ['ana.perez@example.com', 'luis@example.org']",
                     "dinámico, analista ve: ['a***@example.com', 'l***@example.org']",
                     "estático, copia de desarrollo: ['cliente1@ejemplo.invalid', 'cliente2@ejemplo.invalid']",
                     "el original no cambió: ['ana.perez@example.com', 'luis@example.org']"],
}


@pytest.mark.parametrize("ficha", sorted(STDLIB))
def test_access_models_in_python(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in STDLIB[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


@pytest.mark.parametrize("ficha", sorted(POSTGRES))
def test_access_controls_in_postgres(ficha: str, pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block(ficha, tmp_path, {**pg_env, **UTF8})
    for line in POSTGRES[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


@pytest.mark.parametrize("ficha", sorted(CRYPTO))
def test_encryption_with_cryptography(ficha: str, tmp_path: Path) -> None:
    pytest.importorskip("cryptography")
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in CRYPTO[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_tls_with_local_ca(tmp_path: Path) -> None:
    pytest.importorskip("cryptography")
    work = tmp_path / "work"
    work.mkdir()
    out = run_python_block("encryption-in-transit", tmp_path, UTF8, args=(str(work),))
    for line in TLS:
        assert line in out, out
    assert_mypy_strict(tmp_path)
