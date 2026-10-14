"""Code Library: ejecuta snippets de Python completos tal como están en content/.

- python-structured-logging: solo biblioteca estándar; se ejecuta siempre.
- pytest-ingestion-test: arma ingest.py desde la sección 10 de data-validation-with-pydantic y de
  batch-ingestion, escribe el test del snippet y lo corre con pytest en un directorio temporal.
  Necesita requirements-snippets.txt (`make snippets-deps`; la CI lo instala); si falta, se salta.
- pyspark-dataframes y emr-spark-clusters: ejecutan la sección 10 de la ficha en modo local. Necesitan pyspark y
  Java 17+; sin ellos se saltan, salvo con REQUIRE_PYSPARK=1 (la CI), donde fallan.
- s3-data-lake, glue-catalog-and-etl, kinesis-data-streams, lambda-for-data, cloudwatch-for-data-pipelines y
  sagemaker-for-data-engineers (ADR-011): importan el código boto3 de la sección 10 y lo ejecutan contra moto;
  rds-as-source y bedrock-for-data-engineers, su código sin llamadas a AWS. Todos pasan mypy --strict. Sin moto se
  saltan, salvo con REQUIRE_AWS_SNIPPETS=1 (la CI).
- step-functions-workflows: la definición en ASL de la sección 10 se valida como JSON y por estructura.
- adls-gen2-storage (ADR-013): el código de Blob de la sección 10 se ejecuta contra Azurite (solo Blob; Azurite no
  soporta ADLS Gen2) y pasa mypy --strict. Sin Azurite en 127.0.0.1:10000 se salta, salvo con REQUIRE_AZURITE=1 (la CI).
"""

from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from types import ModuleType
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PYTHON_FENCE = re.compile(r"^```python\n(.*?)^```", re.S | re.M)


def section_code(path: Path, heading: str) -> str:
    """Primer bloque ```python a partir del encabezado dado."""
    text = path.read_text(encoding="utf-8")
    match = PYTHON_FENCE.search(text, text.index(heading))
    assert match, f"{path.name}: sin bloque python después de {heading!r}"
    return match.group(1)


def before(code: str, marker: str) -> str:
    """Código hasta el marcador (deja fuera el ejemplo de uso al final del bloque)."""
    return code[: code.index(marker)].rstrip() + "\n"


def run_python(args: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run([sys.executable, *args], cwd=cwd, capture_output=True, text=True, encoding="utf-8", timeout=300)


def test_structured_logging_snippet_writes_json_with_run_id_and_redaction(tmp_path: Path) -> None:
    code = section_code(CONTENT / "snippets" / "python-structured-logging.md", "## 2. Código")
    (tmp_path / "logging_setup.py").write_text(code, encoding="utf-8")
    result = run_python(["logging_setup.py"], tmp_path)
    assert result.returncode == 0, result.stderr
    events = [json.loads(line) for line in result.stdout.splitlines()]
    assert [e["message"] for e in events] == ["lote recibido", "reintento"]
    assert {e["run_id"] for e in events} == {"2026-10-04T02:00:00Z"}
    assert events[1]["token"] == "[REDACTED]"


def test_pytest_ingestion_snippet_passes_against_the_fichas_code(tmp_path: Path) -> None:
    pytest.importorskip("google.cloud.bigquery", reason="falta requirements-snippets.txt (make snippets-deps)")
    validation = section_code(CONTENT / "concepts" / "data-validation-with-pydantic.md", "## 10. Código")
    loading = section_code(CONTENT / "concepts" / "batch-ingestion.md", "## 10. Código")
    ingest = before(validation, "\nok, bad = validate_page(") + "\n\n" + before(loading, '\nif __name__ == "__main__":')
    (tmp_path / "ingest.py").write_text(ingest, encoding="utf-8")
    tests = tmp_path / "tests"
    tests.mkdir()
    test_code = section_code(CONTENT / "snippets" / "pytest-ingestion-test.md", "## 2. Código")
    (tests / "test_ingest.py").write_text(test_code, encoding="utf-8")
    result = run_python(["-m", "pytest", "-q", "-p", "no:cacheprovider", "--rootdir", str(tmp_path), "tests"], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr
    assert "7 passed" in result.stdout  # el snippet promete 7 tests (el parametrizado cuenta 4)


def test_pyspark_dataframes_code_runs_in_local_mode(tmp_path: Path) -> None:
    required = os.environ.get("REQUIRE_PYSPARK") == "1"
    java = os.environ.get("JAVA_HOME") or shutil.which("java")
    try:
        import pyspark  # noqa: F401
    except ImportError:
        if required:
            raise
        pytest.skip("falta pyspark (make snippets-deps)")
    if not java:
        if required:
            pytest.fail("REQUIRE_PYSPARK=1 pero no hay Java (JAVA_HOME o java en el PATH)")
        pytest.skip("falta Java 17+ para PySpark")
    code = section_code(CONTENT / "concepts" / "pyspark-dataframes.md", "## 10. Código")
    (tmp_path / "pyspark_df.py").write_text(code, encoding="utf-8")
    result = run_python(["pyspark_df.py"], tmp_path)
    assert result.returncode == 0, result.stdout[-3000:] + result.stderr[-3000:]
    assert "'region': 'norte', 'total': 120" in result.stdout
    assert "BroadcastHashJoin" in result.stdout


def require_pyspark() -> None:
    """Salta sin pyspark o Java, salvo con REQUIRE_PYSPARK=1 (la CI), donde falla."""
    required = os.environ.get("REQUIRE_PYSPARK") == "1"
    try:
        import pyspark  # noqa: F401
    except ImportError:
        if required:
            raise
        pytest.skip("falta pyspark (make snippets-deps)")
    if not (os.environ.get("JAVA_HOME") or shutil.which("java")):
        if required:
            pytest.fail("REQUIRE_PYSPARK=1 pero no hay Java (JAVA_HOME o java en el PATH)")
        pytest.skip("falta Java 17+ para PySpark")


EMR_DRIVER = r"""
import json, sys
from pathlib import Path
from pyspark.sql import SparkSession
import emr_job

base = Path(sys.argv[1])
src = base / "raw"
src.mkdir()
rows = [
    {"id_pedido": 1, "estado": "creado", "updated_at": "2026-10-01T08:00:00", "dt": "2026-10-01"},
    {"id_pedido": 1, "estado": "pagado", "updated_at": "2026-10-01T09:00:00", "dt": "2026-10-01"},
    {"id_pedido": 2, "estado": "creado", "updated_at": "2026-10-01T10:00:00", "dt": "2026-10-01"},
    {"id_pedido": 3, "estado": "creado", "updated_at": "2026-10-02T10:00:00", "dt": "2026-10-02"},
]
(src / "part.jsonl").write_text("\n".join(json.dumps(r) for r in rows), encoding="utf-8")
spark = SparkSession.builder.master("local[2]").appName("emr-job-test").getOrCreate()
out = str(base / "curated")
counts = [emr_job.run(spark, str(src), out, d) for d in ("2026-10-02", "2026-10-01", "2026-10-01")]
df = spark.read.parquet(out)
print(json.dumps({
    "counts": counts,
    "total": df.count(),
    "estado_1": df.where("id_pedido = 1").first()["estado"],
    "dts": sorted(str(r["dt"]) for r in df.select("dt").distinct().collect()),
}))
spark.stop()
"""


def test_emr_spark_job_rewrites_only_its_partition(tmp_path: Path) -> None:
    require_pyspark()
    (tmp_path / "emr_job.py").write_text(section_code(CONTENT / "concepts" / "emr-spark-clusters.md", "## 10. Código"), encoding="utf-8")
    (tmp_path / "driver.py").write_text(EMR_DRIVER, encoding="utf-8")
    result = run_python(["driver.py", str(tmp_path)], tmp_path)
    assert result.returncode == 0, result.stdout[-3000:] + result.stderr[-3000:]
    out = json.loads(result.stdout.strip().splitlines()[-1])
    assert out["counts"] == [1, 2, 2]  # re-ejecutar el 2026-10-01 no duplica
    assert out["total"] == 3 and out["estado_1"] == "pagado"
    assert out["dts"] == ["2026-10-01", "2026-10-02"]  # el overwrite dinámico no borró el 2026-10-02


AWS_SNIPPETS = {
    "s3_partitions": "s3-data-lake.md",
    "glue_catalog": "glue-catalog-and-etl.md",
    "kinesis_stream": "kinesis-data-streams.md",
    "lambda_handlers": "lambda-for-data.md",
    "cloudwatch_pipeline": "cloudwatch-for-data-pipelines.md",
    "sagemaker_ai": "sagemaker-for-data-engineers.md",
    "bedrock_batch": "bedrock-for-data-engineers.md",
    "dms_cdc_apply": "rds-as-source.md",
}


def require_moto() -> None:
    try:
        import moto  # noqa: F401
    except ImportError:
        if os.environ.get("REQUIRE_AWS_SNIPPETS") == "1":
            raise
        pytest.skip("falta moto (make snippets-deps)")


def aws_snippet(name: str, tmp_path: Path) -> ModuleType:
    """Escribe la sección 10 (primer bloque python) de la ficha y la importa como módulo."""
    path = tmp_path / f"{name}.py"
    path.write_text(section_code(CONTENT / "concepts" / AWS_SNIPPETS[name], "## 10. Código"), encoding="utf-8")
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def aws(monkeypatch: pytest.MonkeyPatch) -> Any:
    require_moto()
    from moto import mock_aws

    for key, value in {"AWS_DEFAULT_REGION": "us-east-1", "AWS_ACCESS_KEY_ID": "testing", "AWS_SECRET_ACCESS_KEY": "testing"}.items():
        monkeypatch.setenv(key, value)
    with mock_aws():
        import boto3

        yield boto3


def test_s3_snippet_writes_hive_partitions_idempotently(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("s3_partitions", tmp_path)
    s3 = aws.client("s3")
    s3.create_bucket(Bucket="lake")
    for day in (1, 2, 2):  # el día 2 se reescribe
        m.write_batch(s3, "lake", "ventas", dt.date(2026, 10, day), [{"id": day}])
    assert m.list_partitions(s3, "lake", "ventas") == ["dt=2026-10-01", "dt=2026-10-02"]
    assert m.count_objects(s3, "lake", "raw/ventas/") == 2


def test_glue_snippet_registers_table_and_partitions_once(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("glue_catalog", tmp_path)
    glue = aws.client("glue")
    loc = "s3://lake/curated/ventas_diarias/"
    for _ in range(2):
        m.ensure_table(glue, "ventas", "ventas_diarias", loc)
    assert m.add_partitions(glue, "ventas", "ventas_diarias", loc, ["2026-10-01", "2026-10-02"]) == 2
    assert m.add_partitions(glue, "ventas", "ventas_diarias", loc, ["2026-10-02", "2026-10-03"]) == 1
    assert m.partition_values(glue, "ventas", "ventas_diarias") == ["2026-10-01", "2026-10-02", "2026-10-03"]


def test_kinesis_snippet_sends_all_events_and_keeps_each_key_in_one_shard(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("kinesis_stream", tmp_path)
    kinesis = aws.client("kinesis")
    kinesis.create_stream(StreamName="pedidos", ShardCount=2)
    m.put_events(kinesis, "pedidos", [{"id_pedido": p, "paso": s} for s in range(3) for p in range(5)])
    shards = m.read_all(kinesis, "pedidos")
    assert sum(len(r) for r in shards.values()) == 15
    for pedido in range(5):
        homes = [sid for sid, rs in shards.items() if any(r["id_pedido"] == pedido for r in rs)]
        assert len(homes) == 1  # todos los eventos de un pedido, en un solo shard
    # Sin aserción de orden: PutRecords no lo garantiza (API Reference), y la ficha no lo promete.


def test_aws_snippets_pass_mypy_strict(tmp_path: Path) -> None:
    require_moto()
    files = []
    for name, ficha in AWS_SNIPPETS.items():
        path = tmp_path / f"{name}.py"
        path.write_text(section_code(CONTENT / "concepts" / ficha, "## 10. Código"), encoding="utf-8")
        files.append(path.name)
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", *files], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr


def test_lambda_snippet_writes_curated_once_and_reports_sqs_failures(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("lambda_handlers", tmp_path)
    s3 = aws.client("s3")
    s3.create_bucket(Bucket="lake")
    s3.put_object(Bucket="lake", Key="raw/ventas/dt=2026-10-01/lote 1.jsonl", Body=b'{"id":1,"monto":10.456}\nno-json\n{"id":2}\n')
    event = {"Records": [
        {"s3": {"bucket": {"name": "lake"}, "object": {"key": "raw/ventas/dt%3D2026-10-01/lote+1.jsonl"}}},
        {"s3": {"bucket": {"name": "lake"}, "object": {"key": "curated/otro.jsonl"}}},  # fuera de raw/: se ignora
    ]}
    for _ in range(2):  # S3 puede entregar el evento dos veces
        written = m.process_s3_event(event, s3)
    assert written == ["curated/ventas/dt=2026-10-01/lote 1.jsonl"]
    assert [o["Key"] for o in s3.list_objects_v2(Bucket="lake", Prefix="curated/")["Contents"]] == written
    assert s3.get_object(Bucket="lake", Key=written[0])["Body"].read() == b'{"id": 1, "monto": 10.46}\n'
    sqs_event = {"Records": [{"messageId": "a", "body": '{"id": 1, "monto": 2}'}, {"messageId": "b", "body": "x"}]}
    assert m.sqs_handler(sqs_event, None) == {"batchItemFailures": [{"itemIdentifier": "b"}]}


def test_cloudwatch_snippet_publishes_metric_and_alarm_on_missing_data(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("cloudwatch_pipeline", tmp_path)
    cw = aws.client("cloudwatch")
    m.publish_rows(cw, "ventas_diarias", 1250, dt.datetime(2026, 10, 1, 3, tzinfo=dt.timezone.utc))
    for _ in range(2):
        m.ensure_alarm(cw, "ventas_diarias", "arn:aws:sns:us-east-1:123456789012:alertas")
    alarms = cw.describe_alarms(AlarmNames=["sin-filas-ventas_diarias"])["MetricAlarms"]
    assert len(alarms) == 1 and alarms[0]["TreatMissingData"] == "breaching" and alarms[0]["Threshold"] == 1
    metrics = cw.list_metrics(Namespace="Plataforma/Pipelines")["Metrics"]
    assert metrics[0]["Dimensions"] == [{"Name": "Tabla", "Value": "ventas_diarias"}]


def test_sagemaker_snippet_creates_feature_group_and_transform_job(aws: Any, tmp_path: Path) -> None:
    m = aws_snippet("sagemaker_ai", tmp_path)
    sm = aws.client("sagemaker")
    role = "arn:aws:iam::123456789012:role/sm"
    m.create_customer_features(sm, role, "s3://lake/features/")
    group = sm.describe_feature_group(FeatureGroupName="clientes-compras")
    assert (group["RecordIdentifierFeatureName"], group["EventTimeFeatureName"]) == ("id_cliente", "event_time")
    sm.create_model(ModelName="churn", ExecutionRoleArn=role, PrimaryContainer={"Image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/churn:1"})
    m.start_batch_scoring(sm, "churn-2026-10-01", "churn", "s3://lake/scoring/in/", "s3://lake/scoring/out/")
    job = sm.describe_transform_job(TransformJobName="churn-2026-10-01")
    assert job["TransformOutput"]["S3OutputPath"] == "s3://lake/scoring/out/"


def test_bedrock_snippet_builds_jsonl_and_joins_unordered_output(tmp_path: Path) -> None:
    require_moto()  # el módulo importa los stubs de boto3 solo para tipos; se ejecuta sin AWS
    m = aws_snippet("bedrock_batch", tmp_path)
    jsonl = m.build_jsonl({"r2": "Llegó roto", "r1": "Excelente"})
    lines = [json.loads(line) for line in jsonl.splitlines()]
    assert [line["recordId"] for line in lines] == ["r1", "r2"]
    assert lines[0]["modelInput"]["messages"][0]["content"][0]["text"].endswith("Excelente")
    output = "\n".join(json.dumps({"recordId": rid, "modelOutput": {}}) for rid in ("r2", "r1"))  # otro orden
    assert list(m.join_outputs(jsonl, output)) == ["r1", "r2"]
    with pytest.raises(ValueError, match="r1"):
        m.join_outputs(jsonl, output.splitlines()[0])


def test_dms_cdc_snippet_applies_changes_in_file_order_idempotently(tmp_path: Path) -> None:
    require_moto()
    m = aws_snippet("dms_cdc_apply", tmp_path)
    cols = ["id", "nombre", "oficina"]
    base = {"1": {"id": "1", "nombre": "Bob", "oficina": "New York"}}
    cdc = {
        "20261001-1000000000.csv": "U,1,Bob,Dallas\nD,2,Ana,Santiago\n",
        "20261001-0900000000.csv": "U,1,Bob,Los Angeles\nI,2,Ana,Santiago\n",  # se aplica primero por nombre
    }
    once = m.apply_cdc(base, cdc, cols)
    assert once == {"1": {"id": "1", "nombre": "Bob", "oficina": "Dallas"}}
    assert m.apply_cdc(once, cdc, cols) == once


ASL_FENCE = re.compile(r"^```json\n(.*?)^```", re.S | re.M)


def test_step_functions_definition_is_valid_json_with_reachable_states() -> None:
    text = (CONTENT / "concepts" / "step-functions-workflows.md").read_text(encoding="utf-8")
    match = ASL_FENCE.search(text, text.index("## 10. Código"))
    assert match
    asl = json.loads(match.group(1))
    states = asl["States"]
    assert asl["QueryLanguage"] == "JSONata" and asl["StartAt"] in states
    targets = {s.get("Next") for s in states.values()} | {c["Next"] for s in states.values() for c in s.get("Catch", [])}
    assert targets - {None} <= set(states)
    assert any(s.get("End") or s["Type"] in ("Succeed", "Fail") for s in states.values())
    retry = states["TransformarVentas"]["Retry"][0]
    assert retry["JitterStrategy"] in ("FULL", "NONE") and retry["MaxAttempts"] >= 1


# Cadena de conexión de desarrollo de Azurite, publicada en «Connect to Azurite emulator with Azure SDKs and tools».
AZURITE = (
    "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;"
    "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
    "BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
)


def azurite_container(tmp_path: Path) -> Any:
    """Un contenedor nuevo en Azurite; salta si no responde, salvo con REQUIRE_AZURITE=1 (la CI)."""
    required = os.environ.get("REQUIRE_AZURITE") == "1"
    try:
        from azure.storage.blob import BlobServiceClient
    except ImportError:
        if required:
            raise
        pytest.skip("falta azure-storage-blob (make snippets-deps)")
    service = BlobServiceClient.from_connection_string(AZURITE)
    try:
        return service.create_container(f"lake{tmp_path.name.lower().replace('_', '')[-20:]}")
    except Exception as exc:  # Azurite apagado o inaccesible
        if required:
            raise
        pytest.skip(f"Azurite no responde en 127.0.0.1:10000: {exc.__class__.__name__}")


def test_adls_blob_snippet_writes_partitions_idempotently_on_azurite(tmp_path: Path) -> None:
    path = tmp_path / "adls_blob.py"
    path.write_text(section_code(CONTENT / "concepts" / "adls-gen2-storage.md", "## 10. Código"), encoding="utf-8")
    spec = importlib.util.spec_from_file_location("adls_blob", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    container = azurite_container(tmp_path)
    try:
        for day in (1, 2, 2):  # el día 2 se reescribe
            module.write_batch(container, "ventas", dt.date(2026, 10, day), [{"id": day}])
        assert module.list_partitions(container, "ventas") == ["dt=2026-10-01", "dt=2026-10-02"]
        assert module.count_blobs(container, "raw/ventas/") == 2
    finally:
        container.delete_container()
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", path.name], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr


# Snippets de Azure que no llaman a Azure (solo biblioteca estándar): se ejecutan siempre.
AZURE_STDLIB_SNIPPETS = {
    "azure_sql_cdc_apply": "azure-sql-as-source.md",
    "foundry_batch": "azure-ai-for-data-engineers.md",
}


def azure_snippet(name: str, tmp_path: Path) -> ModuleType:
    path = tmp_path / f"{name}.py"
    path.write_text(section_code(CONTENT / "concepts" / AZURE_STDLIB_SNIPPETS[name], "## 10. Código"), encoding="utf-8")
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_azure_sql_cdc_snippet_applies_in_lsn_order_idempotently(tmp_path: Path) -> None:
    m = azure_snippet("azure_sql_cdc_apply", tmp_path)
    base = {1: {"id": 1, "estado": "creado"}}
    lote = [
        {"__$start_lsn": b"\x02", "__$operation": 3, "id": 1, "estado": "creado"},  # imagen previa: se ignora
        {"__$start_lsn": b"\x02", "__$operation": 4, "id": 1, "estado": "pagado"},
        {"__$start_lsn": b"\x03", "__$operation": 1, "id": 2, "estado": "creado"},
        {"__$start_lsn": b"\x01", "__$operation": 2, "id": 2, "estado": "creado"},  # se aplica primero por LSN
    ]
    once = m.apply_cdc(base, lote)
    assert once == {1: {"id": 1, "estado": "pagado"}}
    assert m.apply_cdc(once, lote) == once
    assert base == {1: {"id": 1, "estado": "creado"}}  # no muta el estado de entrada
    with pytest.raises(ValueError, match="9"):
        m.apply_cdc(base, [{"__$start_lsn": b"\x01", "__$operation": 9, "id": 1}])


def test_foundry_batch_snippet_builds_jsonl_and_joins_unordered_output(tmp_path: Path) -> None:
    m = azure_snippet("foundry_batch", tmp_path)
    jsonl = m.build_batch({"r2": "Llegó roto", "r1": "Excelente"}, "gpt-batch")
    lines = [json.loads(line) for line in jsonl.splitlines()]
    assert [line["custom_id"] for line in lines] == ["r1", "r2"]
    assert lines[0]["body"]["model"] == "gpt-batch" and lines[0]["body"]["input"].endswith("Excelente")
    output = "\n".join(json.dumps({"custom_id": cid, "response": {}}) for cid in ("r2", "r1"))  # otro orden
    assert list(m.join_responses(jsonl, output)) == ["r1", "r2"]
    with pytest.raises(ValueError, match="r1"):
        m.join_responses(jsonl, output.splitlines()[0])


def test_azure_stdlib_snippets_pass_mypy_strict(tmp_path: Path) -> None:
    files = []
    for name, ficha in AZURE_STDLIB_SNIPPETS.items():
        path = tmp_path / f"{name}.py"
        path.write_text(section_code(CONTENT / "concepts" / ficha, "## 10. Código"), encoding="utf-8")
        files.append(path.name)
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", *files], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr


# --- 11-devops: Git sobre un repositorio temporal (ADR-014) y Python sin servicios externos -------------------------

BASH_FENCE = re.compile(r"^```bash\n(.*?)^```", re.S | re.M)


def bash_code(ficha: str) -> str:
    """Primer bloque ```bash de la sección 10 de la ficha."""
    text = (CONTENT / "concepts" / ficha).read_text(encoding="utf-8")
    match = BASH_FENCE.search(text, text.index("## 10. Código"))
    assert match, f"{ficha}: sin bloque bash en la sección 10"
    return match.group(1)


def bash_executable() -> str:
    """bash de Git for Windows en Windows (el de System32 es WSL); el del sistema en Linux."""
    if os.name == "nt":
        git = shutil.which("git")
        for parent in Path(git).resolve().parents if git else []:
            if (parent / "bin" / "bash.exe").is_file():
                return str(parent / "bin" / "bash.exe")
        pytest.skip("falta el bash de Git for Windows")
    found = shutil.which("bash")
    assert found, "falta bash"
    return found


def run_git_snippet(ficha: str, tmp_path: Path) -> tuple[str, Path]:
    """Corre el script en tmp_path con identidad y configuración de Git propias del test; devuelve stdout y el repo."""
    script = tmp_path / "snippet.sh"
    script.write_text(bash_code(ficha), encoding="utf-8", newline="\n")
    env = {**os.environ, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull, "HOME": str(tmp_path),
           "GIT_AUTHOR_NAME": "Test", "GIT_AUTHOR_EMAIL": "test@example.org",
           "GIT_COMMITTER_NAME": "Test", "GIT_COMMITTER_EMAIL": "test@example.org"}
    result = subprocess.run([bash_executable(), script.name], cwd=tmp_path, env=env, capture_output=True, text=True,
                            encoding="utf-8", timeout=120)
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout, tmp_path / "repo"


def git(repo: Path, *args: str) -> str:
    env = {**os.environ, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull}
    return subprocess.run(["git", *args], cwd=repo, env=env, capture_output=True, text=True, encoding="utf-8",
                          check=True).stdout.strip()


def test_branching_snippet_merges_topic_branch_with_merge_commit_and_deletes_it(tmp_path: Path) -> None:
    _, repo = run_git_snippet("git-branching-strategies.md", tmp_path)
    assert git(repo, "branch", "--format=%(refname:short)") == "main"
    merges = git(repo, "log", "--merges", "--format=%s").splitlines()
    assert merges == ["merge feature/validar-nulos"]
    assert len(git(repo, "log", "-1", "--format=%P", "HEAD~1").split()) == 2  # el merge commit tiene dos padres
    assert git(repo, "log", "-1", "--format=%s") == "timeout de la API"  # el fix entró por fast-forward


def test_merge_methods_snippet_squashes_one_branch_and_rebases_the_other(tmp_path: Path) -> None:
    _, repo = run_git_snippet("pull-requests.md", tmp_path)
    assert git(repo, "log", "--format=%s", "main").splitlines() == [
        "pr-rebase: paso 2", "pr-rebase: paso 1", "pr-squash (#1)", "dag base"]
    assert git(repo, "log", "--merges", "--format=%s", "main") == ""


def test_change_size_snippet_measures_lines_against_main(tmp_path: Path) -> None:
    out, _ = run_git_snippet("code-review.md", tmp_path)
    assert "líneas cambiadas: 4" in out


def test_tags_snippet_describes_only_annotated_tags_by_default(tmp_path: Path) -> None:
    out, repo = run_git_snippet("git-tags-and-releases.md", tmp_path)
    kinds, described, with_tags = out.splitlines()[0:2], out.splitlines()[2], out.splitlines()[3]
    assert kinds == ["tag", "commit"]
    assert re.fullmatch(r"v1\.0\.0-2-g[0-9a-f]+", described)
    assert re.fullmatch(r"probado-local-1-g[0-9a-f]+", with_tags)
    assert git(repo, "tag", "-l", "v1.0.0", "--format=%(contents:subject)") == "Versión 1.0.0 del job de ventas"


def test_dedupe_snippet_tests_pass_with_pytest_and_mypy(tmp_path: Path) -> None:
    path = tmp_path / "test_dedupe.py"
    path.write_text(section_code(CONTENT / "concepts" / "automated-testing-in-ci.md", "## 10. Código"), encoding="utf-8")
    result = run_python(["-m", "pytest", "-q", "-p", "no:cacheprovider", path.name], tmp_path)
    assert result.returncode == 0 and "4 passed" in result.stdout, result.stdout + result.stderr
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", path.name], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr


def test_package_snippet_builds_reproducible_zip_and_verifies_hash(tmp_path: Path) -> None:
    path = tmp_path / "package_snippet.py"
    path.write_text(section_code(CONTENT / "concepts" / "build-artifacts.md", "## 10. Código"), encoding="utf-8")
    spec = importlib.util.spec_from_file_location("package_snippet", path)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    src = tmp_path / "src"
    (src / "sql").mkdir(parents=True)
    (src / "job.py").write_text("print('job')\n", encoding="utf-8")
    (src / "sql" / "ventas.sql").write_text("select 1\n", encoding="utf-8")
    first = m.build(src, tmp_path / "a" / "pipeline.zip")
    os.utime(src / "job.py", (1_900_000_000, 1_900_000_000))  # otra fecha de modificación: mismo hash
    second = m.build(src, tmp_path / "b" / "pipeline.zip")
    assert first == second
    assert m.verify(tmp_path / "a" / "pipeline.zip")
    (tmp_path / "b" / "pipeline.zip").write_bytes(b"alterado")
    assert not m.verify(tmp_path / "b" / "pipeline.zip")
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", path.name], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr


DEVOPS_STDLIB_SNIPPETS = {
    "canary_decision": "deployment-strategies.md",
    "model_ci": "ci-cd-for-data.md",
    "gitops_reconcile": "gitops.md",
}


def devops_snippet(name: str, tmp_path: Path) -> ModuleType:
    path = tmp_path / f"{name}.py"
    path.write_text(section_code(CONTENT / "concepts" / DEVOPS_STDLIB_SNIPPETS[name], "## 10. Código"), encoding="utf-8")
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module  # dataclasses necesita el módulo registrado
    spec.loader.exec_module(module)
    return module


def test_canary_snippet_waits_promotes_or_rolls_back(tmp_path: Path) -> None:
    m = devops_snippet("canary_decision", tmp_path)
    stable = m.Window(requests=10_000, errors=100)  # 1 %
    assert m.decide(m.Window(requests=100, errors=1), stable) is m.Decision.WAIT
    assert m.decide(m.Window(requests=1_000, errors=11), stable) is m.Decision.PROMOTE  # 1,1 %
    assert m.decide(m.Window(requests=1_000, errors=20), stable) is m.Decision.ROLLBACK  # 2 % > 1,5 × 1 %
    assert m.decide(m.Window(requests=50, errors=10), stable) is m.Decision.ROLLBACK  # 20 %: no espera


def test_revert_snippet_undoes_merge_with_new_commit_and_keeps_tag(tmp_path: Path) -> None:
    out, repo = run_git_snippet("rollback.md", tmp_path)
    assert "umbral = 100" in out
    assert git(repo, "log", "-1", "--format=%s") == 'Revert "merge feature/umbral"'
    assert git(repo, "rev-parse", "v1.1.0^{commit}") == git(repo, "rev-parse", "HEAD~1")  # la tag no se movió
    assert (repo / "config.py").read_text(encoding="utf-8").strip() == "umbral = 100"


def test_model_ci_snippet_reports_failing_data_tests(tmp_path: Path) -> None:
    m = devops_snippet("model_ci", tmp_path)
    good = [(1, 10, "creado", 5.0, "2026-10-01"), (1, 10, "pagado", 5.0, "2026-10-02"), (2, 11, "creado", 3.0, "2026-10-01")]
    assert m.run_ci(good) == []  # el pedido 1 queda una vez, con su última versión
    bad = good + [(3, None, "devuelto", 1.0, "2026-10-01")]
    assert m.run_ci(bad) == ["not_null_cliente_id", "accepted_values_estado"]


def test_reconcile_snippet_converges_and_prunes_only_when_asked(tmp_path: Path) -> None:
    m = devops_snippet("gitops_reconcile", tmp_path)
    desired = {"job": {"image": "v2"}, "cron": {"schedule": "0 5 * * *"}}
    actual = {"job": {"image": "v1"}, "viejo": {"image": "v0"}}
    assert m.plan(desired, actual) == [("create", "cron"), ("update", "job")]
    converged = m.apply(desired, actual, m.plan(desired, actual, prune=True))
    assert converged == desired
    assert m.plan(desired, converged, prune=True) == []  # reconciliar otra vez no hace nada
    assert "viejo" in m.apply(desired, actual, m.plan(desired, actual))  # sin prune no se borra


def test_devops_stdlib_snippets_pass_mypy_strict(tmp_path: Path) -> None:
    files = []
    for name, ficha in DEVOPS_STDLIB_SNIPPETS.items():
        path = tmp_path / f"{name}.py"
        path.write_text(section_code(CONTENT / "concepts" / ficha, "## 10. Código"), encoding="utf-8")
        files.append(path.name)
    result = run_python(["-m", "mypy", "--strict", "--no-incremental", *files], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr
