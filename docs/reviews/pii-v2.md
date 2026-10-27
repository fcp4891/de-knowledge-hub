# Revisión · mejora de `pii-identification`

Rama `b/review-pii-v2`, creada desde `9b1e7fa`. El texto nuevo entra en `6751bc1`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| El §2 marca como **[Obligación legal · art. 2]** la frase «así que una combinación de columnas también puede serlo». El art. 2 f) dice que la persona es identificable directa o indirectamente y que se consideran los medios razonables. «Columnas» es la lectura técnica; ya está en la buena práctica del identificador indirecto. | baja | Dejar en la obligación la definición del art. 2 f) y mover «combinación de columnas» a la buena práctica. |
| Sin otros hallazgos. La lista del art. 2 g) en el §2 es la de BCN. Los tres detectores están citados con la fecha 2026-10-27. El §10 no imprime valores, el DV inválido queda en revisión y «sin hallazgos» dice que no significa anónimo. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 639 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de Spark.

## Art. 2 g)

Texto de BCN, versión 2026-12-01, consultado en esta revisión. El mismo párrafo está en el §2:

```
quote_in_card True
quote_in_bcn True
```

La lista es: origen étnico o racial; afiliación política, sindical o gremial; situación socioeconómica; convicciones ideológicas o filosóficas; creencias religiosas; datos relativos a la salud; perfil biológico humano; datos biométricos; vida sexual, orientación sexual e identidad de género.

## Detectores

Consultados en esta revisión. La ficha dice «consultada el 2026-10-27» en el §11, el §12 y el §13. `accessed` de esas tres fuentes es 2026-10-27.

- *InfoType detector reference* (Last updated 2026-10-22 UTC): `CHILE_CDI_NUMBER` es «A Chilean Cédula de Identidad (CDI), or identity card, is used as the main identity document for citizens.» La tabla lo ubica en CHILE, con `GOVERNMENT_ID`, `PII` y `SPII`.
- *Quick reference: Managed data identifiers by type*: `CHILE_RUT_NUMBER` está en «National identification number» y en «Taxpayer identification or reference number». Chile figura en los países de las dos filas.
- *Chile identity card number*: siete a ocho dígitos, delimitadores y un dígito o letra de control; checksum sí; confianza alta con patrón, palabra clave a 300 caracteres o menos y checksum.

## §10

El bloque no tiene `60` ni `0.6`. El §4 nombra «el 60 % de la muestra» solo para decir que no hay un umbral universal. La salida del bloque, ejecutada en esta revisión, es igual a las líneas que exige `tests/test_compliance_snippets.py`:

```
equal True
rut_cliente: personal: RUT con DV válido (2 de 2)
contacto: personal: correo en el valor (1 de 2)
cliente_id: revisión personal: posible identificador indirecto o texto libre
diagnostico: revisión sensible: nombre asociado a datos relativos a la salud
tramo_ingreso: revisión sensible: nombre asociado a situación socioeconómica
comentarios: personal: correo en el valor (1 de 2)
comentarios: revisión personal: posible identificador indirecto o texto libre
rut_malformado: revisión personal: forma de RUT con DV inválido (1 de 1)
sin hallazgos (no significa anónimo): ['comuna', 'producto']
```

El reporte imprime columna, candidato, motivo y conteo. No imprime `@` ni el cuerpo del RUT. `rut_malformado` queda en «revisión personal».

## Etiquetas y §9

Tres obligaciones: art. 2 (dato personal), art. 2 (la cita del g)) y art. 16 (consentimiento expreso). El resto es buena práctica o decisión de arquitectura. La baja de arriba es la cláusula técnica dentro de la primera obligación.

El §9 es `TB`, con 7 nodos y 6 aristas, en una sola cadena. La cadena pasa de 5 nodos, así que la dirección es `TB`. Las etiquetas tienen como máximo dos líneas.
