---
id: concept:lambda-for-data
slug: lambda-for-data
type: concept
title: Lambda para cargas de datos
description: "Cuándo y cómo usar AWS Lambda en pipelines de datos según su documentación: funciones que corren ante eventos (S3, SQS, Kinesis), con timeout de hasta 15 minutos, memoria de 128 MB a 10.240 MB y /tmp de hasta 10.240 MB; reintentos según el tipo de invocación (dos en asíncrona, el lote completo en streams), respuestas parciales de lote en SQS, detección de bucles recursivos y código idempotente. Los precios se consultan en su página."
domain: aws
subdomain: orchestration-and-compute
category: aws
classification: modern
level: intermediate
importance: medium
cloud: [aws]
technologies: [aws-lambda, aws-s3, python]
tags: [lambda, serverless, events, s3, sqs, idempotency]
related_topics: [event-driven-pipelines, cloud-run-for-data]
sources:
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
    accessed: 2026-10-12
    page_title: "What is AWS Lambda?"
    note: "What is AWS Lambda?: servicio de cómputo serverless; Lambda administra la infraestructura, la capacidad, el escalado y los parches. Dos primitivas: funciones (un handler conectado a un trigger como API Gateway, S3, SQS o EventBridge; cada invocación corre de forma independiente, sin estado compartido) y Lambda MicroVMs (entornos aislados con vida total de hasta 8 horas)."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    accessed: 2026-10-12
    page_title: "Lambda quotas"
    note: "Lambda quotas: timeout de función de 900 segundos (15 minutos), salvo funciones con Lambda Managed Instances en invocaciones asíncronas o por event source mapping (hasta 5.400 segundos); memoria de 128 MB a 10.240 MB, con CPU proporcional; /tmp de 512 MB a 10.240 MB; payload de 6 MB en invocación síncrona y 1 MB en asíncrona; 1.000 ejecuciones concurrentes por defecto."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html
    accessed: 2026-10-12
    page_title: "Understanding retry behavior in Lambda Event Functions"
    note: "Understanding retry behavior in Lambda: en invocación asíncrona, Lambda reintenta dos veces los errores de la función, y se puede configurar una dead-letter queue; los event source mappings que leen de streams reintentan el lote completo y los errores repetidos bloquean el shard hasta resolverse o expirar los registros (vigilar Iterator Age); para colas, el tiempo entre reintentos y el destino de los fallidos los fijan el visibility timeout y la redrive policy de la cola."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
    accessed: 2026-10-12
    page_title: "Process Amazon S3 event notifications with Lambda"
    note: "Process Amazon S3 event notifications with Lambda: S3 invoca la función de forma asíncrona con un evento que describe el objeto. Advertencia: si la función usa el mismo bucket que la dispara, puede entrar en un bucle."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
    accessed: 2026-10-12
    page_title: "Tutorial: Using an Amazon S3 trigger to invoke a Lambda Event Function"
    note: "Tutorial: Using an Amazon S3 trigger: el handler de Python toma el bucket y la clave del evento y decodifica la clave con urllib.parse.unquote_plus antes de leer el objeto."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/invocation-recursion.html
    accessed: 2026-10-12
    page_title: "Use Lambda recursive loop detection to prevent infinite loops"
    note: "Use Lambda recursive loop detection: Lambda detecta bucles en los que una función escribe en el mismo servicio que la invoca, por ejemplo con Amazon S3, Amazon SNS o buses de EventBridge, y también entre funciones."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html
    accessed: 2026-10-12
    page_title: "Using Lambda to process records from Amazon Kinesis Data Streams"
    note: "Using Lambda to process records from Kinesis Data Streams: procesa los registros de cada shard en orden y deja de procesar el shard si la función devuelve un error."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html
    accessed: 2026-10-12
    page_title: "Handling errors for an SQS event source in Lambda"
    note: "Handling errors for an SQS event source: con ReportBatchItemFailures en FunctionResponseTypes, la función devuelve un éxito parcial; la respuesta batchItemFailures lista los mensajes fallidos con su messageId como itemIdentifier, y evita reintentos innecesarios."
  - source: aws-lambda-docs
    url: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
    accessed: 2026-10-12
    page_title: "Best practices for working with AWS Lambda Event Functions"
    note: "Best practices for working with AWS Lambda functions: escribir código idempotente, para que los eventos duplicados se traten igual, y validar los eventos."
  - source: aws-lambda-docs
    url: https://aws.amazon.com/lambda/pricing/
    accessed: 2026-10-12
    page_title: "AWS Lambda pricing"
    note: "AWS Lambda pricing: se cobran solicitudes y duración según la memoria asignada. Los montos no se copian."
relations:
  - type: RELATED_TO
    target: event-driven-pipelines
    note: Lambda es la forma típica de reaccionar a eventos en AWS.
  - type: RELATED_TO
    target: cloud-run-for-data
    note: El equivalente más cercano en GCP, con otros límites y otro modelo; no son lo mismo.
  - type: RELATED_TO
    target: idempotency
    note: Los reintentos y los eventos duplicados exigen código idempotente.
  - type: RELATED_TO
    target: retries
    note: El comportamiento de reintento depende del tipo de invocación.
  - type: RELATED_TO
    target: dead-letter-queue
    note: Destino de los eventos que agotan sus reintentos.
  - type: RELATED_TO
    target: s3-data-lake
    note: Un objeto nuevo en S3 dispara la función.
  - type: RELATED_TO
    target: kinesis-data-streams
    note: Lambda puede leer un stream por shard.
  - type: RELATED_TO
    target: step-functions-workflows
    note: Para encadenar pasos y esperar jobs largos, Step Functions.
  - type: RELATED_TO
    target: aws-iam-for-data
    note: Cada función corre con su rol de IAM.
created_at: 2026-10-12
updated_at: 2026-10-12
last_verified: 2026-10-12
verification_status: review_required
---

## 1. Resumen

**AWS Lambda** ejecuta una función ante un evento sin administrar servidores. Para datos sirve en pasos cortos y reactivos: un archivo llega a S3, un mensaje llega a SQS, un lote llega de Kinesis. Según su documentación:

- el **timeout** máximo es de **15 minutos**, la memoria va de 128 MB a 10.240 MB y `/tmp` hasta 10.240 MB;
- los **reintentos** dependen de la invocación: dos en asíncrona, el lote completo en streams y lo que fije la cola en SQS;
- con SQS se puede devolver **solo los mensajes fallidos** (`batchItemFailures`);
- la función debe ser **idempotente**, porque un evento puede llegar más de una vez.

Lo que dura más de 15 minutos o necesita encadenar pasos va a otro servicio (Glue, EMR, Step Functions).

## 2. Qué es

- **Función:** un handler conectado a un trigger. Cada invocación corre de forma independiente, sin estado compartido.
- **Invocación asíncrona:** el servicio que dispara (por ejemplo S3) no espera la respuesta; Lambda reintenta dos veces los errores y puede mandar los fallidos a una dead-letter queue.
- **Event source mapping:** Lambda lee de un stream o una cola y llama a la función con lotes.
  - Streams (Kinesis): procesa cada shard en orden; un error reintenta el lote completo y bloquea el shard.
  - Colas (SQS): los reintentos y el destino de los fallidos los fija la cola (visibility timeout, redrive policy); con `ReportBatchItemFailures`, la función devuelve solo los fallidos.
- **Cuotas:** 15 minutos, memoria y `/tmp` hasta 10.240 MB, payload de 6 MB (síncrona) o 1 MB (asíncrona), 1.000 ejecuciones concurrentes por defecto.
- **Otras primitivas:** Lambda MicroVMs (entornos aislados de hasta 8 horas) y Lambda Managed Instances, con otros límites.

## 3. Problema que resuelve

Muchos pasos de un pipeline son chicos y reactivos: validar un archivo al llegar, mover un objeto, transformar un mensaje. Lambda los corre al ocurrir el evento, escala con la cantidad de eventos y se paga por invocación y duración, sin servidores encendidos esperando.

## 4. Cómo funciona

1. Un objeto nuevo en `raw/` dispara una notificación de S3.
2. S3 invoca la función de forma asíncrona con el bucket y la clave (codificada: se decodifica con `unquote_plus`).
3. La función lee el objeto, lo limpia y escribe el resultado en **otro prefijo** (`curated/`), con la misma clave relativa: un reintento reemplaza el objeto.
4. Si falla, Lambda reintenta dos veces; si sigue fallando, el evento va a la dead-letter queue.

## 5. Cuándo utilizarlo

- Validaciones y transformaciones chicas al llegar un archivo.
- Procesar mensajes de SQS o registros de Kinesis en lotes chicos.
- Pegamento entre servicios: iniciar un job, publicar una notificación.

## 6. Cuándo no utilizarlo

- Procesos de más de 15 minutos o con mucha memoria: Glue, EMR o contenedores.
- Transformaciones distribuidas de grandes volúmenes: Spark.
- Orquestar varios pasos con esperas y ramas: Step Functions (ver `step-functions-workflows`).

## 7. Ejemplo sencillo

Un proveedor deja `raw/ventas/dt=2026-10-01/lote 1.jsonl`. La función lee el archivo, descarta las líneas inválidas, redondea montos y escribe `curated/ventas/dt=2026-10-01/lote 1.jsonl`. Si S3 entrega el evento dos veces, el segundo intento escribe la misma clave.

## 8. Ejemplo de producción

Una cola de SQS recibe pedidos y una función los procesa en lotes de 10 con `ReportBatchItemFailures`:

- un mensaje inválido vuelve en `batchItemFailures` y solo él se reintenta;
- tras los intentos que fija la redrive policy, va a la dead-letter queue de la cola;
- la función escribe con una clave por pedido, así un reintento no duplica.

## 9. Arquitectura

```mermaid
flowchart LR
  S3R["s3://lake/raw/"] -- "notificación (asíncrona)" --> L["Lambda<br/>limpia y escribe"]
  L --> S3C["s3://lake/curated/<br/>misma clave relativa"]
  L -. "dos reintentos y luego" .-> DLQ["Dead-letter queue"]
  Q["SQS pedidos"] -- "event source mapping<br/>lotes" --> L2["Lambda<br/>batchItemFailures"]
  L2 -. "solo los fallidos" .-> Q
```

## 10. Código

```python
# Python 3.12 y boto3 (ejecutado en la CI: el handler de S3 contra moto, el de SQS con eventos de ejemplo; no se
# desplegó en Lambda). Dos handlers:
# - S3: un objeto nuevo en raw/ dispara la función, que escribe su versión limpia en curated/ con la misma clave
#   relativa (otro prefijo, para no volver a dispararse; un reintento reemplaza el objeto, no duplica).
# - SQS: con ReportBatchItemFailures, devuelve solo los mensajes que fallaron para que no se reintente el lote entero.
from __future__ import annotations

import json
import urllib.parse
from typing import TYPE_CHECKING, Any

import boto3

if TYPE_CHECKING:
    from mypy_boto3_s3 import S3Client

RAW, CURATED = "raw/", "curated/"


def clean(line: str) -> dict[str, Any] | None:
    """Una línea JSON válida con id y monto; las demás se descartan."""
    try:
        row = json.loads(line)
    except json.JSONDecodeError:
        return None
    if not isinstance(row, dict) or "id" not in row or not isinstance(row.get("monto"), (int, float)):
        return None
    return {"id": row["id"], "monto": round(float(row["monto"]), 2)}


def process_s3_event(event: dict[str, Any], s3: S3Client) -> list[str]:
    written: list[str] = []
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"], encoding="utf-8")
        if not key.startswith(RAW):
            continue  # defensa extra contra bucles: solo se procesa raw/
        body = s3.get_object(Bucket=bucket, Key=key)["Body"].read().decode("utf-8")
        rows = [r for r in (clean(line) for line in body.splitlines()) if r is not None]
        target = CURATED + key[len(RAW):]
        s3.put_object(Bucket=bucket, Key=target, Body="".join(json.dumps(r) + "\n" for r in rows).encode("utf-8"))
        written.append(target)
    return written


def s3_handler(event: dict[str, Any], context: object) -> list[str]:
    return process_s3_event(event, boto3.client("s3"))


def sqs_handler(event: dict[str, Any], context: object) -> dict[str, list[dict[str, str]]]:
    """Procesa cada mensaje; los que fallan vuelven en batchItemFailures (itemIdentifier = messageId)."""
    failures: list[dict[str, str]] = []
    for record in event["Records"]:
        try:
            if clean(record["body"]) is None:
                raise ValueError("mensaje inválido")
        except Exception:
            failures.append({"itemIdentifier": record["messageId"]})
    return {"batchItemFailures": failures}
```

El script en Python 3.12 con boto3 se **ejecuta en la CI**: el handler de S3 contra moto, que simula S3 (ADR-011), y el de SQS con un evento de ejemplo. Pasa `mypy --strict` con `boto3-stubs`. **No se desplegó en Lambda.** El test procesa dos veces el mismo evento, con una clave codificada (`dt%3D...`, `lote+1`) y un objeto de `curated/` que se ignora, y comprueba que queda un solo objeto limpio. El handler de SQS devuelve solo el mensaje inválido.

## 11. GCP

No aplica de forma específica: esta ficha describe Lambda. En GCP, lo más cercano para cargas de datos es Cloud Run (ver `cloud-run-for-data`), con otros límites y otro modelo de ejecución; no son lo mismo.

## 12. AWS

**AWS Lambda.** Las primitivas, las cuotas, los reintentos por tipo de invocación, la respuesta parcial de SQS, la advertencia de bucles con S3 y la detección de bucles recursivos son los de sus páginas. Los precios por solicitud y duración se consultan en la página de precios.

## 13. Azure

No aplica de forma específica.

## 14. Buenas prácticas

- Escribir en un prefijo o bucket distinto del que dispara la función.
- Claves de salida deterministas: un reintento reemplaza.
- `ReportBatchItemFailures` en SQS para no reintentar lotes completos.
- Timeout y memoria ajustados a lo que hace la función, no al máximo.
- **Seguridad:** cada función con su rol de IAM, con acceso solo a sus prefijos (ver `aws-iam-for-data`).
- **Observabilidad:** seguir errores, duración, throttling y, en streams, la antigüedad del iterador (Iterator Age), que muestra shards bloqueados.
- **Costo:** se paga por solicitud y por duración según la memoria; una función que espera a otro servicio paga esa espera. Los montos se consultan en la página de precios.

## 15. Errores frecuentes

- Escribir en el mismo bucket y prefijo que dispara la función.
- Usar la clave del evento sin decodificar y no encontrar el objeto.
- Lanzar una excepción por un solo mensaje y reintentar el lote completo de SQS.
- Un error persistente que bloquea un shard de Kinesis durante horas.

## 16. Trade-offs

Lambda arranca solo con el evento y escala sin servidores, a cambio de límites de tiempo, memoria y payload, y de reintentos que obligan a escribir código idempotente. Un contenedor o un job de Spark aguantan cargas largas y pesadas, con más que administrar.

## 17. Conceptos relacionados

- `event-driven-pipelines`: el patrón.
- `cloud-run-for-data`: lo más cercano en GCP.
- `idempotency`, `retries` y `dead-letter-queue`: eventos duplicados y fallidos.
- `s3-data-lake` y `kinesis-data-streams`: fuentes de eventos.
- `step-functions-workflows`: para encadenar pasos.
- `aws-iam-for-data`: el rol de la función.

## 18. Preguntas técnicas abiertas

1. ¿Qué paso de tu pipeline es corto y reactivo, y podría ser una función?
2. ¿Cómo garantizas que tu función no se dispare a sí misma?
3. ¿Qué haces con un mensaje que falla siempre?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- AWS, AWS Lambda Developer Guide: *What is AWS Lambda?*, *Lambda quotas*, *Understanding retry behavior in Lambda*, *Process Amazon S3 event notifications with Lambda*, *Tutorial: Using an Amazon S3 trigger*, *Use Lambda recursive loop detection*, *Using Lambda to process records from Amazon Kinesis Data Streams*, *Handling errors for an SQS event source* y *Best practices*; *AWS Lambda pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-12. `review_required`: pendiente de revisión B-F3.1 del lote F3b-09b.

## 22. Historial de cambios importantes

- 2026-10-12: creación (lote F3b-09b).
