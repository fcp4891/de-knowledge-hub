# Revisión B-F3.1 · upgrade de 19

Rama `b/f3b-review-19-upgrade`, en `main` (`e252e81`). Pedido en `docs/status/lane-a.md`. Los pedidos 19a–19d quedan anulados. Once fichas del subdominio «Ingeniería de datos y Ley 21.719». No se editó `content/` ni `frontend/`. Siguen en `review_required`.

Consulta del 2026-10-24. Ley 19.628, versión `idVersion=2026-12-01`. Ley 21.663, idNorma 1202434. Decreto 295, idNorma 1211466. Decreto 662, idNorma 1227971 (`fechaPromulgacion=2025-06-13`, `fechaPublicacion=2026-09-09`). Boletín: la página de tramitación y el mensaje N° 110-374.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| El mapa de `chile-data-protection` y el paso 5 de `privacy-controls-as-code` etiquetan el art. 49 como **[Obligación legal]**. El art. 49 y el art. 1 del Decreto 662 dicen que el modelo se adopta voluntariamente. | alta | Quitar «Obligación legal» del art. 49. El deber de prevenir está en el art. 48. |
| En `data-minimization-by-layer`, el paso 3 etiqueta «gold suprime los grupos de menos de 2 clientes» como **[Obligación legal · art. 14 quáter]**. El artículo no fija un mínimo de personas por grupo. | alta | Dejar ese paso como **[Decisión de arquitectura]**. |
| En `data-breach-response`, el registro del art. 14 sexies «se lleva aunque no se reporte». El artículo manda registrar las comunicaciones a la Agencia, no un registro de lo que no se reportó. | alta | Decir que se registran las comunicaciones hechas a la Agencia. |
| El art. 35 permite, en reincidencia de una empresa que no es de menor tamaño, «la más gravosa entre» el triple y el 2 % / 4 %. La ficha padre enuncia las dos cifras seguidas, sin esa alternativa. | media | Añadir «la más gravosa entre». |
| El mapa agrupa artículos y pone una sola etiqueta: 4 a 11, 12 y 13, 15 y 15 bis, 16 a 16 sexies, 27 y 28, 34 bis a 35, 49 a 53. | media | Una etiqueta por artículo, o que la etiqueta nombre solo el artículo que cita. |
| `plazos_ley_21663` usa 24 h si `operador_vital` es verdadero. El art. 9 y el art. 10 del Decreto 295 exigen, además, que estén afectados los servicios esenciales. El texto de la ficha sí lo dice. Los 7 días son solo del operador de importancia vital, y el ejemplo impreso es el caso no vital. | media | Un segundo parámetro para servicios esenciales afectados. |
| En `chilean-identifier-pseudonymization`, el paso 3 etiqueta `HMAC-SHA-256` y el KMS como **[Obligación legal · art. 2]**. El art. 2 letra l define la información adicional por separado. No nombra el algoritmo. En `data-minimization-by-layer`, el HMAC y el tramo de edad van en el mismo paso que el art. 3. | media | Dejar el algoritmo como **[Decisión de arquitectura]**. |
| `chilean-identifier-pseudonymization` dice que los resultados de estudios con datos de salud «se publican anonimizados» (art. 16 bis c). La ley dice que pueden publicarse y que, para ello, se anonimizan antes. | baja | «Si se publican, van anonimizados». |

## Fragmentos

**Art. 34 ter k) y m).** «k) Omitir las comunicaciones o los registros en los casos de vulneración de las medidas de seguridad establecidas en el artículo 14 quinquies.» «m) Realizar operaciones de transferencia internacional de datos en contravención a las normas previstas en esta ley.»

**Art. 34 quáter f), h) y k).** «f) Omitir en forma deliberada la comunicación de las vulneraciones a las medidas de seguridad que puedan afectar la confidencialidad, disponibilidad o integridad de los datos personales.» «h) Realizar, a sabiendas, operaciones de transferencia internacional de datos en contravención a las normas previstas en esta ley.» «k) Incumplir la obligación establecida en el artículo 15 ter, en los casos que corresponda.»

**Art. 35.** «la Agencia podrá aplicar una multa de hasta tres veces el monto asignado a la infracción cometida. […] la multa podrá alcanzar a la más gravosa entre la señalada en el inciso anterior o hasta el monto correspondiente al 2% o 4% de los ingresos anuales […] según se trate de infracciones graves o gravísimas». Los topes de las letras a), b) y c) son 5.000, 10.000 y 20.000 UTM. La leve admite amonestación escrita.

**Art. 49.** «Los responsables de datos podrán voluntariamente adoptar un modelo de prevención de infracciones».

**Art. 48.** «deberán adoptar acciones destinadas a prevenir la comisión de las infracciones establecidas en los artículos 34 bis, 34 ter y 34 quáter.»

**Decreto 662, art. 1.** «podrán adoptar e implementar, voluntariamente, un modelo de prevención de infracciones.» Encabezado: «Santiago, 13 de junio de 2025.» Metadatos BCN: promulgación 2025-06-13, publicación 2026-09-09.

**Art. 14 sexies.** Reporta a la Agencia «sin dilaciones indebidas» cuando hay «un riesgo razonable». «El responsable deberá registrar estas comunicaciones». También comunica a los titulares si hay datos sensibles, de niños y niñas menores de catorce años o de obligaciones económicas, financieras, bancarias o comerciales.

**Art. 14 quáter.** «por defecto, sólo sean objeto de tratamiento los datos personales específicos y estrictamente necesarios […] el número de datos recogidos, la extensión del tratamiento, el plazo de conservación y su accesibilidad.»

**Art. 2 l).** «Seudonimización: […] información adicional figure por separado y esté sujeta a medidas técnicas y organizativas».

**Art. 16 bis c).** «Los resultados de los estudios e investigaciones científicas […] pueden ser publicados o difundidos libremente. Para ello deberán previamente anonimizarse los datos que se publiquen.»

**Art. 11.** «pronunciarse a más tardar dentro de los treinta días corridos […] prorrogado, por una sola vez, hasta por treinta días corridos.» «El responsable deberá responder al requerimiento [de bloqueo] dentro de los dos días hábiles […] En tanto no resuelva […] no podrá tratar los datos». «cuando el responsable haya comunicado dichos datos a otras personas, deberá comunicar a éstas los cambios realizados en virtud de la rectificación, supresión u oposición.»

**Ley 21.663, art. 9.** Alerta «dentro del plazo máximo de tres horas contado desde que se tiene conocimiento». Actualización «dentro del plazo máximo de setenta y dos horas». «si la institución afectada fuera un operador de importancia vital y éste viera afectada la prestación de sus servicios esenciales […] veinticuatro horas». Informe final: «quince días corridos contado desde el envío de la alerta temprana». «Los operadores de importancia vital deberán, además, informar […] su plan de acción […] en ningún caso podrá ser superior a siete días corridos».

**Decreto 295, arts. 10 y 11.** El segundo reporte es a las setenta y dos horas, o a las veinticuatro «si la institución afectada fuera un operador de importancia vital y éste viera afectada la prestación de sus servicios esenciales». El plan de esos operadores, «en ningún caso, podrá ser superior siete días corridos».

**Página del Senado, 2026-10-24** (`boletin_ini=18623-07`). H1 «Boletín 18623-07». Título: «Modifica la ley N° 21.719 […] en el sentido que indica». Ingreso: «Martes 1 de Septiembre, 2026». Urgencia actual: «Discusión inmediata». Etapa: «Primer trámite constitucional (Senado)» y «Primer informe de comisión de Constitución, Legislación, Justicia y Reglamento». Última fila de la grilla: «21/10/2026 Cuenta del Mensaje 397-374 que retira y hace presente la urgencia Discusión inmediata». La grilla no tiene una votación en general.

**Mensaje N° 110-374** (PDF del Senado, iddocto 19307). «El numeral 2 modifica el artículo primero transitorio, postergando hasta el 1 de diciembre de 2027 la entrada en vigencia de las modificaciones introducidas por la ley N° 21.719.» También: «aumentando de tres a cinco el número de consejeros» y, sobre el sexto transitorio, «se elimina dicha limitación» a las empresas de menor tamaño. Es proyecto. La ficha lo dice así y mantiene el 2026-12-01 mientras no se publique otra ley.

## Por ficha

### `chile-data-protection`

| Punto | Resultado |
|---|---|
| Vigencia 2026-12-01 y postergación al 2027-12-01 solo como proyecto | Coincide con BCN y con el numeral 2 del mensaje |
| Urgencia, primer trámite y primer informe | Coinciden con la página del Senado al 2026-10-24, incluida la cuenta del 21/10/2026 |
| 34 ter k) y m); 34 quáter f) y k); topes de 5.000 / 10.000 / 20.000 UTM | Coinciden |
| Triple y 2 % / 4 % | Media: falta «la más gravosa entre» |
| Art. 49 etiquetado como obligación | Alta |
| Una etiqueta para un rango de artículos | Media |
| Decreto 662: título, 2025-06-13 y 2026-09-09 | Coinciden |
| Fuentes y enfoque | Nivel 1. Ninguna N3. Sin consultoras. El caso de pasajes queda como ejemplo |

### `processing-activities-inventory`

| Punto | Resultado |
|---|---|
| Art. 3 a) y b), arts. 12 y 13, art. 14 a) y 14 ter | Las bases y la carga de la prueba están en esos artículos |
| 34 ter a): tratar sin base o con otra finalidad es grave | La letra a) lo dice |
| Ejemplo de pasajes y aerolíneas socias | Caso aceptado |
| Snippet | Código 1. El test exige las líneas de pasajes, `gold.score_fraude` y el uso no registrado |

### `data-subject-rights-pipeline`

| Punto | Resultado |
|---|---|
| Arts. 4 a 11: los seis derechos | Esos artículos existen |
| Art. 11: 30 días corridos, una prórroga de 30, bloqueo en 2 días hábiles y sin tratar mientras no se resuelva | El artículo lo dice |
| Art. 10: rectificación, supresión y oposición gratuitas; acceso gratuito al menos cada trimestre | El artículo lo dice |
| Alias `data-subject-requests` | Apunta a esta ficha. No queda el archivo viejo |

### `retention-and-erasure`

| Punto | Resultado |
|---|---|
| Art. 3 c), art. 2 h), art. 14 d) y art. 15 bis | Conservar el tiempo necesario, destrucción cualquiera sea el procedimiento, datos precontractuales, y suprimir o devolver al terminar |
| Art. 7: la conservación por obligación legal es una excepción | La excepción ii) lo dice. El ejemplo no inventa un plazo tributario |
| Art. 11: comunicar la supresión a quien recibió los datos | El artículo lo dice, para los cambios por rectificación, supresión u oposición |
| Alias `erasure-across-copies` | Apunta a esta ficha |

### `data-breach-response`

| Punto | Resultado |
|---|---|
| 14 sexies: reporte y aviso a titulares (sensibles, menores de 14, obligaciones económicas, financieras, bancarias o comerciales) | El artículo lo dice |
| «se lleva aunque no se reporte» | Alta. El registro es de las comunicaciones |
| 34 ter k) y 34 quáter f) | Las letras lo dicen. La k) también nombra las comunicaciones y las ata al art. 14 quinquies |
| 3 h, 72 h, 15 días; 24 h y 7 días | El texto lo dice. Los 24 h piden además servicios esenciales afectados. Los 7 días son del operador de importancia vital |
| Rama `operador_vital=True` | Media: pone 24 h sin ese segundo requisito |
| Ejemplo impreso (`operador_vital=False`) | Alerta 2026-10-22T12:40, actualización 2026-10-25T09:40, informe 2026-11-06T12:40. Sin plan de 7 días |
| Alias `personal-data-breach-readiness` | Apunta a esta ficha |

### `dpia-and-automated-decisions`

| Punto | Resultado |
|---|---|
| Art. 15 ter a) a d) | Las cuatro letras existen. El umbral de gran escala del ejemplo es interno |
| 34 quáter k) | Remite al art. 15 ter |
| Art. 8 bis | Oposición y, en todos los casos, explicación, intervención humana y revisión |
| Aliases `dpia-technical-input` y `automated-decision-traceability` | Los dos apuntan a esta ficha |

### `processors-and-international-transfers`

| Punto | Resultado |
|---|---|
| Arts. 2 v) y x), 15, 15 bis, 27 y 28 | Encargo, cesión, supresión o devolución, mecanismos de transferencia y listado que publica la Agencia. La ficha no supone países |
| 34 ter m) y 34 quáter h) | Grave, y gravísima si es a sabiendas |
| API de un LLM | Encargo y posible transferencia. Sin consultoras |
| Alias `international-data-transfers` | Apunta a esta ficha |
| Snippet | Código 1. El test exige las tres brechas, incluida la API de LLM hacia US |

### `privacy-controls-as-code`

| Punto | Resultado |
|---|---|
| Art. 14 quinquies d) y art. 14 quáter | Verificación regular, y por defecto solo los datos necesarios |
| Paso 5, etiqueta **[Obligación legal · art. 49]** | Alta. El párrafo dice «si se adopta», que sí coincide con el art. 49 y con el Decreto 662 |
| Alias `privacy-by-design-checklist` | Apunta a esta ficha |
| Snippet | Código 1. El test exige `SELECT *`, el contrato sin `base_licitud` y la PII en claro en el log |

### `chilean-identifier-pseudonymization`

| Punto | Resultado |
|---|---|
| Art. 2 k) y l); art. 14 quinquies a) | Irreversible y deja de ser dato personal; información adicional separada; seudonimización y cifrado entre las medidas |
| Paso 3, HMAC como obligación del art. 2 | Media |
| Art. 16 bis c) | Baja: la publicación es facultativa |
| Art. 26 | Un reglamento regulará los procedimientos de anonimización, en especial los sensibles |
| Slug | Se mantiene |
| Snippet | El test exige el hash simple revertido, el HMAC sin la clave y los grupos únicos a suprimir |

### `pii-identification`

| Punto | Resultado |
|---|---|
| Art. 2 f) y g); art. 16 | Identificada o identificable con medios razonables; lista de sensibles, incluida la situación socioeconómica; consentimiento expreso salvo las excepciones |
| Slug | Se mantiene |
| Snippet | El test exige el RUT con DV, los dos sensibles y los dos falsos negativos |

### `data-minimization-by-layer`

| Punto | Resultado |
|---|---|
| Art. 3 c) y art. 14 quáter, en las definiciones | Necesarios, adecuados y pertinentes; por defecto, solo los estrictamente necesarios |
| Paso 3, grupos de menos de 2 | Alta |
| Paso 2, HMAC y tramo de edad | Media. «Solo las columnas necesarias» sí es el art. 3 |
| Snippet | El test exige bronze con 10 valores en claro, silver y gold en 0, y `gold: [('Maipú', 2), ('Ñuñoa', 2)]`. En esta máquina no corrió: PostgreSQL no respondió |

## Validación

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`.

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 588 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

Los tres avisos son de fichas de Spark.

## Comprobaciones

Relaciones, §14 y aviso:

```
chile-data-protection rel_miss=[] sec14=True aviso=True
processing-activities-inventory rel_miss=[] sec14=True aviso=True
data-subject-rights-pipeline rel_miss=[] sec14=True aviso=True
retention-and-erasure rel_miss=[] sec14=True aviso=True
data-breach-response rel_miss=[] sec14=True aviso=True
dpia-and-automated-decisions rel_miss=[] sec14=True aviso=True
processors-and-international-transfers rel_miss=[] sec14=True aviso=True
privacy-controls-as-code rel_miss=[] sec14=True aviso=True
chilean-identifier-pseudonymization rel_miss=[] sec14=True aviso=True
pii-identification rel_miss=[] sec14=True aviso=True
data-minimization-by-layer rel_miss=[] sec14=True aviso=True
```

Aliases. `archivo False` es el slug eliminado; `en` es la ficha que lo declara.

```
erasure-across-copies archivo False en ['retention-and-erasure']
international-data-transfers archivo False en ['processors-and-international-transfers']
privacy-by-design-checklist archivo False en ['privacy-controls-as-code']
dpia-technical-input archivo False en ['dpia-and-automated-decisions']
automated-decision-traceability archivo False en ['dpia-and-automated-decisions']
data-subject-requests archivo False en ['data-subject-rights-pipeline']
personal-data-breach-readiness archivo False en ['data-breach-response']
compliance-scope-for-data-engineers archivo False en ['chile-data-protection']
```

Fuentes de las once, leídas de `content/sources/registry.yaml`: todas `authority_level` 1. `bcn-leychile` y `senado-tramitacion` son `legislative`. `N3_o_N5 []`. `missing []`.

`.\.venv\Scripts\python.exe -m pytest tests/test_compliance_snippets.py --tb=no -q -rs`:

```
..........s                                                              [100%]
SKIPPED [1] tests\test_compliance_snippets.py:126: PostgreSQL no disponible: ConnectionTimeout
```

Diez ejemplos pasaron: seis de biblioteca estándar y cuatro puertas. Esas cuatro terminan con código 1 y el test lo exige. `data-minimization-by-layer` no corrió aquí porque PostgreSQL no respondió. Las líneas que el test exige están en `tests/test_compliance_snippets.py`.
