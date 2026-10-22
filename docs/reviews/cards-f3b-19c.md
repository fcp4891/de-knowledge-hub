# Revisión B-F3.1 · lote F3b-19c

Rama `b/f3b-review-19c`, creada desde `origin/main` (`97380b6`). Fichas: `personal-data-breach-readiness`, `dpia-technical-input` y `privacy-by-design-checklist`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `personal-data-breach-readiness`, el paso 5 dice calcular los plazos del art. 9 «desde la detección», y el ejemplo arma los tres relojes desde `DETECCION` (alerta 11:30, actualización 2026-12-07 08:30, informe final 2026-12-19 08:30). El art. 9 cuenta las tres horas desde que se tiene conocimiento y los quince días corridos del informe final desde el envío de la alerta temprana. Si la alerta sale a las 11:30, esos quince días vencen a las 11:30 del 19, no a las 08:30. La letra d, si el incidente sigue, pide otro informe a los quince días corridos desde que se haya gestionado; la ficha no la cita. Los plazos de 3 horas, 72 horas, 24 horas para el operador de importancia vital y 15 días corridos sí están en la nota y en la etiqueta. | alta | Contar el informe final desde la alerta temprana, y las tres horas desde el conocimiento. Citar la letra d aparte. |
| En `privacy-by-design-checklist`, el paso 1 etiqueta el JSON Schema como **[Obligación legal · art. 3]** y el paso 2 el veto a `SELECT *` como **[Obligación legal · art. 14 quáter]**. El art. 3 pide fines específicos y datos limitados a lo necesario. El art. 14 quáter pide, por defecto, solo los datos estrictamente necesarios. Ninguno nombra un schema ni prohíbe `SELECT *`. | media | Pasar el schema y el veto de SQL a **[Decisión de arquitectura]**. |
| Sin otros hallazgos. El aviso está en las tres. Las etiquetas de la vulneración nombran la ley cuando hay dos en `legal_basis`. Los cuatro casos del art. 15 ter coinciden. El umbral de gran escala del ejemplo es interno. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 589 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py` en este checkout de `main`. Los avisos son de 14b.

## Comprobaciones

```
personal-data-breach-readiness dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
dpia-technical-input dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
privacy-by-design-checklist dups [] miss17 [] sec14 True aviso True t 5 s 5 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

El h1 renderizado de la Ley 21.663 es «Ley 21663 LEY MARCO DE CIBERSEGURIDAD». La ficha de la norma dice «Versión: Última Versión - 01-MAR-2025».

Art. 9 de la Ley 21.663: «Dentro del plazo máximo de tres horas contado desde que se tiene conocimiento […] una alerta temprana». «Dentro del plazo máximo de setenta y dos horas, una actualización». «en caso de que la institución afectada fuera un operador de importancia vital […] en el plazo máximo de veinticuatro horas contado desde que haya tenido conocimiento». «Dentro del plazo máximo de quince días corridos contado desde el envío de la alerta temprana […] un informe final». «El informe final deberá ser presentado en el plazo de quince días corridos contado desde que se haya gestionado el incidente».

Art. 14 sexies (Ley 19.628, vigencia diferida 2026-12-01): reportar a la Agencia «sin dilaciones indebidas» cuando exista un riesgo razonable; registrar «la naturaleza de las vulneraciones sufridas, sus efectos, las categorías de datos y el número aproximado de titulares afectados y las medidas adoptadas»; comunicar a los titulares si se refieren a datos sensibles, a niños y niñas menores de catorce años o a obligaciones de carácter económico, financiero, bancario o comercial.

Art. 15 ter: la evaluación es «previo al inicio de las operaciones» y se requiere siempre en: «a) Evaluación sistemática y exhaustiva de aspectos personales […] como la elaboración de perfiles, y que produzcan […] efectos jurídicos significativos. b) Tratamiento masivo de datos o a gran escala. c) […] observación o monitoreo sistemático de una zona de acceso público. d) Tratamiento de datos sensibles y especialmente protegidos, en las hipótesis de excepción del consentimiento».

Art. 14 quáter: «por defecto, sólo sean objeto de tratamiento los datos personales específicos y estrictamente necesarios […] el número de datos recogidos, la extensión del tratamiento, el plazo de conservación y su accesibilidad».

`tests/test_compliance_snippets.py` exige el alcance de 4 titulares, las categorías, `preparar comunicación a los titulares: True` y `plazos al CSIRT Nacional: {'alerta temprana': '2026-12-04T11:30', 'actualización': '2026-12-07T08:30', 'informe final': '2026-12-19T08:30'}`. La puerta de privacidad falla con `SELECT *` y con las propiedades que exige el JSON Schema.
