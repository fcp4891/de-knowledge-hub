---
# Plantilla de arquitectura de referencia (§24, ADR-028). Copiar a content/architectures/<slug>.md.
# No rellenar aquí: content/_templates/ no se valida.
id: architecture:slug-de-la-arquitectura
slug: slug-de-la-arquitectura
type: architecture
title: Título de la arquitectura
description: Qué problema de plataforma resuelve y en qué contexto.
domain: architecture
subdomain: slug-del-subdominio
classification: core                    # core | modern | emerging. Emerging no reemplaza lo consolidado.
level: intermediate                     # basic | intermediate | advanced
importance: high                        # high | medium | low (opcional en el schema)
cloud: [gcp, aws, azure]
technologies: []                        # slugs existentes de technology o cloud_service
tags: []
related_topics: []
sources: []                             # obligatorio, con al menos una, si verification_status es verified
relations: []
# - type: USES
#   target: slug-de-tecnologia-o-concepto
#   note: por qué entra en esta arquitectura
created_at: 2026-09-28
updated_at: 2026-09-28
last_verified: 2026-09-28
verification_status: review_required
---
<!-- Cada componente se justifica. Las tres nubes se comparan con diferencias; no son equivalentes. Sin solución única disfrazada de "la" arquitectura. Tres vistas obligatorias (§3, §5 y §6), cada una de 8 nodos o menos. -->

## 1. Resumen

<!-- ¿Qué problema resuelve, para quién, y cuándo conviene o no conviene esta arquitectura? -->

## 2. Escenario y requerimientos

<!-- Escenario concreto, requerimientos funcionales y no funcionales (latencia, volumen, frescura) y restricciones. -->

## 3. Vista de contexto

<!-- Diagrama Mermaid de 8 nodos o menos (cada subgraph cuenta como nodo): orígenes, la plataforma y sus consumidores. -->

## 4. Componentes

<!-- Tabla: componente, responsabilidad y por qué está. Los nombres son los de las tres vistas. -->

## 5. Vista de datos

<!-- Diagrama Mermaid de 8 nodos o menos: cómo fluyen y se transforman los datos, con capas y contratos. -->

## 6. Vista de despliegue

<!-- Diagrama Mermaid de 8 nodos o menos: dónde corre cada componente, redes, identidades y entornos. -->

## 7. Seguridad y gobierno

<!-- Identidades, mínimo privilegio, cifrado, datos personales, catálogo y linaje. -->

## 8. Escalabilidad, observabilidad y operación

<!-- Cómo crece, qué se mide (SLI/SLO), alertas, runbook y reprocesos. -->

## 9. Costos

<!-- Qué mueve el costo y cómo se controla. Sin montos sin fuente. -->

## 10. Código y configuración

<!-- Qué se ejecuta en la CI, qué es configuración validada (terraform validate, kubeconform, actionlint) y qué queda «no ejecutado». -->

## 11. GCP

<!-- Implementación en GCP, con la fuente de cada servicio y sus diferencias. -->

## 12. AWS

<!-- Implementación en AWS, con la fuente de cada servicio y sus diferencias. -->

## 13. Azure

<!-- Implementación en Azure, con la fuente de cada servicio y sus diferencias. -->

## 14. Riesgos y modos de falla

<!-- Qué puede fallar, cómo se detecta y cómo se recupera. -->

## 15. Errores frecuentes

<!-- Error → consecuencia. -->

## 16. Trade-offs y alternativas

<!-- Qué se gana y qué se paga; cuándo elegir otra arquitectura del dominio. -->

## 17. Conceptos relacionados

<!-- Misma regla que el §17 de las fichas: si la ficha existe, va en relations. -->

## 18. Evolución

<!-- Desde qué arquitectura se llega, hacia cuál se migra y con qué señales. -->

## 19. Laboratorio relacionado

<!-- Laboratorio en la nube de F4 (terraform apply, costo con fuente, teardown, evidencia), si lo hay. -->

## 20. Fuentes

<!-- Fuentes Nivel 1–2; el detalle va en sources del frontmatter. -->

## 21. Fecha de última verificación

<!-- Fecha y qué se verificó. -->

## 22. Historial de cambios importantes

<!-- Fecha: cambio. -->
