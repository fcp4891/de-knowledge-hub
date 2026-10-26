# Revisión · mejora de `chile-data-protection`

Rama `b/review-cdp-v2`, creada desde `origin/main` (`e903f4a`). El texto nuevo entra en `75405df`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| La fila del art. 2 g) dice «hechos de la vida privada: entre otros» y nombra origen étnico o racial, afiliación política o sindical y situación socioeconómica. BCN (versión 2026-12-01) dice «hechos o circunstancias de su vida privada o intimidad, que revelen» esa lista y sigue con afiliación gremial, convicciones ideológicas o filosóficas, creencias religiosas, salud, perfil biológico humano, datos biométricos, vida sexual, orientación sexual e identidad de género. La letra no dice «entre otros». | media | Copiar el alcance de la letra g), o dejar los tres ejemplos y decir que la letra sigue con salud, biométricos y el resto, sin «entre otros». El detalle de detección sigue en `pii-identification`. |
| La fila del art. 2 l) dice que la información adicional queda «protegida». La letra exige que figure por separado y esté sujeta a medidas técnicas y organizativas. | baja | Usar «medidas técnicas y organizativas». |
| Sin otros hallazgos. El principio del art. 3 va como obligación; cada control, como decisión de arquitectura o buena práctica. `legal_basis`, vigencia, boletín, sanciones y los dos diagramas coinciden con la ficha anterior. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 622 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Lo que ya estaba verificado

Contra `75405df^`:

```
legal_basis equal True old 17 new 17
mermaid count 2 2 equal True
```

El frontmatter solo cambia `description`. El párrafo «Estado al 2026-10-25» del boletín 18.623-07 y el de sanciones son los mismos: «la más gravosa entre» el triple y el 2 % o el 4 %, y el atenuante del art. 36 n.º 5 con el certificado del art. 51.

## Definiciones del art. 2

Texto de BCN, versión 2026-12-01, consultado el 2026-10-26.

| Letra | Ficha | BCN |
|---|---|---|
| f) | Información vinculada o referida a una persona natural identificada o identificable, directa o indirectamente | «cualquier información vinculada o referida a una persona natural identificada o identificable». La identidad se determina «directa o indirectamente» |
| g) | Tres ejemplos y «entre otros» | Lista que revelan esos datos, más larga, sin «entre otros». Media |
| k) | Procedimiento irreversible: ya no puede vincularse ni permitir la identificación | Igual, y agrega que se destruyó el nexo y que el dato anonimizado deja de ser personal |
| l) | Información adicional guardada por separado y «protegida» | Por separado y con medidas técnicas y organizativas. Baja |
| n) | Decide fines y medios aunque lo ejecute un encargado | «decide acerca de los fines y medios», «directamente por ella o a través de un tercero mandatario o encargado» |
| o) | Cualquier operación, automatizada o no, con esos verbos | «cualquier operación o conjunto de operaciones o procedimientos técnicos, de carácter automatizado o no», con los mismos verbos |
| x) | Trata datos por cuenta del responsable | «persona natural o jurídica que trate datos personales, por cuenta del responsable de datos» |

## Principios del art. 3

El encabezado de la tabla es **[Obligación legal · art. 3]**. La etiqueta de cada fila está en el control:

```
a) Decisión de arquitectura
b) Decisión de arquitectura
c) Decisión de arquitectura
d) Buena práctica
e) Buena práctica
f) Buena práctica
g) Decisión de arquitectura
h) Buena práctica
```

Las preguntas no contradicen las letras. La de proporcionalidad pregunta por los campos; la letra también limita el plazo de conservación, y ese plazo sigue en las hijas.

## §10

`tests/test_compliance_snippets.py` compara el JSON del §10 con `tests/fixtures/privacy-control-results.json` y ejecuta el bloque con los argumentos de la fixture y `2026-10-26`. Exige código 1 y estas líneas:

```
controles exigidos: 4; resultados: 3; brechas: 4
BRECHA access_review: evidencia vencida (86 días)
BRECHA erasure_replay_check: sin resultado
BRECHA retention_check: prueba no aprobada (failed)
BRECHA retention_check: falta run_id o evidence_uri
```

La ficha imprime esas 4 brechas y dice que los 30 días son política interna, no un plazo legal. El comentario del código dice lo mismo.

## Alcance

El §7 y el §8 no nombran una nube ni una empresa: el caso es «una aerolínea» y el detalle queda en `data-minimization-by-layer`, `retention-and-erasure` y `data-subject-rights-pipeline`. El §11 a §13 siguen con los servicios de cada nube; respecto de la ficha anterior solo agregan que los Data Access audit logs se configuran por servicio y que esos servicios no son equivalencias exactas.
