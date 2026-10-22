# Revisión B-F3.1 · lote F3b-19a

Rama `b/f3b-review-19a`, creada desde `origin/main` (`97380b6`). Fichas: `chile-data-protection`, `pii-identification`, `processing-activities-inventory` y `data-minimization-by-layer`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `data-minimization-by-layer`, el paso 3 lleva **[Obligación legal · art. 14 quáter]** y dice que gold agrega por comuna y suprime los grupos de menos de 2 clientes. El artículo no fija un mínimo de personas por grupo. | alta | Dejar ese paso como **[Decisión de arquitectura]**. El art. 14 quáter exige, por defecto, solo los datos estrictamente necesarios. |
| En `processing-activities-inventory`, «se arma una fila por actividad» y «cada dato faltante es una brecha» van como obligación legal. El art. 14 ter pide informar esas materias; el art. 3, poder acreditar la licitud. La fila y la brecha de la CI son el diseño del ejemplo. | media | Etiquetar la fila y la brecha como **[Decisión de arquitectura]**. |
| En `data-minimization-by-layer`, el paso de silver (HMAC del RUT y tramo de edad) va como **[Obligación legal · art. 3]**. El artículo pide datos necesarios, adecuados y pertinentes. El HMAC y el tramo son la técnica elegida. | media | Dejar el HMAC y el tramo como **[Decisión de arquitectura]**. |
| Sin otros hallazgos. El aviso está en las cuatro fichas. No nombran empresas ni citan el brief. La vigencia y el boletín coinciden con BCN y el Senado al 2026-10-21, sin decir qué cambiaría el proyecto. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 589 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
chile-data-protection dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
pii-identification dups [] miss17 [] sec14 True aviso True t 5 s 5 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
processing-activities-inventory dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
data-minimization-by-layer dups [] miss17 [] sec14 True aviso True t 5 s 5 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

Texto de BCN, Ley 19.628, versión `idVersion=2026-12-01` (`Consulta/obtxml`). El h1 renderizado es «Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES». La ficha de la norma dice «Versión: Con Vigencia Diferida por Fecha - 01-DIC-2026».

Artículo primero transitorio de la Ley 21.719 (`idNorma=1209272`): «Las modificaciones a las leyes N° 19.628 […] contenidas en los artículos primero, segundo y tercero permanentes de la presente ley, respectivamente, entrarán en vigencia el día primero del mes vigésimo cuarto posterior a la publicación de esta ley en el Diario Oficial». La ficha lo dice así y no adelanta el efecto del boletín.

Senado, boletín 18623-07, h1 «Boletín 18623-07». Título: «Modifica la ley N° 21.719, que regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales, en el sentido que indica». Etapa: «Primer trámite constitucional (Senado)». Hay un trámite del 21/10/2026 y sigue en primer trámite. La ficha cita el título con corchetes y no dice qué cambiaría.

Art. 2: «Dato personal: cualquier información vinculada o referida a una persona natural identificada o identificable». «Datos personales sensibles» incluye origen étnico o racial, afiliación política, sindical o gremial, situación socioeconómica, convicciones, creencias religiosas, salud, perfil biológico, biométricos, vida sexual, orientación sexual e identidad de género. «Tratamiento de datos: cualquier operación […] que permitan […] recolectar, procesar, almacenar, comunicar, transmitir o utilizar». «k) Anonimización: procedimiento irreversible […] Un dato anonimizado deja de ser un dato personal». Las etiquetas de definición de `chile-data-protection` y `pii-identification` coinciden.

Art. 3: ocho letras, de licitud y lealtad a confidencialidad. «el responsable deberá ser capaz de acreditar la licitud». Proporcionalidad: «necesarios, adecuados y pertinentes» y «conservados sólo por el período de tiempo que sea necesario […] luego de lo cual deben ser suprimidos o anonimizados».

Art. 14 a): «Informar y poner a disposición del titular los antecedentes que acrediten la licitud del tratamiento».

Art. 14 ter: categorías, finalidades, base de legitimidad, destinatarios, transferencia a un tercer país (letra h), período de conservación (letra i) y fuente (letra j).

Art. 14 quáter: «por defecto, sólo sean objeto de tratamiento los datos personales específicos y estrictamente necesarios […] el número de datos recogidos, la extensión del tratamiento, el plazo de conservación y su accesibilidad».

Art. 15 bis: el encargado trata «conforme al encargo y a las instrucciones» y «se regirá por el contrato».

Art. 16: los sensibles «sólo puede realizarse cuando el titular […] manifiesta su consentimiento en forma expresa», con las excepciones que el artículo enumera.

`tests/test_compliance_snippets.py` exige, entre otras, `rut_cliente: personal (RUT con DV válido 100%)` y las columnas de bronze, silver y gold con «valores con RUT o correo en claro: 10» y «0».
