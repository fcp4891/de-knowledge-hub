---
# Plantilla de arquitectura (§24). Copiar a content/architectures/<slug>.md.
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

<!-- Cada componente se justifica. Las tres nubes se comparan con diferencias; no son equivalentes. Sin solución única disfrazada de "la" arquitectura. -->

## Escenario

<!-- ¿Qué situación concreta obliga a elegir una arquitectura, y quién la opera? -->

## Requerimientos

<!-- ¿Qué debe cumplir el sistema (volumen, latencia, frescura, consumidores)? -->

## Restricciones

<!-- ¿Qué límites de equipo, costo, cumplimiento o plataforma acotan el diseño? -->

## Arquitectura propuesta

<!-- ¿Qué diseño se propone y por qué encaja en este escenario? -->

## Diagrama

<!-- ¿Cómo se ve el flujo de datos de punta a punta? Usar Mermaid. -->

## Flujo

<!-- ¿En qué orden se mueven los datos y dónde se decide cada transformación? -->

## Componentes

<!-- ¿Qué piezas intervienen y qué responsabilidad tiene cada una? -->

## Razón de cada componente

<!-- ¿Por qué esta pieza y no otra, dado el escenario y las restricciones? -->

## Alternativas

<!-- ¿Qué alternativas tiene y cuándo sería preferible cada una? -->

## Trade-offs

<!-- ¿Qué se gana y qué se pierde con la propuesta frente a las alternativas? -->

## Escalabilidad

<!-- ¿Cómo escala (datos, concurrencia, equipos) y dónde deja de escalar? -->

## Seguridad

<!-- ¿Cómo se asegura (identidad, permisos, datos sensibles, red)? -->

## Observabilidad

<!-- ¿Cómo se observa (frescura, fallos, costo, calidad) y qué se haría ante una incidencia? -->

## Costo

<!-- ¿Cómo afecta el costo y qué palanca lo domina? -->

## Código relacionado

<!-- ¿Cómo se implementa lo mínimo representativo, o qué snippets existentes lo cubren? -->

## Implementación GCP

<!-- ¿Cómo se implementa en GCP? -->

## Implementación AWS

<!-- ¿Cuál es su equivalente conceptual en AWS, y en qué se diferencia? Nunca presentarlos como lo mismo. -->

## Implementación Azure

<!-- ¿Cuál es su equivalente conceptual en Azure, y en qué se diferencia? Nunca presentarlos como lo mismo. -->
