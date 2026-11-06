# Revisión DSR · §10 de data-subject-rights-pipeline

Base: `0efcacb` (`main`). Rama `b/review-dsr`. Solo lectura de `content/`. La ficha está en `review_required`. Estado de la revisión: pendiente.

BCN leída el 2026-11-06: Ley 19.628, versión «Con Vigencia Diferida por Fecha» desde 2026-12-01, `https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01`.

## Corrida

**Hallazgo.** Los cuatro escenarios imprimen el bloque `text` documentado y salen con el código previsto.

**Severidad.** Ninguna.

**Evidencia.** `tests/test_compliance_snippets.py`, `RIGHTS_SCENARIOS` (línea 460): `acceso` 0, `rectificacion` 1, `bloqueo` 0, `reintento` 0. El test compara `stdout.strip()` con el cuerpo del bloque (después de la línea `$`) y el `returncode`. Corrida el 2026-11-06, exit code 0:

```text
PASSED tests/test_compliance_snippets.py::test_rights_pipeline_each_scenario_prints_its_documented_output
PASSED tests/test_compliance_snippets.py::test_rights_pipeline_rules
```

## Lo que enseña

**Hallazgo.** El §10 muestra plazos con versión, el acceso armado desde el catálogo, la portabilidad vacía con contrato y con datos cuando la base es consentimiento, la rectificación que gana el backfill, el bloqueo como flag que excluye y deja el dato, la oposición acotada a una actividad, la sonda que lee el destino y la idempotencia por solicitud, destino y operación.

**Severidad.** Ninguna.

**Evidencia.** En `acceso`: `plazos-2026.1`, respuesta `2026-11-28`, prórroga `2026-12-28`, las dos líneas del art. 5, `portabilidad … c3d3a94d7560c6ae: []` y `… 7e1f04b2a9d35c18: ['silver.preferencias']`. En `rectificacion`: `aplicada (capa de correcciones)`, `la capa de correcciones gana`, `aerolinea_socia pendiente`, cierre 1. En `bloqueo`: `flag de bloqueo aplicado el 2026-10-30`, `no borra el dato`, `sigue almacenado … sí`; `venta_pasajes` conserva al segundo titular y `marketing_directo` lo saca. En `reintento`: `ya aplicada, no se repite` y cada acción en 1. `sonda_valor` compara el valor leído; el test de reglas revierte `crm` y la sonda pasa a `pendiente` (líneas 500-503).

**Hallazgo.** El único feriado del ejemplo cae sábado, así que el plazo de dos días hábiles queda en la misma fecha con o sin ese día.

**Severidad.** Baja.

**Evidencia.** `configuracion()` incluye `date(2026, 10, 31)`. Ese día es sábado; el viernes `2026-10-30` es el ingreso del test de reglas, que espera bloqueo el `2026-11-03` (línea 494). El mismo cómputo sin el feriado también da `2026-11-03`. El ingreso de los escenarios, jueves `2026-10-29`, llega al lunes `2026-11-02` por el fin de semana. El §4 (línea 119) dice que las pruebas cubren feriados.

**Corrección.** Poner el feriado en un día de semana y mostrar en la salida que el plazo de bloqueo se corre.

## Rigor legal

**Hallazgo.** Los 30 días de respuesta y la prórroga se suman en días corridos, una sola vez, por 30. Los 2 días del bloqueo usan la palabra de la ley («hábiles»). La regla de cómputo (lunes a viernes, sin feriados) va como supuesto.

**Severidad.** Ninguna.

**Evidencia.** Art. 11: «dentro de los treinta días corridos» y «prorrogado, por una sola vez, hasta por treinta días corridos»; el bloqueo temporal fundado se responde «dentro de los dos días hábiles siguientes». `plazos()` suma `timedelta` para la respuesta y la prórroga (líneas 258-259). El supuesto está en `configuracion()` (línea 245: «supuesto a confirmar con el área legal»), en el párrafo del paso 1 (línea 486) y en las limitaciones (línea 548). El art. 11 también da «treinta días hábiles» para reclamar ante la Agencia después de una denegación; la ficha habla de los 30 corridos de la respuesta. La portabilidad (`portabilidad()`, líneas 334-337) exige dato facilitado por el titular, tratamiento automatizado y base consentimiento: con contrato la lista va vacía y `silver.preferencias` entra. El §2 (línea 77) pide además formato estructurado, genérico y de uso común.

**Hallazgo.** La gratuidad del §2 cubre rectificación, supresión y oposición, y el acceso al menos una vez por trimestre. El art. 10 permite cobrar los costos directos del acceso y de la portabilidad cuando se ejercen más de una vez en el trimestre.

**Severidad.** Baja.

**Evidencia.** §2, línea 78, y la nota de la fuente (línea 33): «rectificación, supresión y oposición gratuitas; acceso gratuito al menos trimestralmente.» BCN, art. 10: «El ejercicio de los derechos de rectificación, supresión y oposición siempre serán gratuitos para el titular. El derecho de acceso también se ejercerá en forma gratuita, al menos trimestralmente. El responsable de datos sólo puede exigir el pago de los costos directos en que incurra, cuando el titular ejerza su derecho de acceso y derecho a la portabilidad más de una vez en el trimestre.» Ese cobro no se exige en los casos del inciso cuarto del art. 28.

**Corrección.** Añadir el cobro de costos directos del segundo acceso y de la portabilidad en el trimestre, con la salvedad del art. 28.

**Hallazgo.** Rectificación, supresión y oposición imprimen un plazo de bloqueo temporal aunque la solicitud no pida bloqueo. El art. 11 hace correr los dos días hábiles desde la solicitud fundada de bloqueo.

**Severidad.** Baja.

**Evidencia.** `plazos()` agrega `bloqueo temporal` si el derecho está en `rectificación`, `supresión`, `oposición` o `bloqueo` (líneas 260-261). La salida de `rectificacion` y la de `SOL-0105` (oposición) traen `bloqueo temporal 2026-11-02`. BCN, art. 11: «Cuando se formule una solicitud de rectificación, supresión u oposición, el titular tendrá derecho a solicitar y obtener del responsable el bloqueo temporal… La solicitud de bloqueo temporal deberá ser fundada y el responsable deberá responder al requerimiento dentro de los dos días hábiles siguientes a su recepción.»

**Corrección.** Calcular esa fecha solo cuando la solicitud incluye el bloqueo temporal.

**Hallazgo.** El cierre del acceso dice «respuesta completa» cuando finalidad, origen, destinatarios y plazo están llenos. La lógica queda en «informados» y el catálogo ya tiene el texto. El art. 5 a) pide los datos tratados y su origen: la línea trae el origen y un conteo de ubicaciones.

**Severidad.** Baja.

**Evidencia.** `faltantes_art5` (líneas 324-330) mira esos cuatro campos y el cierre imprime `respuesta completa (0)` (línea 448). `riesgo_fraude` guarda `puntaje de riesgo; sobre el umbral pasa a revisión humana` (línea 290); la línea documentada dice «lógica automatizada informados». El párrafo previo (línea 493) dice que la línea es un resumen, no el JSON completo. BCN, art. 5 a): «Los datos tratados y su origen.» Art. 5 f): «La información significativa sobre la lógica aplicada».

**Corrección.** Llamar al cierre «campos del catálogo presentes» e incluir en la línea el texto de la lógica que ya está en el catálogo. Los valores del titular siguen fuera de la salida.

**Hallazgo.** El §2 enuncia las tres causales de oposición. El art. 8 a) permite seguir el tratamiento si el responsable acredita motivos legítimos imperiosos o una reclamación, y la oposición no procede para fines científicos, históricos o estadísticos cuando son necesarios para una función pública o una actividad de interés público. La nota de la fuente resume el marketing sin «exclusivamente».

**Severidad.** Baja.

**Evidencia.** §2, línea 76: «si la base es el interés legítimo, si el fin es exclusivamente marketing directo (incluidos los perfiles) o si los datos vienen de una fuente de acceso público sin otro fundamento.» Nota de `bcn-leychile`, línea 33: «marketing directo con perfiles». BCN, art. 8 a): «salvo que acredite motivos legítimos imperiosos para el tratamiento que prevalezcan sobre los intereses, los derechos y las libertades del titular, o para la formulación, el ejercicio o la defensa de reclamaciones.» Párrafo final: «No procederá la oposición al tratamiento cuando éste se realice con fines de investigación científica o histórica o fines estadísticos, y siempre que fueran necesarios para el cumplimiento de una función pública o para el ejercicio de una actividad de interés público.» La limitación de procedencia (línea 547) dice que el ejemplo no decide si la solicitud procede. El art. 4 del §2 (línea 71) dice «son irrenunciables»; el artículo dice «personales, intransferibles e irrenunciables» (la nota de la fuente sí trae los tres).

**Corrección.** Sumar al §2 el prevalecimiento de la letra a) y la excepción de fines científicos, históricos y estadísticos; devolver «exclusivamente» a la nota de la fuente; y repetir en el art. 4 «personales, intransferibles e irrenunciables».

**Hallazgo.** El paso 3 presenta el flag como si fuera el texto del art. 8 ter. El artículo es el derecho a pedir la suspensión temporal, y esa suspensión no afecta el almacenamiento. El flag es la decisión de arquitectura del ejemplo.

**Severidad.** Baja.

**Evidencia.** Línea 488: «el bloqueo (art. 8 ter) es un flag que la vista de consumo y el job excluyen sin borrar el dato». BCN, art. 8 ter: «solicitar la suspensión temporal de cualquier operación de tratamiento… El ejercicio de este derecho no afectará el almacenamiento de los datos». El §4 ya separa la decisión de arquitectura.

**Corrección.** Decir que el ejemplo modela esa suspensión como un flag, y dejar el artículo en la suspensión y en que el almacenamiento sigue.

## Calidad del código

**Hallazgo.** `mypy --strict` pasa dentro del test de igualdad. El bloque no tiene registro global ni `assert`. Los titulares van por llave seudónima y la salida no imprime correos.

**Severidad.** Ninguna.

**Evidencia.** `assert_mypy_strict` al cierre de `test_rights_pipeline_each_scenario_prints_its_documented_output`. El mismo test exige `"@" not in result.stdout` (línea 475) y pasó. `test_rights_pipeline_rules` rechaza líneas `assert`. `configuracion`, `catalogo`, `indice` y `plataforma` arman los datos; `main` los pasa a las funciones (línea 438). Los correos del ejemplo son `@example.com` y quedan en los argumentos, fuera de los cuatro bloques `text`.
