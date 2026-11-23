# Verificación contra la API de Ley Chile (BCN)

`scripts/verify_bcn.py` consulta la API de Ley Chile y deja un informe en texto. Es **de solo lectura**: no modifica `content/`, no cambia `last_verified` y no decide nada por sí mismo. Sirve como alerta temprana para revisar la ficha madre `chile-data-protection` y la tarjeta `cl-ley-21719`.

## Cómo usarlo

La clave de la API se lee **solo** de la variable de entorno `BCN_API_SECRET`. No se guarda en el repo, en logs ni en informes; las URLs que muestra el informe llevan `secret=***`.

```bash
export BCN_API_SECRET=...        # la clave personal de la API (no la escribas en archivos del repo)
python -m scripts.verify_bcn --desde 2026-11-01
```

Opciones:
- `--desde`: fecha `YYYY-MM-DD` para los cambios recientes (`/servicio/62/`). Es obligatoria.
- `--boletin`: por defecto `18623-07`.
- `--timeout`: segundos por consulta.

## Qué verifica

| Línea | Servicio | ALERTA cuando |
|---|---|---|
| Versiones de la Ley 19.628 | `/servicio/80/` | La versión más reciente en BCN no es la que citan las fichas (`idVersion` de las URLs del repo, hoy 2026-12-01) |
| Cambios de la Ley 19.628, del Decreto 662 y de la Ley 21.719 | `/servicio/62/` | La norma figura como nueva o modificada desde `--desde` |
| Boletín → ley publicada | `/servicio/91/` | El boletín ya tiene una ley asociada; informa su número y su fecha de publicación |
| Boletín → normas que modifica | `/servicio/93/` | BCN ya no lista normas modificadas, o la Ley 21.719 no figura entre ellas |
| CVE del Diario Oficial → Ley 21.719 | `/servicio/94/` | El CVE de la cita del Diario Oficial apunta a otra norma |

**De dónde salen los datos:** los idNorma, la versión citada y el CVE se leen del contenido del repo, a partir de las citas de `bcn-leychile` y del Diario Oficial y de la tarjeta `legal-frameworks/cl-ley-21719.yaml`. No están fijos en el código. Si el repo no permite determinar un único valor, el informe da ERROR.

**Código de salida:**
- `0`: todo OK.
- `1`: alguna alerta.
- `2`: error técnico, incluidos un 401 (clave faltante o inactiva), la falta de `BCN_API_SECRET` y las respuestas ilegibles.

## Límites

- **No reemplaza la consulta del Senado ni la del Diario Oficial.** El estado de un proyecto se confirma en el servicio de tramitación del Senado, y la publicación de una ley, en el Diario Oficial. BCN puede tardar en reflejar ambas cosas.
- **El `/servicio/93/` lo cura a mano el equipo de BCN.** Además, deja de mostrar el proyecto cuando la ley se publica. Que esté vacío es una señal para revisar, no una prueba.
- **Las respuestas de error de `/servicio/91/` no están probadas con la API real.** El script trata como «sin ley todavía» un `status=error` cuyo mensaje dice que no encontró el boletín; cualquier otro mensaje lo informa como ERROR.
- **Límite de uso de la API:** 500 solicitudes por 24 horas por clave, según las condiciones de uso. Cada ejecución hace 5 consultas.
- **Pruebas sin red:** los tests (`tests/test_verify_bcn.py`) usan respuestas sintéticas armadas a partir de los esquemas de la documentación oficial. La primera ejecución con la clave activa tiene que revisarse a mano.
