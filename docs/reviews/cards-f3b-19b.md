# Revisión B-F3.1 · lote F3b-19b

Rama `b/f3b-review-19b`, creada desde `origin/main` (`97380b6`). Fichas: `chilean-identifier-pseudonymization`, `data-subject-requests` y `erasure-across-copies`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `data-subject-requests`, la etiqueta y el paso del art. 6 dicen que la rectificación se comunica a quienes recibieron los datos. El artículo agrega «salvo en los casos en que dicha comunicación sea imposible o exija un esfuerzo desproporcionado». La nota de la fuente sí lo dice. | media | Agregar el salvo en la etiqueta y en el paso. |
| En `chilean-identifier-pseudonymization`, el paso 3 etiqueta `HMAC-SHA-256` y el KMS como **[Obligación legal · art. 2]**. El art. 2 letra l define la seudonimización: la información adicional va por separado y protegida. No nombra el algoritmo ni el KMS. Más arriba el HMAC ya va como decisión de arquitectura. | media | Dejar el paso 3 como **[Decisión de arquitectura]**. |
| El paso 5 etiqueta la rotación de la clave como **[Obligación legal · art. 14 quinquies]**. El artículo nombra, entre otras medidas, la seudonimización y el cifrado. No exige rotar la clave. | media | Pasar la rotación a **[Decisión de arquitectura]** o **[Buena práctica]**. |
| En `erasure-across-copies`, el paso 6 etiqueta «verificar cada copia y registrar método y resultado» como **[Obligación legal · art. 2]**. La letra h define la eliminación como destrucción, cualquiera sea el procedimiento. No pide un reporte. | media | Etiquetar el reporte como **[Buena práctica]**. |
| Sin otros hallazgos. El aviso está en las tres. El plazo de 30 días corridos, prorrogable una vez por otros 30, es el del art. 11. El orquestador no decide si la solicitud procede. | ninguna | — |

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
chilean-identifier-pseudonymization dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
data-subject-requests dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
erasure-across-copies dups [] miss17 [] sec14 True aviso True t 6 s 6 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

Texto de BCN, Ley 19.628, versión `idVersion=2026-12-01`.

Art. 2 letra l: «Seudonimización: tratamiento de datos personales que se efectúa de manera tal que ya no puedan atribuirse a un titular sin utilizar información adicional, siempre que dicha información adicional figure por separado y esté sujeta a medidas técnicas y organizativas».

Art. 2 letra h: «Eliminación o cancelación de datos, la destrucción de datos almacenados en registros o bancos de datos, cualquiera fuere el procedimiento empleado para ello».

Art. 14 quinquies: las medidas «en su caso incluya, entre otros: a) La seudonimización y el cifrado de datos personales».

Art. 6: «Los datos rectificados deberán ser comunicados a las personas, entidades u organismos a los cuales el responsable haya comunicado o cedido los referidos datos, salvo en los casos en que dicha comunicación sea imposible o exija un esfuerzo desproporcionado. Efectuada la rectificación, no se podrán volver a tratar los datos sin rectificar».

Art. 11: «pronunciarse a más tardar dentro de los treinta días corridos siguientes a la fecha de ingreso de la solicitud. Este plazo podrá ser prorrogado, por una sola vez, hasta por treinta días corridos».

El cuerpo de `data-subject-requests` dice que el área legal decide si una solicitud procede. En el catálogo del ejemplo, `pedidos` lleva `conservar: obligación legal (decisión del área legal)`.

`tests/test_compliance_snippets.py` exige `variantes del mismo RUT, mismo seudónimo: True`, `hash simple revertido probando 1.000.000 RUT del tramo: True`, `con HMAC y sin la clave, el mismo ataque no sirve: True`, `plazo de respuesta: 2027-01-01; con prórroga: 2027-01-31`, `snapshots que quedan: 1 | el anterior expiró: True`, `tras expirar, archivos Parquet que todavía contienen el correo: 1` y `archivos sin referencia borrados: 1; con el correo: 0`. El orquestador corre contra postgres:17. El de borrado usa PyIceberg 0.12 (`expire_snapshots` y, después, el borrado de archivos sin referencia) y cryptography; el test se salta en Windows.
