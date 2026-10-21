# Revisión B-F3.1 · lote F3b-17b

Rama `b/f3b-review-17b`, creada desde `origin/main` (`1157f83`). El pedido está en `docs/status/lane-a.md`. Fichas: `data-ownership`, `data-stewardship`, `data-domains` y `data-classification`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| *Data governance roles and permissions in Microsoft Purview* dice «Assign at least two people as governance domain owners». `data-ownership` y `data-stewardship` lo escriben como «se recomienda». | media | Citar la frase de la página: asignar al menos dos personas, no recomendarlo. |
| Sin otros hallazgos. Los regex son heurística, los dos falsos negativos se imprimen y no reemplazan a SDP, Macie ni Purview. Knowledge Catalog no define un rol de steward en la página citada. *About data products* no define un objeto dominio. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 547 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== data-ownership dups [] missing17 [] sec14 True titles 5 sources 5 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-stewardship dups [] missing17 [] sec14 True titles 4 sources 4 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-domains dups [] missing17 [] sec14 True titles 5 sources 5 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-classification dups [] missing17 [] sec14 True titles 5 sources 5 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
```

`tests/test_governance_snippets.py` exige las frases de las fichas:

```
"ventas.pedidos: ok"
"datasets con problemas: 4/5"
"ana · termino · cliente activo: 81 días -> VENCIDO: escalar al dueño"
"pendientes por steward: {'ana': 3, 'luis': 1}"
"margen_diario [finanzas] lee ventas.pedidos: ok (producto publicado por ventas)"
"atribucion [marketing] lee ventas.stg_pedidos: NO: tabla interna de ventas; pedir que la publique"
"contacto: email (75%)"
"fono: telefono_cl (67%)"
"medio_pago: tarjeta (67%)"
"comentario: sin etiqueta"
"codigo_pedido: sin etiqueta"
```

`data-classification` dice que el ejemplo es una heurística, muestra `comentario` y `codigo_pedido` como falsos negativos y dice que no reemplaza a Sensitive Data Protection, Macie ni Purview. *What is Amazon Macie?* dice: «discovers sensitive data by using machine learning and pattern matching».

*About metadata in Knowledge Catalog* no contiene la palabra steward. Sí dice que los aspects se llenan desde sistemas de origen, logs de consultas o escaneos, o los crean usuarios, pipelines o agentes. La celda de `data-stewardship` coincide con eso.

El artículo de *About data products* no define un objeto dominio. En la navegación del sitio hay páginas aparte (*About data domains*, *Create data domains*); la ficha habla de la página citada, no del producto entero.

*Domains in Amazon SageMaker Unified Studio* no usa la palabra owner. Dice: «A domain is the organizing entity for connecting together your assets, users, and their projects». La celda de `data-ownership` coincide.

*Catalog in IDC-based domains*: «data owners can curate their inventory assets». La celda de `data-stewardship` coincide.

*Data Steward*: «Can create, update, and read artifacts and policies within their governance domain. Can also read artifacts from other governance domains». *Governance Domain Owner*: «Can delegate all other governance domain permissions…». Eso está citado. Lo que no está es «se recomienda»: la página dice «Assign at least two people as governance domain owners».

*Amazon SageMaker Catalog, built on Amazon DataZone* sigue siendo la formulación de la página que compara los dos. Estas fichas no dicen que uno reemplace al otro.

Los bullets de costo hablan de tiempo de personas y de almacenamiento que crece. No nombran un precio.

Los `page_title` coinciden con el `h1` del artículo. En Google, el aviso de collections no entra en el título.

## Fichas que ya existían

`git diff --diff-filter=M --name-only 66396ab^..17232c6 -- content/concepts` no lista ninguna ficha modificada. El lote solo agrega las cuatro nuevas.
