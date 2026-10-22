# Revisión B-F3.1 · lote F3b-19d

Rama `b/f3b-review-19d`, creada desde `origin/main` (`97380b6`). Fichas: `international-data-transfers` y `automated-decision-traceability`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `automated-decision-traceability`, el paso 3 etiqueta «con las contribuciones se arma la explicación de la lógica» como **[Obligación legal · art. 5]**. El art. 5 letra f pide «información significativa sobre la lógica aplicada». No dice que esa información sean las contribuciones de las variables. | media | Dejar las contribuciones como **[Decisión de arquitectura]**. |
| El paso de buenas prácticas «un camino operativo para la revisión humana, con plazo y registro» va como **[Obligación legal · art. 8 bis]**. El artículo exige explicación, intervención humana, punto de vista y revisión. No fija un plazo. | media | Sacar el plazo de la etiqueta legal, o pasarlo a **[Decisión de arquitectura]**. |
| En `international-data-transfers`, el paso 2 etiqueta «por cada flujo hacia fuera, registrar el mecanismo que indica el área legal» como **[Obligación legal · art. 27]**. El artículo dice cuándo la transferencia es lícita. El registro por flujo es el control. | media | Etiquetar el registro como **[Decisión de arquitectura]**. |
| Sin otros hallazgos. El aviso está en las dos. Una llamada a una API o a un LLM con datos personales se trata como transferencia. La lista de países adecuados es un parámetro vacío, no una lista supuesta. Las secciones de nube dicen «no ejecutado». | ninguna | — |

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
international-data-transfers dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
automated-decision-traceability dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

H1 de las páginas de nube, el 2026-10-21. En las de Google se descarta el sufijo de colecciones:

- «Restrict resource locations»
- «AWS global condition context keys»
- «Azure Policy built-in policy definitions»
- «Introduction to Model Registry»
- «Model Registration Deployment with Model Registry»
- «MLOps model management with Azure Machine Learning»

El h1 de BCN es «Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES».

Art. 27: «son lícitas las operaciones de transferencia internacional de datos» con país adecuado (art. 28), con cláusulas contractuales, normas corporativas vinculantes u otros instrumentos, o con un modelo de cumplimiento. Sin eso, solo transferencias específicas y no habituales en los supuestos que el artículo enumera.

Art. 28: «La Agencia determinará fundadamente los países que poseen niveles adecuados de protección» y «pondrá en su página web […] un listado de países adecuados y modelos tipo de cláusulas».

Art. 14 ter letra h: «la transferencia de datos personales a un tercer país u organización internacional y si éstos ofrecen o no un nivel adecuado de protección».

Art. 8 bis: derecho a oponerse a decisiones automatizadas, incluida la elaboración de perfiles, que produzcan efectos jurídicos o afecten significativamente. No se aplica si la decisión es necesaria para un contrato, si hay consentimiento previo y expreso del art. 12, o si la ley lo señala con salvaguardas. «En todos los casos […] el derecho a obtener una explicación, a la intervención humana, a expresar su punto de vista y a solicitar la revisión de la decisión».

Art. 5 letra f: «La información significativa sobre la lógica aplicada en el caso de que el responsable realice tratamiento de datos de conformidad con el artículo 8° bis».

`tests/test_compliance_snippets.py` exige los flujos hacia US y AR, `amparados por adecuación: []`, `sin mecanismo documentado: ['API de un LLM externo']`, la explicación `[('atraso_dias', 0.3), ('deuda_sobre_ingreso', 0.3)]` y `revisión humana registrada: analista-credito -> aprobado`. Los dos ejemplos son biblioteca estándar.
