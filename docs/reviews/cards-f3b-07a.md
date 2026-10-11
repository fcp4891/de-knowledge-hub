# Revisión B-F3.1 · Lote F3b-07a

Fichas en `content/concepts/`. Carril B no las edita. Filas en `pendiente` hasta que Felipe las apruebe. Las dos siguen en `review_required`. No hay comentarios `VERIFY`.

Las 2: `data-mesh` (`modern`, `advanced`) y `data-products` (`modern`).

El 2026-10-11 contrasté las páginas citadas. No reejecuté el Python ni `mypy`.

Propuestas:

1. En el §11 de las dos fichas, alinear la frase del cambio de nombre al aviso de la página de data products: «As of April 10, 2026, Dataplex Universal Catalog is now called Knowledge Catalog. The API, client library, CLI, and IAM names remain unchanged.» El cuerpo nombra la API, la CLI y los roles de IAM, y deja fuera las bibliotecas cliente.
2. En `data-mesh`, citar la URL de «Getting started with data mesh» para la recomendación de evaluar antes un data lake centralizado o hub-and-spoke, y la de «Teams and interactions» para la ley de Conway y el patrocinio ejecutivo. El `url` registrado de esa fuente es la introducción, que no contiene esas frases. En el §1, nombrar también hub-and-spoke, como el §12 y esa página.

## Comprobación por comando

Relaciones y slugs, el 2026-10-11:

```text
== data-mesh
related_topics: ['data-products', 'data-contracts']
relations: ['data-products', 'data-contracts', 'data-lake', 'data-warehouse']
related_topics ausentes en relations: ninguno
slugs sin ficha: ninguno
s14: {'Seguridad': True, 'Observabilidad': True, 'Costo': True}
secciones: 1 a 22
== data-products
related_topics: ['data-contracts', 'data-mesh']
relations: ['data-contracts', 'data-mesh', 'schema-evolution', 'semantic-models']
related_topics ausentes en relations: ninguno
slugs sin ficha: ninguno
s14: {'Seguridad': True, 'Observabilidad': True, 'Costo': True}
secciones: 1 a 22
data-platform-engineering.md existe: False
```

`data-mesh` nombra `data-platform-engineering` en el §17 como pendiente de ficha. No está en `related_topics` ni en `relations`.

Frases en las fichas: `data-mesh` contiene «10 de abril de 2026», «roles de IAM», «bibliotecas» (en la nota de fuente), «hub-and-spoke», «No es un producto» y «Getting started». `data-products` contiene «10 de abril de 2026», «roles de IAM», «bibliotecas» (en la nota de fuente) y «Ecommerce Business Data».

Aviso en el HTML de `https://docs.cloud.google.com/knowledge-catalog/docs/data-products-overview` (una sola vez): «As of April 10, 2026, Dataplex Universal Catalog is now called Knowledge Catalog. The API, client library, CLI, and IAM names remain unchanged.» La misma frase está en `https://docs.cloud.google.com/dataplex/docs/release-notes`, en el aviso y en la entrada del 10 de abril de 2026.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | El comando marca las tres viñetas en las dos fichas. | pendiente |
| Ejemplos atómicos e idempotentes | Cada ficha dice que su bloque de Python 3.12, solo biblioteca estándar, está ejecutado y pasa `mypy --strict`, y que el formato es ilustrativo. No reejecuté el código. | pendiente |
| Relaciones completas | El comando de arriba: cada slug de `related_topics` está en `relations` y tiene ficha. `data-mesh` además relaciona `data-lake` y `data-warehouse`. `data-products` además relaciona `schema-evolution` y `semantic-models`. | pendiente |
| Nivel 4 solo conceptual | `dehghani-data-mesh` es Nivel 4. Las dos fichas lo usan para los cuatro principios, las características del producto de datos y el data product owner. Las afirmaciones de Knowledge Catalog, AWS y Fabric o Purview están en notas Nivel 1. | pendiente |

## `data-mesh`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, los cuatro principios, cuándo sí y cuándo no, y §14 están. El §1 lo llama enfoque sociotécnico y dice que no es un producto que se compra. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dehghani sostiene lo conceptual. Architecture Center (revisión 2024-09-03), Knowledge Catalog, AWS Prescriptive Guidance y Fabric Domains son Nivel 1, con `accessed: 2026-10-11`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El aviso de la página de data products dice el 10 de abril de 2026 y que no cambian la API, la biblioteca cliente, la CLI y los nombres de IAM. El §11 nombra la API, la CLI y los roles de IAM. Propuesta: alinear el §11 a esa frase, incluidas las bibliotecas cliente. La recomendación de evaluar un data lake centralizado o una arquitectura multicuenta hub-and-spoke está en «Getting started with data mesh». El §12 la dice. El §1 nombra solo el data lake centralizado. La ley de Conway y «Formulate the vision» / «Sponsor the data mesh strategy» están en «Teams and interactions». Esas dos páginas se nombran en la nota; el `url` de esa fuente es la introducción. Propuesta: agregar esas dos URLs y nombrar hub-and-spoke en el §1. | pendiente |
| Ejemplos poco realistas | Publicar con una convención de dirección y rechazar un producto sin responsable es el caso de reglas globales como código. El script dice que el descriptor es ilustrativo. | pendiente |
| Relaciones faltantes | El comando: `data-products`, `data-contracts`, `data-lake` y `data-warehouse` tienen ficha. `data-platform-engineering` queda como pendiente de ficha en el §17. | pendiente |

## `data-products`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es un producto, el contrato, cuándo sí y cuándo no, y §14 están. El §1 dice que Knowledge Catalog, DataZone y Purview tienen significados cercanos y cada uno se describe con su página. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las características y el data product owner están en Dehghani (Nivel 4). Assets, access groups, dueño, consumidores, contrato y el ejemplo «Ecommerce Business Data» están en la página de data products de Knowledge Catalog. DataZone está en «AWS offerings for data mesh». Purview está en «Data Products in Unified Catalog»: concepto de negocio, un governance domain que lo administra, política de acceso. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El §11 repite la fecha y dice que la API, la CLI y los roles de IAM conservan sus nombres. La misma propuesta que en `data-mesh`: incluir las bibliotecas cliente, como el aviso de esa página. El §13 atribuye a Purview lo de su página y remite los dominios de Fabric a `data-mesh`. El §15 dice que «data product» no significa lo mismo en las tres herramientas. | pendiente |
| Ejemplos poco realistas | El ejemplo de producción sigue el de «Ecommerce Business Data» de la página: dos tablas, una vista sin PII, grupos Reader y Writer, actualización semanal. El script dice que el contrato ilustrativo no es el de Knowledge Catalog, DataZone ni Purview. | pendiente |
| Relaciones faltantes | El comando: `data-contracts`, `data-mesh`, `schema-evolution` y `semantic-models` tienen ficha. | pendiente |
