---
# Plantilla de noticia técnica (§31) con relevancia (§32). Copiar a content/news/<slug>.md.
# No rellenar aquí: content/_templates/ no se valida.
# relevance:
#   critical  — afecta producción, seguridad, APIs o servicios que ya usamos
#   important — funcionalidad relevante para arquitecturas actuales
#   useful    — mejora que conviene conocer
#   watch     — emergente; todavía no pide estudio profundo
# La relevancia sale de ese criterio, no de la popularidad en redes.
id: news:slug-de-la-noticia
slug: slug-de-la-noticia
type: news
title: Título de la noticia
description: Qué cambió y por qué le importa a Data Engineering, en una frase.
domain: slug-del-dominio
published_at: 2026-09-28                # fecha del anuncio
relevance: useful                       # critical | important | useful | watch
review_state: pending_review            # pending_review | approved | discarded
url: https://ejemplo.documentacion/anuncio
classification: modern                  # core | modern | emerging, si aplica al tema
cloud: [agnostic]
technologies: []                        # producto o tecnología afectados (slugs existentes)
tags: []
related_topics: []                      # conceptos o fichas a revisar
sources: []                             # la fuente de la noticia; tipo de fuente vive en la entidad source
# - source: slug-de-fuente
#   url: https://ejemplo.documentacion/anuncio
#   accessed: 2026-09-28
#   page_title: título de la página citada, tal como lo muestra (ADR-012); se omite si no se pudo verificar
relations: []
# - type: AFFECTS
#   target: slug-de-tecnologia-o-concepto
#   note: qué habría que revisar en esa ficha
created_at: 2026-09-28
updated_at: 2026-09-28
last_verified: 2026-09-28
verification_status: review_required
---

<!-- Título, producto, fecha, fuente y tipo de fuente van en el frontmatter (technologies, published_at, sources, url). No inventar la URL. -->

## Qué ocurrió

<!-- ¿Qué ocurrió? -->

## Qué existía antes

<!-- ¿Qué existía antes? -->

## Qué cambió

<!-- ¿Qué cambió? -->

## Por qué importa

<!-- ¿Por qué importa para Data Engineering? -->

## A quién afecta

<!-- ¿A quién afecta? -->

## Práctica a revisar

<!-- ¿Requiere cambiar alguna práctica existente? -->

## Contenido a actualizar

<!-- ¿Debemos actualizar contenido existente? Indicar slugs, o decir que ninguno. -->

## Relevancia

<!-- ¿Qué criterio de §32 aplica (critical, important, useful o watch) y por qué no es solo ruido o popularidad? -->

## Conceptos relacionados

<!-- ¿Con qué conceptos o fichas se relaciona este cambio? -->

## Documentación oficial

<!-- ¿Qué página oficial respalda el anuncio? Debe coincidir con url y con sources. -->
