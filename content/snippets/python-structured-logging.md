---
id: code_snippet:python-structured-logging
slug: python-structured-logging
type: code_snippet
title: Logging estructurado en JSON con run_id y redacción de secretos
description: "Configuración de logging (solo biblioteca estándar) que escribe una línea JSON por evento a stdout, agrega el run_id a todos los eventos y reemplaza los campos sensibles antes de escribirlos."
language: python
dialect: python3.12
requirements:
  - "Python 3.12, solo biblioteca estándar."
  - "Guardar el código como logging_setup.py y llamar a configure_logging(run_id) una sola vez en el punto de entrada del job; los módulos usan logging.getLogger(__name__)."
  - "Una plataforma que recoja stdout (Cloud Run, GKE, contenedores con agente de logs) o cualquier destino que lea JSON por líneas."
classification: core
level: intermediate
cloud: [agnostic]
technologies: [python]
tags: [python, logging, observability, security]
related_topics: [python-logging, data-pipeline]
sources:
  - source: python-docs
    url: https://docs.python.org/3/library/logging.html
    accessed: 2026-10-04
    note: "Los filtros pueden modificar los LogRecord en el lugar; los filtros de un handler se consultan antes de que el handler emita el evento, mientras que los de un logger no se aplican a eventos de loggers descendientes. basicConfig con handlers y force=True quita y cierra los handlers existentes del root antes de configurar. getLogger(__name__) es la construcción recomendada. Las claves de extra no deben chocar con los atributos de LogRecord."
  - source: python-docs
    url: https://docs.python.org/3/howto/logging-cookbook.html
    accessed: 2026-10-04
    note: "Un Filter definido por el usuario puede agregar información de contexto a los LogRecord (atributos adicionales que luego usa el formatter); ejemplo de logging estructurado serializado en JSON. Desde Python 3.7, contextvars da almacenamiento local al contexto, útil tanto con hilos como con asyncio."
  - source: gcp-cloud-logging-docs
    url: https://docs.cloud.google.com/logging/docs/structured-logging
    accessed: 2026-10-04
    note: "Un payload JSON guardado en jsonPayload es un log estructurado, consultable por rutas JSON; en GKE, App Engine flexible y Cloud Run functions, un agente integrado envía stdout y stderr a Cloud Logging."
relations:
  - type: IMPLEMENTS
    target: python-logging
    note: Logger por módulo, configuración única en el punto de entrada, JSON por línea y regla explícita de qué no se registra.
  - type: RELATED_TO
    target: data-pipeline
    note: El run_id correlaciona todos los eventos de una ejecución del pipeline.
created_at: 2026-10-04
updated_at: 2026-10-05
last_verified: 2026-10-05
verification_status: verified
---

## 1. Qué resuelve

Deja listo el logging de un job de datos en un solo archivo:

- cada evento es **una línea JSON** en stdout, que Cloud Logging, CloudWatch o Log Analytics pueden consultar por campo;
- **todos** los eventos llevan el `run_id` de la ejecución, aunque los emita un módulo que no lo conoce;
- los campos sensibles que lleguen por `extra` (`token`, `password`, etc.) se escriben como `[REDACTED]`.

Es el código de la sección 10 de `python-logging`, completado con contexto y redacción.

## 2. Código

```python
# logging_setup.py · Python 3.12, solo biblioteca estándar: una línea JSON por evento a stdout,
# con run_id en todos los eventos y redacción de campos sensibles pasados en extra.
import json
import logging
import sys
from datetime import UTC, datetime

STANDARD = set(vars(logging.makeLogRecord({}))) | {"message", "asctime"}  # atributos propios de LogRecord
SENSITIVE = {"token", "password", "secret", "authorization", "api_key"}  # nunca salen en claro


class RunContextFilter(logging.Filter):
    """Agrega run_id a cada registro y reemplaza los campos sensibles antes de formatear."""

    def __init__(self, run_id: str) -> None:
        super().__init__()
        self.run_id = run_id

    def filter(self, record: logging.LogRecord) -> bool:
        setattr(record, "run_id", self.run_id)  # LogRecord no declara run_id: setattr pasa un chequeo de tipos estricto
        for key in SENSITIVE.intersection(vars(record)):
            setattr(record, key, "[REDACTED]")
        return True  # no descarta: solo modifica el registro


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "severity": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        entry.update({k: v for k, v in vars(record).items() if k not in STANDARD})  # run_id y campos de extra
        if record.exc_info:
            entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(entry, ensure_ascii=False, default=str)


def configure_logging(run_id: str, level: str = "INFO") -> None:
    """Se llama una vez, en el punto de entrada (nunca en una biblioteca)."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    handler.addFilter(RunContextFilter(run_id))  # en el handler: cubre los registros de todos los módulos
    logging.basicConfig(level=level, handlers=[handler], force=True)


if __name__ == "__main__":
    configure_logging(run_id="2026-10-04T02:00:00Z")
    log = logging.getLogger("ingest.orders")
    log.info("lote recibido", extra={"batch_id": "2026-10-03", "rows": 1200})
    log.warning("reintento", extra={"attempt": 2, "token": "abc123"})  # token sale como [REDACTED]
```

Salida:

```text
{"timestamp": "...", "severity": "INFO", "logger": "ingest.orders", "message": "lote recibido", "batch_id": "2026-10-03", "rows": 1200, "run_id": "2026-10-04T02:00:00Z"}
{"timestamp": "...", "severity": "WARNING", "logger": "ingest.orders", "message": "reintento", "attempt": 2, "token": "[REDACTED]", "run_id": "2026-10-04T02:00:00Z"}
```

## 3. Cómo funciona

1. **Filtro en el handler, no en un logger:** según la documentación de `logging`, los filtros de un handler se consultan antes de emitir cualquier evento que llegue a él, mientras que el filtro de un logger no se aplica a los eventos de sus descendientes. Con el filtro en el handler del root, `ingest.orders`, `ingest.api` o cualquier biblioteca reciben el mismo tratamiento.
2. **Contexto:** el filtro agrega `run_id` al `LogRecord`, como en el patrón del cookbook de "filtros para agregar información de contexto".
3. **Redacción:** antes de formatear, el filtro reemplaza el valor de cualquier atributo cuyo nombre esté en `SENSITIVE`. Devuelve `True`, así que no descarta eventos.
4. **Formato:** el `JsonFormatter` escribe los campos fijos, el `run_id`, los de `extra` y, si hay excepción, el traceback, todo en una línea JSON.

Configurar dos veces es seguro: `force=True` quita y cierra los handlers existentes del root antes de agregar el nuevo, en vez de duplicarlos.

## 4. Cuándo usarlo

- Jobs de ingesta o transformación en Python que corren en contenedores, Cloud Run o GKE y escriben a stdout.
- Cuando hay que seguir una ejecución completa por `run_id` en la plataforma de logs.
- Cuando los mismos campos (`batch_id`, `attempt`) se usan para métricas y alertas derivadas de logs.

## 5. Cuándo no usarlo

- En una biblioteca: las bibliotecas no configuran handlers; dejan eso a la aplicación.
- Si la plataforma ya provee un formateador o un cliente de logging con integración propia y el equipo lo adopta: usar uno, no dos.
- En servicios concurrentes donde cada petición tiene su propio identificador: el `run_id` fijo del filtro no alcanza; hace falta contexto por petición (por ejemplo, con `contextvars`).

## 6. Riesgos

- **Redacción parcial:** solo cubre atributos pasados por `extra` con esos nombres exactos. Un secreto dentro del **texto** del mensaje, de una URL o de un traceback no se redacta; la regla sigue siendo no registrarlo.
- **Nombres de campos:** `severity`, `timestamp` y los demás son elección del equipo; revisar las convenciones de campos especiales de la plataforma antes de fijarlos.
- **Seguridad:** ampliar `SENSITIVE` con los nombres propios del dominio (`rut`, `email`) si se registran en algún `extra`; los logs tienen más lectores y retención que los datos de origen.
- **Costo:** cada línea se ingiere y se retiene; no registrar una línea por fila procesada ni dejar `DEBUG` en producción.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Ejecutar `python logging_setup.py` muestra las dos líneas de ejemplo. En el job, llamar a `configure_logging(run_id)` al inicio (el orquestador puede pasar el identificador de la ejecución) y usar `logging.getLogger(__name__)` en cada módulo.

## 8. Conceptos relacionados

- `python-logging`: el concepto que implementa.
- `data-pipeline`: correlación de eventos de una ejecución.

## 9. Fuentes

- Python: *logging — Logging facility for Python* y *Logging Cookbook*.
- Google Cloud: *Structured logging* (Cloud Logging).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-04: creación (propuesta aprobada tras el lote 5), desde la sección 10 de `python-logging` con `run_id` y redacción.
- 2026-10-05: revisión B-F3.2 (`docs/reviews/snippets-3.md`) aplicada: `setattr` para `run_id`. `verification_status: verified` (sin VERIFY pendientes).
