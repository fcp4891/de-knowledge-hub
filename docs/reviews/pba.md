# Revisión PBA · §10 de purpose-based-authorization

Base: `60de40e` (`main`). Rama `b/review-pba`. Solo lectura de `content/`. La ficha está en `review_required`. Estado de la revisión: pendiente.

BCN abierta el 2026-11-04: Ley 19.628, versión «Con Vigencia Diferida por Fecha» desde 2026-12-01, `https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01`.

## Corrida

Los dos tests terminaron en verde. El de igualdad compara stdout y código de salida con el bloque `text`, y llama a `mypy --strict`.

```text
PASSED test_purpose_authorization_each_scenario_prints_its_documented_output
PASSED test_purpose_authorization_rules
```

`solicitudes` sale 0, `fuga` sale 1 y `revision` sale 1. La salida es la documentada.

## Lo que enseña

**Hallazgo.** El §10 muestra deny por defecto, permitir / denegar / escalar, la concesión vencida, el producto mínimo por columnas, la cuenta compartida y la revisión de 90 días. Lo esperado de cada caso está escrito a mano.

**Severidad.** Ninguna.

**Evidencia.** En `solicitudes`: `PERMITIR`, `DENEGAR: sin concesión para ese producto`, `ESCALAR: finalidad en revisión`, `DENEGAR: concesión vencida` y `DENEGAR: pide rut, fuera de contacto_minimo`. En `fuga`, esa última pasa a `PERMITIR` y la línea marca `← se esperaba DENEGAR`. En `revision`: `cuenta compartida: sa-compartida` y `sin confirmar en 90 días`. `casos()` no recibe el registro (`test_purpose_authorization_rules`). `PERIODO_REVISION` está comentado como política interna (línea 166) y la limitación del plazo lo repite.

## Rigor legal

**Hallazgo.** El art. 3 nombra **finalidad** y **proporcionalidad** en negrita. El art. 14 quáter trae los cuatro factores como en BCN: número de datos recogidos, extensión del tratamiento, plazo de conservación y accesibilidad. Los 90 días y el deny por defecto no se presentan como obligación legal. La letra b) del art. 34 quáter es la correcta, y la frase no es el texto de BCN.

**Severidad.** Baja.

**Evidencia.** §2, línea 64, y el paso 2 del §10 (línea 324) usan los nombres en negrita. §2, línea 65, repite los cuatro factores del art. 14 quáter. §3, línea 83: «Destinar maliciosamente los datos a una finalidad distinta de la consentida o prevista en la ley». BCN, art. 34 quáter b): «Destinar maliciosamente los datos personales a una finalidad distinta de la consentida por el titular o prevista en la ley que autoriza su tratamiento.» Faltan «personales», «por el titular» y «que autoriza su tratamiento». La frase siguiente dice que el control no califica la intención.

**Corrección.** Citar la letra b) completa.

## Calidad del código

**Hallazgo.** `mypy --strict` pasa. El registro no es un global: `vigentes`, `del_producto`, `decidir`, `probar`, `cuentas_compartidas` y `sin_confirmar` lo reciben. No hay `assert` en el bloque. Los datos son cuentas y grupos ficticios (`grp-soporte`, `sa-bi-operacional`); la salida no imprime valores personales.

**Severidad.** Ninguna.

**Evidencia.** `test_purpose_authorization_rules` y la igualdad de stdout, que incluye `mypy --strict`.
