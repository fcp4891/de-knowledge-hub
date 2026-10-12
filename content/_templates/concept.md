---
# Plantilla de ficha de concepto (§22). Copiar a content/concepts/<slug>.md.
# No rellenar aquí: content/_templates/ no se valida.
id: concept:slug-del-concepto          # <type>:<slug>
slug: slug-del-concepto
type: concept
title: Título del concepto
description: Una frase que dice qué es y para qué sirve.
domain: slug-del-dominio
subdomain: slug-del-subdominio
category: slug-de-categoria
classification: core                    # core | modern | emerging. Emerging no reemplaza lo consolidado.
level: intermediate                     # basic | intermediate | advanced
importance: high                        # high | medium | low
cloud: [agnostic]                       # gcp | aws | azure | agnostic
technologies: []                        # slugs existentes de technology o cloud_service
tags: []
related_topics: []                      # slugs de entidades existentes
sources: []                             # obligatorio, con al menos una, si verification_status es verified
# - source: slug-de-fuente
#   url: https://ejemplo.documentacion/pagina
#   accessed: 2026-09-28
#   note: qué afirmación respalda esta página
relations: []                           # solo aristas salientes; la inversa se deriva del catálogo
# - type: RELATED_TO
#   target: otro-slug
#   note: matiz; en equivalencias, la diferencia
created_at: 2026-09-28
updated_at: 2026-09-28
last_verified: 2026-09-28
verification_status: review_required    # verified | review_required | potentially_outdated | deprecated | archived
---

<!-- Afirmaciones que puedan quedar obsoletas llevan fuente de Nivel 1–2 y last_verified. Si no se pudo verificar: verification_status review_required y un comentario VERIFY. Sin quizzes ni opciones cerradas. -->

## 1. Resumen

<!-- ¿Cuál es la idea central en pocas frases, suficiente para decidir si profundizar? -->

## 2. Qué es

<!-- ¿Qué es? ¿Por qué existe? -->

## 3. Problema que resuelve

<!-- ¿Qué problema resuelve? -->

## 4. Cómo funciona

<!-- ¿Cómo funciona? -->

## 5. Cuándo utilizarlo

<!-- ¿Cuándo usarlo? -->

## 6. Cuándo no utilizarlo

<!-- ¿Cuándo no usarlo? -->

## 7. Ejemplo sencillo

<!-- ¿Cómo se ve en un caso mínimo y concreto? -->

## 8. Ejemplo de producción

<!-- ¿Cómo se ve en un sistema real, con volumen, fallos y operación? -->

## 9. Arquitectura

<!-- ¿Dónde se ubica en un flujo real, con qué componentes y con qué datos? -->

## 10. Código

<!-- ¿Cómo se implementa? El fragmento debe ser ejecutable o decir exactamente qué requiere. -->

## 11. GCP

<!-- ¿Cómo se implementa en GCP? -->

## 12. AWS

<!-- ¿Cuál es su equivalente conceptual en AWS, y en qué se diferencia? Nunca presentarlos como lo mismo. -->

## 13. Azure

<!-- ¿Cuál es su equivalente conceptual en Azure, y en qué se diferencia? Nunca presentarlos como lo mismo. -->

## 14. Buenas prácticas

<!-- ¿Qué conviene hacer para que sea correcto, operable y mantenible? Incluir, si aplica, cómo escala. Obligatorias (validate): las viñetas `- **Seguridad:**`, `- **Observabilidad:**` y `- **Costo:**`. -->

## 15. Errores frecuentes

<!-- ¿Qué errores son frecuentes? -->

## 16. Trade-offs

<!-- ¿Qué alternativas tiene, qué se gana y qué se pierde, y cómo afecta el costo? -->

## 17. Conceptos relacionados

<!-- ¿Con qué otros conceptos se relaciona? Regla: si la ficha nombrada existe, va también en `relations`; si no existe, se escribe «Del blueprint, pendiente de ficha: `slug`.» y no va en `relations`; todo lo que está en `relations` se nombra aquí. -->

## 18. Preguntas técnicas abiertas

<!-- ¿Qué debería poder explicar o diseñar quien domina el tema? Preguntas abiertas, sin alternativas A/B/C/D y sin respuesta escrita. -->

## 19. Laboratorio relacionado

<!-- ¿Qué problema práctico ejercita este concepto? Enlazar el lab si existe; si no, dejar el hueco explícito. -->

## 20. Fuentes

<!-- ¿Qué fuentes respaldan la información? Deben coincidir con sources del frontmatter y ser de Nivel 1 o 2 para lo que pueda cambiar. -->

## 21. Fecha de última verificación

<!-- ¿Cuándo fue verificada por última vez? Debe coincidir con last_verified. -->

## 22. Historial de cambios importantes

<!-- ¿Qué cambió en el concepto o en los productos que obliga a revisar esta ficha? -->
