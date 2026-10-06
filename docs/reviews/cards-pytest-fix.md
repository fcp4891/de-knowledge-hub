# Revisión B-F3.1 · `normalize_amount` en `testing-with-pytest`

Ficha en `content/concepts/testing-with-pytest.md`. Carril B no la edita. El cambio está en la §10 (2026-10-06): la función deja de hacer `int(raw.replace(".", "").strip())` y valida el texto con la expresión de miles de `data-transformation` sin el grupo decimal `(,\d+)?`, porque el retorno es un entero en pesos.

Felipe aprobó las 5 filas el 2026-10-06. No piden cambios en la ficha.

## `testing-with-pytest` · §10

Comprobé la misma expresión en Python el 2026-10-06.

| Criterio | Hallazgo | Estado |
|---|---|---|
| El patrón rechaza los casos que antes se convertían mal | El patrón (grupos de miles con punto, o dígitos sin separador) no acepta `10.50`, `1.2.3` ni `12.34`. Esos tres, más `-5`, `N/D` y `""`, caen en `ValueError` con `match="formato"` antes de quitar los puntos. | aprobada (aprobado por Felipe) |
| Los casos válidos de la ficha | `1.250` → 1250, `90` → 90 y ` 3.000 ` (tras `strip`) → 3000. El mismo patrón también acepta `1250`, `10.000` y `1.250.000` (1250000) y rechaza `1.25`, `1000.000` y `1.250.50`. | aprobada (aprobado por Felipe) |
| Sin decimales, a propósito | Respecto de `data-transformation`, falta `(,\d+)?`. La ficha lo dice: el ejemplo devuelve `int` y no admite coma decimal. `1.250,50` queda fuera. | aprobada (aprobado por Felipe) |
| Los 10 tests | 3 casos válidos parametrizados, 6 inválidos y `test_load_rows`. La §7 sigue con el ejemplo corto `assert normalize_amount("1.250") == 1250`, que sigue siendo correcto y no sustituye a la batería de la §10. | aprobada (aprobado por Felipe) |
| Error técnico o simplificación peligrosa | No hay. El `strip` va antes del `match`, así que el espacio de ` 3.000 ` no rompe el ancla. El signo y el texto vacío no pasan. | aprobada (aprobado por Felipe) |
