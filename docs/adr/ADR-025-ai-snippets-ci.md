# ADR-025 — Ejemplos de 21-ai-for-data-engineering en la CI sin APIs pagadas

- **Estado:** Aceptado (decisiones de Felipe al aprobar el plan de 21, 2026-10-25)
- **Fecha:** 2026-10-25
- **Fase:** F3b — Contenido por dominio, dominio 21-ai-for-data-engineering
- **Referencias:**
  - ADR-011 y ADR-013: servicios de nube sin ejecutar o emulados.
  - ADR-016: Docker real en la CI, con imágenes por digest.
  - ADR-017: un contenedor con `docker run` desde el test.
  - ADR-020: OpenTelemetry sin collector.

## Contexto

21 trata de LLM, embeddings, retrieval y sistemas con IA. Las APIs de los modelos (Gemini Enterprise Agent Platform, Amazon Bedrock y Microsoft Foundry) cobran por uso y piden credenciales, así que la CI no las llama.

Lo que rodea al modelo sí se puede ejecutar:

- los presupuestos de tokens;
- los esquemas de salida;
- el despacho de herramientas;
- el chunking, los índices y la evaluación offline.

## Decisión

1. **Opción A, vectores deterministas con numpy, en todos los tests.**
   - Los ejemplos que necesitan vectores usan un vectorizador por hashing de n-gramas de caracteres, normalizado en L2, con numpy y sin descargas. El resultado es siempre el mismo.
   - **Son vectores léxicos, no semánticos.** La ficha lo dice: sirven para mostrar similitud coseno, índices, filtros y fusión, no la calidad de un modelo de embeddings.
   - numpy ya llegaba a la CI con Great Expectations. Ahora va explícito en `requirements-snippets.txt`.
2. **Opción B, fastembed, solo en `embeddings` (21a) y `rag` (21b).**
   - **Versión:** `fastembed==0.9.0`, publicada en PyPI el 2026-10-07; la 0.9.1, del 2026-10-24, tiene menos de dos semanas.
   - **Modelo:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensiones, multilingüe, 0.22 GB según `TextEmbedding.list_supported_models()`), desde el repositorio de Hugging Face `Qdrant/paraphrase-multilingual-MiniLM-L12-v2-onnx-Q`.
   - **Revisión fijada:** `faf4aa4225822f3bc6376869cb1164e8e3feedd0`. El test la descarga con `huggingface_hub.snapshot_download` y fastembed la carga con `specific_model_path`.
   - **Caché en la CI:** `actions/cache` sobre `~/.cache/dekh-models`, con la revisión en la clave.
   - **Si la descarga falla, no rompe el build.** El test se marca con `pytest.skip("no ejecutado: …")`, que la CI muestra en el resumen (`PYTEST_ADDOPTS: -rs`). Esto es solo para la descarga: si el modelo carga y el resultado no coincide, el test falla.
3. **pgvector, con `docker run` como en ADR-017.**
   - **Imagen:** `pgvector/pgvector:0.8.7-pg17`, fijada por el digest del índice multiplataforma, consultado el 2026-10-25 en el registro de Docker Hub: `pgvector/pgvector:0.8.7-pg17@sha256:ac08538c6f8b9904c33c8224c5e5706dbe760aca29db1d096972b4052c22a75d`.
   - **Aparte del servicio `postgres:17` de la CI, que no tiene la extensión:** el test levanta el contenedor en otro puerto y lo borra al terminar.
   - **Con `REQUIRE_DOCKER=1` no se salta** (ADR-016).
   - Se implementa con 21b.
4. **Llamadas a Bedrock validadas sin red.**
   - Los ejemplos de Converse y CountTokens usan `botocore.stub.Stubber`. Botocore valida los parámetros del request contra el modelo del servicio antes de enviarlo, y el Stubber valida la respuesta encolada. El cliente se crea sin firma (`UNSIGNED`) y no sale a la red.
   - `boto3-stubs` agrega el extra `bedrock-runtime` para `mypy --strict`.
   - La respuesta del modelo es fija y la ficha lo dice.
5. **Lo que queda «no ejecutado».**
   - Las llamadas reales a Agent Platform, Bedrock y Foundry.
   - La calidad de lo que genera un modelo.
   - LLM como juez.
   - Los rerankers y guardrails administrados.
   - Los embeddings de las tres nubes.

## Consecuencias

- La CI descarga un modelo de 0.22 GB la primera vez y lo reutiliza desde la caché mientras no cambie la revisión.
- Actualizar el modelo o fastembed significa cambiar la revisión o la versión en el test, en las dos fichas y en este ADR.
- Los ejemplos con salida de modelo usan respuestas fijas. La ficha muestra qué se valida alrededor del modelo, no el modelo.
