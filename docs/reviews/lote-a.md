# Revisión · lote A

Rama `b/review-a`, creada desde `2b82967`. ADR-027, enmiendas a ADR-023 y ADR-024, migración 0007, `legal-framework.schema.json`, `content/legal-frameworks/cl-ley-21719.yaml` y el contrato. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

## Por pieza

### ADR-027 y enmiendas

**Hallazgo.** Sin hallazgo. Las enmiendas están en los dos ADR y el validador sigue la de ADR-024.

**Severidad.** ninguna

**Evidencia.** ADR-023, Enmienda 2: el alcance pasa a los dominios `compliance` y `privacy-engineering`. ADR-024, Enmienda 1: la padre es del mismo dominio, no necesariamente del mismo subdominio. `check_part_of` reporta «la ficha padre es de otro dominio» y compara `a.domain != b.domain`. Las 11 fichas, en el diff `2b82967^..2b82967`, solo cambian `domain`, `subdomain`, la nota PART_OF de «Ficha padre del subdominio» a «Ficha padre del dominio» (donde esa era la nota), la primera frase de la descripción de la padre, y una línea de historial. `19-compliance` queda en `regulatory-frameworks` (GDPR y LGPD). Las cuatro fichas nuevas están en el blueprint como «Pendiente de ficha».

**Corrección.** Ninguna.

### Migración 0007

**Hallazgo.** Sin hallazgo. Agrega `domains.band` y `domains.legal_framework`, crea `legal_frameworks` y baja en el orden inverso. `COMPILER_VERSION` es `"7"`.

**Severidad.** ninguna

**Evidencia.** `backend/db/migrations/versions/0007_domain_band_and_legal_frameworks.py`: `revision = "0007"`, `down_revision = "0006"`. `backend/db/compiler.py`: `COMPILER_VERSION = "7"`.

**Corrección.** Ninguna.

### `legal-framework.schema.json`

**Hallazgo.** Sin hallazgo. Cada hecho exige `url`, `source` y `verified_at`. La URL queda limitada a BCN, LeyChile, Senado o Cámara.

**Severidad.** ninguna

**Evidencia.** `required` del hecho: `key`, `label`, `value`, `url`, `source`, `verified_at`. El patrón de `url` y de `checked_with` es `^https://(www\.bcn\.cl|nuevo\.leychile\.cl|tramitacion\.senado\.cl|www\.senado\.cl|www\.camara\.cl)/`. Las tres URL del YAML calzan.

**Corrección.** Ninguna.

### `cl-ley-21719.yaml`

**Hallazgo.** Sin hallazgo. La vigencia `2026-12-01` y el estado del boletín 18.623-07 coinciden con BCN y con el servicio del Senado consultados en esta revisión.

**Severidad.** ninguna

**Evidencia.** BCN, `get_norma_json` de la Ley 21.719 (`idNorma=1209272`): título «REGULA LA PROTECCIÓN Y EL TRATAMIENTO DE LOS DATOS PERSONALES Y CREA LA AGENCIA DE PROTECCIÓN DE DATOS PERSONALES»; `fecha_promulgacion` `2024-11-25`; `fecha_publicacion` `2024-12-13`. El artículo primero transitorio dice que las modificaciones «entrarán en vigencia el día primero del mes vigésimo cuarto posterior a la publicación de esta ley en el Diario Oficial».

BCN, Ley 19.628 (`idNorma=141599`, `idVersion=2026-12-01`): `tipo_version_s` «Con Vigencia Diferida por Fecha»; `inicio_vigencia` `2026-12-01`. La versión anterior va del `2023-05-09` hasta el `2026-11-30`.

Senado, `tramitacion.php?boletin=18623`, boletín `18623-07`: `estado` «En tramitación»; `etapa` «Primer trámite constitucional (Senado)»; `subetapa` «Oficio de ley a Cámara Revisora»; `urgencia_actual` «Discusión inmediata»; `leynro` vacío. El 27/10/2026, primer informe de Constitución y primer informe de Hacienda. El 28/10/2026, sesión 75/374: «Discusión general . Aprobado en general y particular a la vez». El YAML dice que sigue siendo un proyecto y que la vigencia no cambia. El mensaje del proyecto (id 19307) respondió 403 en esta revisión; la nota que le atribuye el «1 de diciembre de 2027» no se releyó en el archivo del mensaje.

**Corrección.** Ninguna.

### Contrato de la API

**Hallazgo.** `GET /domains` sigue descrito como «Los 23 dominios». El mock de esa respuesta trae 24.

**Severidad.** baja

**Evidencia.** `docs/contracts/api.yaml`, línea 29: «Los 23 dominios, ordenados por id.» `docs/contracts/mock-data/domains.json` tiene 24 `slug`, el último `privacy-engineering` con `band: especializacion`. `tests/test_static_data.py` espera 24 ítems. `DomainDetail` de `privacy-engineering` trae `legal_framework` con los tres hechos. `band` es `especializacion` o `null` (OpenAPI 3.1).

**Corrección.** Cambiar la descripción de `GET /domains` a 24 dominios.
