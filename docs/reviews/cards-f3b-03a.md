# Revisión B-F3.1 · Lote F3b-03a

Fichas en `content/concepts/`. Carril B no las edita. Las diez están en `review_required`. No hay comentarios `VERIFY`. Las filas quedan en pendiente hasta que Felipe las apruebe.

Las 10: `python-data-structures`, `python-comprehensions`, `python-functions`, `python-typing`, `python-classes`, `python-exceptions`, `python-context-managers`, `python-iterators`, `python-generators` y `python-file-handling`.

Volví a ejecutar los bloques de Python de §7 y §10 con Python 3.12.3 y `mypy --strict` (mypy 2.4.0) el 2026-10-08.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | Los 20 bloques corren. Los diez de §10 pasan `mypy --strict`. El §7 de `python-typing` termina en `TypeError` dentro de `sum` y mypy marca los dos `[list-item]` que dice la ficha. El §7 de `python-exceptions` termina en `RuntimeError: monto inválido en la línea 3` y mypy no lo objeta. El §7 de `python-generators` corre, pero `mypy --strict` lo rechaza: falta el tipo de retorno (`no-untyped-def`). Propuesta: anotar `-> Iterator[int]` en `pares`. | pendiente |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | pendiente |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. La documentación de Python y la de cada nube están en notas Nivel 1. | pendiente |
| Documentación de Python por versión | Todas las URLs de Python son `docs.python.org/3/`. El 2026-10-08 esa ruta es la documentación de **3.14.8**. El código se ejecutó con **3.12.3**. `os.replace` dice lo mismo en la página de 3.12 y en la de 3.14.8. Varias notas ya separan versiones: `strict` de `batched` en 3.13, `newline` de `Path.write_text` en 3.13, `SyntaxWarning` del `finally` desde 3.14. Propuesta: citar `/3.12/` en lo que se ejecutó con 3.12, y dejar `/3/` o `/3.14/` solo en la frase del `SyntaxWarning`, que la página de 3.12 no trae. | pendiente |

## `python-data-structures`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué estructura, cuándo sí y cuándo no, memoria, y las tres viñetas de §14 están. §11–13 dicen que no aplica de forma específica. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `dict`, `set` y el orden de inserción están en notas de la documentación de Python. La versión de la URL está en los criterios heredados. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Deduplicar eventos por `event_id` y agregar por clave es un uso habitual. | pendiente |
| Relaciones faltantes | `python-comprehensions`, `deduplication` y `python-typing` están en `relations`. | pendiente |

## `python-comprehensions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué comprime, cuándo sí y cuándo no, memoria de la list comprehension frente a la generator expression, y §14 están. §11–13 no aplican de forma específica. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | La sintaxis está en notas del tutorial, de las expresiones y del howto funcional. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Filtrar filas y sumar sin lista intermedia es un uso habitual. | pendiente |
| Relaciones faltantes | `python-data-structures`, `python-generators` y `data-transformation` están en `relations`. | pendiente |

## `python-functions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Argumentos, valor por defecto, cuándo sí y cuándo no, y §14 están. §11–13 no aplican de forma específica. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | El valor por defecto mutable, los parámetros solo por nombre y `partial` están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Un default que es una lista y acumula entre llamadas es el fallo habitual. | pendiente |
| Relaciones faltantes | `python-typing`, `testing-with-pytest` y `data-transformation` están en `relations`. | pendiente |

## `python-typing`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué verifica mypy, qué no hace el runtime, cuándo sí y cuándo no, y §14 están. §11–13 no aplican de forma específica. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `Literal`, `NewType`, `TypedDict`, `Protocol` y las dataclasses están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El §7 falla al ejecutar, como dice la ficha, y mypy reporta los dos `[list-item]`. El §10 pasa `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Un JSON crudo de `str` y un registro validado aparte es la frontera habitual de un pipeline. | pendiente |
| Relaciones faltantes | `data-validation-with-pydantic`, `python-classes` y `data-contracts` están en `relations`. | pendiente |

## `python-classes`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Dataclass frente a clase, cuándo sí y cuándo no, `frozen` y `slots`, y §14 están. §11–13 no aplican de forma específica. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dataclasses y el modelo de datos están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Un registro inmutable y un cliente con buffer son un uso habitual. | pendiente |
| Relaciones faltantes | `python-typing`, `python-data-structures` y `data-validation-with-pydantic` están en `relations`. | pendiente |

## `python-exceptions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Jerarquía, `raise ... from`, notas, `ExceptionGroup`, cuándo sí y cuándo no, y §14 están. §11–13 no aplican de forma específica, con el piso 3.11. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | La nota del tutorial dice que el `SyntaxWarning` del `finally` es desde 3.14, y la de excepciones sitúa `add_note` y `ExceptionGroup` en 3.11. El ejemplo se ejecutó con 3.12. La URL `/3/` es la de 3.14.8: la propuesta de versión está en los criterios heredados. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El §7 termina en el `RuntimeError` que describe. El §10 pasa `mypy --strict`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Traducir un `ValueError` de un monto y agrupar los inválidos de un lote es un uso habitual. | pendiente |
| Relaciones faltantes | `python-error-handling-and-retries`, `python-logging` y `dead-letter-queue` están en `relations`. | pendiente |

## `python-context-managers`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | `with`, context manager propio, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `with`, `__exit__`, `contextmanager`, `ExitStack` y `mkstemp` están en notas Nivel 1. La §11 dice que Cloud Storage no es un sistema de archivos local y que el patrón no se aplica tal cual. Esta ficha no cita una página de Cloud Storage. Propuesta: quitar esa frase. El sistema de archivos de cada runtime queda en `python-file-handling`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La página de `os.replace` de Python 3.12 dice: si tiene éxito, el renombrado es una operación atómica (requisito de POSIX); puede fallar si `src` y `dst` están en sistemas de archivos distintos. La ficha dice «atómico en POSIX» y, en la §15, que entre volúmenes «puede fallar o dejar de ser atómico». La página no dice que deje de ser atómico. El comentario del §10 condiciona la atomicidad a estar en el mismo sistema de archivos. Se ejecutó en Windows (NTFS); esa ejecución no es la garantía de la página. Propuesta: repetir la frase de la página y quitar «deja de ser atómico». | pendiente |
| Ejemplos poco realistas | Un CSV que otro proceso lee, y que un fallo a mitad deje la versión anterior, es un fallo habitual. | pendiente |
| Relaciones faltantes | `python-file-handling`, `python-exceptions` e `idempotency` están en `relations`. | pendiente |

## `python-iterators`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Protocolo, agotamiento, `batched`, versión del runtime, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `batched` desde 3.12 y `strict` desde 3.13 están en la nota de `itertools`. Cloud Run (`python312`, deprecación 2028-10-02, también `python313` y `python314`), Lambda (`python3.12`, deprecación proyectada 31 de octubre de 2028) y Azure Functions (cambiar la versión no reconstruye dependencias) repiten la nota de cada página. No se mezclan entre nubes. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. El §10 usa `batched` sin `strict`, compatible con 3.12. No marco otro error. | pendiente |
| Ejemplos poco realistas | Paginar una API y recorrer el iterador dos veces es un fallo habitual. | pendiente |
| Relaciones faltantes | `python-generators`, `python-comprehensions` y `batch-ingestion` están en `relations`. | pendiente |

## `python-generators`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué produce, cuándo sí y cuándo no, memoria constante, y §14 están. §11–13 no aplican de forma específica y remiten a `python-file-handling`. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Generadores, `yield` y `batched` (3.12) están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El §10 pasa `mypy --strict`. El §7, `def pares(limite: int)`, corre y mypy lo rechaza por falta de retorno. La propuesta está en los criterios heredados. | pendiente |
| Ejemplos poco realistas | Un archivo de ventas leído en flujo y cortado en lotes es un uso habitual. | pendiente |
| Relaciones faltantes | `python-iterators`, `python-file-handling` y `data-pipeline` están en `relations`. | pendiente |

## `python-file-handling`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Encoding, CSV, escritura, disco de cada nube, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Encoding, `newline=""`, `pathlib` y `os.replace` están en notas de Python. Cloud Run, en la página del contrato del contenedor: sistema de archivos en memoria, lo escrito usa la memoria de la instancia, no persiste al detenerse, no tiene límite de tamaño y puede agotar la memoria; la página propone un volumen en memoria con límite. Lambda: `/tmp` de 512 MB a 10.240 MB, como alternativa a procesar en memoria. Azure Functions: `tmp/` sin persistencia garantizada. Cada frase queda en la sección de su nube. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §7 y §10 pasan `mypy --strict`. La §4 dice que, si tiene éxito, el renombrado «es atómico en POSIX». La §15 dice que entre volúmenes `os.replace` «falla o deja de ser atómico». La página de 3.12 dice que, si tiene éxito, es una operación atómica (requisito de POSIX), y que puede fallar entre sistemas de archivos distintos. Se ejecutó en Windows (NTFS). Propuesta: la misma que en `python-context-managers`, repetir la frase de la página. | pendiente |
| Ejemplos poco realistas | Un CSV con eñes y una salida que no debe quedar truncada son fallos habituales. | pendiente |
| Relaciones faltantes | `file-ingestion`, `csv-format` y `python-context-managers` están en `relations`. | pendiente |
