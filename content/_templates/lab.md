---
# Plantilla de laboratorio (§25). Copiar a content/labs/<slug>.md.
# No rellenar aquí: content/_templates/ no se valida.
# lab_type (tipos A–E): implementation | debugging | optimization | architecture | comparison
#   A implementation: construir algo (carga, modelo, pipeline).
#   B debugging: diagnosticar un fallo y proponer cómo corregirlo.
#   C optimization: reducir costo, latencia o volumen procesado.
#   D architecture: diseñar una plataforma ante un escenario.
#   E comparison: resolver el mismo escenario en GCP, AWS y Azure y explicar diferencias.
id: lab:slug-del-laboratorio
slug: slug-del-laboratorio
type: lab
title: Título del laboratorio
description: Qué habilidad ejercita, en una frase.
domain: slug-del-dominio
subdomain: slug-del-subdominio
classification: core                    # core | modern | emerging
level: intermediate                     # basic | intermediate | advanced (obligatorio)
lab_type: implementation                # implementation | debugging | optimization | architecture | comparison
cloud: [agnostic]
technologies: []
tags: []
related_topics: []                      # slugs de los conceptos que se practican
sources: []
relations: []
# - type: PRACTICES
#   target: slug-del-concepto
#   note: qué aspecto del concepto ejercita este lab
created_at: 2026-09-28
updated_at: 2026-09-28
last_verified: 2026-09-28
verification_status: review_required
---

<!-- Problema abierto. No incluir solución, respuesta modelo, rúbrica numérica ni opciones A/B/C/D. -->

## Tipo

<!-- ¿Es implementación, debugging, optimización, arquitectura o comparación (lab_type)? -->

## Escenario

<!-- ¿Qué situación tiene delante quien resuelve el lab, y qué se le pide entregar? -->

## Datos de entrada

<!-- ¿Con qué datos, esquemas o síntomas parte? Deben alcanzar para razonar, sin adelantar la solución. -->

## Restricciones

<!-- ¿Qué no puede cambiar (herramienta, costo, latencia, permisos, plazo)? -->

## Criterios de una buena solución

<!-- ¿Qué propiedades debe tener una buena solución (idempotencia, costo, claridad, trade-offs explícitos)? Criterios observables, no una respuesta cerrada. -->

## Conceptos practicados

<!-- ¿Qué conceptos ejercita? Deben coincidir con relations PRACTICES y con slugs existentes. -->

## Diferencias entre nubes

<!-- Solo si lab_type es comparison: ¿qué debe explicar de GCP, AWS y Azure sin tratarlos como lo mismo? En otro tipo, omitir esta sección. -->
