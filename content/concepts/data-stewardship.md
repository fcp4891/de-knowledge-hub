---
id: concept:data-stewardship
slug: data-stewardship
type: concept
title: Stewardship
description: "Stewardship es el trabajo cotidiano de cuidar los datos en nombre del dueño: definir y aprobar términos de negocio, atender pedidos de calidad, mantener la metadata y escalar lo que vence. El dueño decide; el steward ejecuta y sigue. Ejemplo ejecutado en la CI: la cola de un steward con plazos y escalamiento. El rol Data Steward de Purview, los aspects de Knowledge Catalog y la curación de activos en SageMaker Catalog, con sus diferencias."
domain: governance
subdomain: ownership-and-organization
category: governance
classification: core
level: intermediate
importance: medium
cloud: [agnostic]
technologies: [python, gcp-dataplex, microsoft-purview]
tags: [governance, stewardship, glossary, data-quality, metadata]
related_topics: [data-ownership, metadata-management]
sources:
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/data-governance-roles-permissions
    accessed: 2026-10-21
    page_title: "Data governance roles and permissions in Microsoft Purview"
    note: "Data governance roles and permissions in Microsoft Purview: Governance Domain Owner puede delegar los demás permisos del dominio, configurar alertas y la programación de escaneos de calidad del dominio y fijar políticas de acceso del dominio; se recomienda asignar al menos dos personas como governance domain owners. Data Product Owner puede crear, actualizar y leer data products solo dentro de su dominio. Data Steward puede crear, actualizar y leer artefactos y políticas dentro de su dominio y leer artefactos de otros dominios. Data Quality Steward es un subrol para reglas, escaneos, programación, umbrales y alertas de calidad."
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/unified-catalog-governance-domains
    accessed: 2026-10-21
    page_title: "Governance domains in Unified Catalog"
    note: "Governance domains in Unified Catalog (Purview): un governance domain da contexto a los activos y ayuda a escalar el gobierno; la página dice que el ownership de los datos es un aspecto central del gobierno y que a menudo los equipos de TI guardan y mantienen activos que poseen y usan los equipos de negocio, lo que abre una brecha entre cómo deberían descubrirse y mantenerse los datos y los equipos que los usan."
  - source: gcp-knowledge-catalog-docs
    url: https://docs.cloud.google.com/knowledge-catalog/docs/metadata-overview
    accessed: 2026-10-20
    page_title: "About metadata in Knowledge Catalog"
    note: "About metadata in Knowledge Catalog: las entries se crean automáticamente desde fuentes de Google Cloud (tablas, vistas, datasets y modelos de BigQuery, entre otras) o las crean los usuarios para fuentes propias, archivos o bases de terceros; los aspect types son plantillas predefinidas (Schema, Overview, Contacts, DataQuality, Lineage) o propias (por ejemplo, clasificación de PII o niveles de SLA); los aspects se llenan desde los sistemas de origen, logs de consultas o escaneos, o los agregan usuarios, pipelines o agentes; las entry links relacionan entries o columnas (synonym, definition, schema-join, related)."
  - source: aws-sagemaker-unified-studio-docs
    url: https://docs.aws.amazon.com/sagemaker-unified-studio/latest/userguide/working-with-business-catalog.html
    accessed: 2026-10-20
    page_title: "Catalog in IDC-based domains"
    note: "Catalog in IDC-based domains (Amazon SageMaker Unified Studio): Amazon SageMaker Catalog cataloga datos de la organización con contexto de negocio para que todos los encuentren y entiendan; primero los assets se traen como inventario de un proyecto, visibles solo para sus miembros, y no quedan disponibles para todos los usuarios del dominio hasta publicarlos."
relations:
  - type: RELATED_TO
    target: data-ownership
    note: El steward actúa en nombre del dueño.
  - type: RELATED_TO
    target: metadata-management
    note: Mantener la metadata de negocio es tarea del steward.
  - type: RELATED_TO
    target: data-quality-dimensions
    note: Los pedidos de calidad que atiende.
  - type: RELATED_TO
    target: data-catalog
    note: Donde publica términos y descripciones.
created_at: 2026-10-21
updated_at: 2026-10-21
last_verified: 2026-10-21
verification_status: review_required
---

## 1. Resumen

**Stewardship** es el trabajo cotidiano de cuidar los datos en nombre del dueño: definir y aprobar términos de negocio, atender pedidos de calidad, mantener la metadata y escalar lo que no se resuelve a tiempo. La división es simple:

- el **dueño** decide (qué significa el dato, quién lo usa, qué calidad necesita);
- el **steward** ejecuta y sigue: redacta la definición, coordina la corrección, actualiza el catálogo.

En Purview es un rol con nombre: **Data Steward** puede crear, actualizar y leer artefactos y políticas dentro de su dominio (*Data governance roles and permissions in Microsoft Purview*).

## 2. Qué es

- **Término de negocio:** una definición acordada («cliente activo»), con estado (borrador, aprobado).
- **Pedido de calidad:** un problema reportado en un dataset, con plazo.
- **Plazo:** el tiempo acordado para resolver cada tipo de pedido.
- **Escalamiento:** lo vencido sube al dueño.

## 3. Problema que resuelve

«Cliente activo» significa una cosa en marketing y otra en finanzas. Hace tres meses alguien abrió la discusión y nadie la cerró. Con un steward a cargo y un plazo, el término queda en su cola, vence a los 30 días y se escala al dueño para que decida.

## 4. Cómo funciona

1. Cada término y cada pedido de calidad tiene un steward asignado.
2. Los plazos los fija el gobierno (por ejemplo, 30 días para un término, 5 para un pedido de calidad).
3. El steward trabaja su cola; lo aprobado se publica en el catálogo.
4. Lo que vence se escala al dueño.
5. Se mide la carga por steward para repartirla.

## 5. Cuándo utilizarlo

- Con glosarios de negocio que hay que mantener.
- Cuando los pedidos de calidad no tienen quién los siga.
- En dominios grandes, donde el dueño no puede ocuparse de cada detalle.

## 6. Cuándo no utilizarlo

- Como reemplazo del dueño: el steward no decide significado ni acceso por su cuenta.
- Con una sola persona como steward de toda la organización.

## 7. Ejemplo sencillo

Hoy, 21 de octubre de 2026; plazos de 30 días para términos y 5 para calidad:

| Steward | Pendiente | Días | Estado |
|---|---|---|---|
| ana | término «cliente activo» | 81 | vencido: escalar al dueño |
| ana | término «margen bruto» | 11 | en plazo |
| luis | calidad: montos negativos en pedidos | 8 | vencido: escalar al dueño |
| ana | calidad: clientes duplicados | 2 | en plazo |

Pendientes por steward: ana 3, luis 1.

## 8. Ejemplo de producción

- Un steward por dominio, con un respaldo.
- La cola vive en la herramienta de gobierno (catálogo o tickets), con plazos por tipo.
- Una revisión semanal de lo vencido con los dueños.
- Los términos aprobados se vinculan a columnas en el catálogo.

## 9. Arquitectura

```mermaid
flowchart LR
  P["Pedidos: términos, calidad"] --> C["Cola del steward"]
  C -- "aprobado" --> K["Catálogo / glosario"]
  C -- "vencido" --> D["Dueño: decide"]
  D --> C
```

## 10. Código

```python
"""La cola de un steward: términos de glosario sin definición aprobada y pedidos de calidad abiertos, con su plazo."""
from datetime import date

HOY = date(2026, 10, 21)
PLAZO_DIAS = {"termino": 30, "calidad": 5}   # plazos acordados por el comité de gobierno
COLA = [  # (tipo, qué, steward, abierto el, estado)
    ("termino", "cliente activo", "ana", date(2026, 8, 1), "borrador"),
    ("termino", "margen bruto", "ana", date(2026, 10, 10), "borrador"),
    ("termino", "ticket promedio", "luis", date(2026, 9, 1), "aprobado"),
    ("calidad", "montos negativos en pedidos", "luis", date(2026, 10, 13), "abierto"),
    ("calidad", "clientes duplicados", "ana", date(2026, 10, 19), "abierto"),
]

pendientes = [c for c in COLA if c[4] in ("borrador", "abierto")]
for tipo, que, steward, abierto, _ in sorted(pendientes, key=lambda c: c[3]):
    dias = (HOY - abierto).days
    estado = "VENCIDO: escalar al dueño" if dias > PLAZO_DIAS[tipo] else "en plazo"
    print(f"{steward} · {tipo} · {que}: {dias} días -> {estado}")
por_steward = {s: sum(c[2] == s for c in pendientes) for s in sorted({c[2] for c in pendientes})}
print("pendientes por steward:", por_steward)
```

El script se **ejecuta en la CI** y pasa `mypy --strict`. Imprime cada pendiente con sus días y su estado (`VENCIDO: escalar al dueño` o `en plazo`) y `pendientes por steward: {'ana': 3, 'luis': 1}`.

## 11. GCP

En GCP, **Knowledge Catalog** guarda la metadata que mantiene un steward. Según *Data governance roles and permissions in Microsoft Purview* y *About metadata in Knowledge Catalog* (no ejecutado):

| | Stewardship (este concepto) | Knowledge Catalog |
|---|---|---|
| Rol con nombre | Steward | La página citada no define un rol de steward; describe quién llena los aspects: sistemas, escaneos, usuarios, pipelines o agentes |
| Qué mantiene | Términos, descripciones, pedidos | Aspects (por ejemplo, Contacts), glosarios y entry links |

## 12. AWS

En AWS, la **curación de activos** en Amazon SageMaker Catalog. Según *Data governance roles and permissions in Microsoft Purview* y *Catalog in IDC-based domains* (no ejecutado):

| | Stewardship (este concepto) | SageMaker Catalog |
|---|---|---|
| Quién cura | El steward | La página habla de los data owners, que curan el inventario de su proyecto |
| Qué se agrega | Términos y descripciones | Nombres de negocio, descripciones, read me, términos de glosario y metadata forms |

## 13. Azure

En Azure, el rol **Data Steward** de Purview Unified Catalog. Según *Data governance roles and permissions in Microsoft Purview* y *Governance domains in Unified Catalog* (no ejecutado):

| | Stewardship (este concepto) | Purview |
|---|---|---|
| Rol | Steward, en nombre del dueño | Data Steward: crea, actualiza y lee artefactos y políticas en su dominio; lee artefactos de otros dominios |
| Calidad | Pedidos con plazo | Subroles como Data Quality Steward para reglas, escaneos y alertas de calidad |

## 14. Buenas prácticas

- Un steward por dominio, con respaldo y carga medida.
- Plazos por tipo de pedido, acordados.
- Escalar lo vencido al dueño, no dejarlo en la cola.
- **Seguridad:** el steward necesita permisos sobre la metadata, no siempre sobre los datos.
- **Observabilidad:** pedidos vencidos y tiempo de resolución por steward.
- **Costo:** stewardship es tiempo de personas; priorizar los dominios más consumidos.

## 15. Errores frecuentes

- Stewards sin tiempo asignado para el rol.
- Confundir steward con dueño.
- Colas sin plazos, que crecen sin fin.

## 16. Trade-offs

Más stewards reparten la carga y cuestan más horas. Plazos cortos resuelven antes y escalan más al dueño.

## 17. Conceptos relacionados

- `data-ownership`: el dueño.
- `metadata-management`: la metadata que mantiene.
- `data-quality-dimensions`: los pedidos de calidad.
- `data-catalog`: donde publica.

## 18. Preguntas técnicas abiertas

1. ¿Quién mantiene hoy tu glosario de negocio?
2. ¿Cuánto tarda en resolverse un pedido de calidad?
3. ¿Qué términos de negocio siguen sin definición acordada?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn: *Data governance roles and permissions in Microsoft Purview* y *Governance domains in Unified Catalog*.
- Google Cloud: *About metadata in Knowledge Catalog*.
- AWS: *Catalog in IDC-based domains*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-21. `review_required`: pendiente de revisión B-F3.1 del lote F3b-17b.

## 22. Historial de cambios importantes

- 2026-10-21: creación (lote F3b-17b).
