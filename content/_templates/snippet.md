---
# Plantilla de snippet de la Code Library (§23). Copiar a content/snippets/<slug>.md.
# No rellenar aquí: content/_templates/ no se valida.
id: code_snippet:slug-del-snippet       # <type>:<slug>
slug: slug-del-snippet
type: code_snippet
title: Título del snippet
description: Una frase que dice qué hace el código y qué patrón implementa.
language: sql                           # sql | python | terraform | yaml | bash | json | other
dialect: bigquery                       # runtime o dialecto (bigquery, airflow, dataform, hcl...)
requirements: []                        # obligatorio, al menos uno: qué necesita para ejecutarse (tablas, permisos, versiones)
classification: core                    # core | modern | emerging
level: intermediate                     # basic | intermediate | advanced
cloud: [gcp]                            # gcp | aws | azure | agnostic
technologies: []                        # slugs existentes de technology o cloud_service
tags: []
related_topics: []                      # deben estar también en relations
sources: []                             # Nivel 1–2 para afirmaciones de producto
relations: []                           # al menos un IMPLEMENTS hacia un concept o pattern verified
# - type: IMPLEMENTS
#   target: slug-de-la-ficha
#   note: qué parte del patrón implementa
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: review_required    # pasa a verified al aplicar la revisión aprobada sin VERIFY pendientes
---

<!-- El código debe ser ejecutable o indicar exactamente qué requiere. Reutilizar el ejemplo ya corregido de la ficha que implementa, atómico e idempotente. -->

## 1. Qué resuelve

<!-- ¿Qué patrón implementa y qué problema resuelve? -->

## 2. Código

<!-- El código completo, en un bloque con lenguaje. -->

## 3. Cómo funciona

<!-- ¿Qué hace cada parte y por qué es atómico e idempotente? -->

## 4. Cuándo usarlo

<!-- ¿En qué situaciones conviene? -->

## 5. Cuándo no usarlo

<!-- ¿Cuándo no conviene o hay una alternativa mejor? -->

## 6. Riesgos

<!-- ¿Qué puede salir mal (datos, seguridad, costo) y cómo se mitiga? -->

## 7. Requisitos y cómo ejecutarlo

<!-- ¿Qué tablas, permisos, versiones y comandos necesita? -->

## 8. Conceptos relacionados

<!-- Fichas que implementa o con las que se relaciona. -->

## 9. Fuentes

<!-- Documentación que respalda las afirmaciones de producto. -->

## 10. Historial de cambios

<!-- Fecha y cambio. -->
