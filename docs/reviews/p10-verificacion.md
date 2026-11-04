# Verificación P10 · `cf4edfd`

`cf4edfd` está en `main` («Aplica la revisión P10 a cuatro fichas del dominio 24», 2026-11-04). Solo lectura. BCN abierta el 2026-11-04: Ley 19.628, versión «Con Vigencia Diferida por Fecha» desde 2026-12-01, `https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01`. Estado de la verificación: pendiente.

## chile-data-protection

El §10 trae cuatro citas entre comillas. Tres coinciden carácter a carácter con el art. 3 de hoy.

| Cita | BCN | Resultado |
|---|---|---|
| «quienes tengan acceso a ellos deberán guardar secreto o confidencialidad» | h), misma frase | igual |
| «este deber subsiste aún después de concluida la relación con el titular» | h): «Este deber subsiste…» | difiere la mayúscula |
| «exactos, completos, actuales y pertinentes» | d) | igual |
| «luego de lo cual deben ser suprimidos o anonimizados» | c) | igual |

No hay más comillas en el §10. El docstring de **responsabilidad** no cita: parafrasea el art. 3 e). El de minimización de columnas tampoco: dice «se limitan estrictamente a los necesarios, adecuados y pertinentes», y el artículo dice «deben limitarse estrictamente a aquéllos que resulten necesarios, adecuados y pertinentes».

**Hallazgo.** La cita de confidencialidad abre con «este» y BCN abre la oración con «Este».

**Severidad.** Baja.

**Evidencia.** Docstring de `access_review` en `cf4edfd`. BCN, art. 3 h): «Este deber subsiste aún después de concluida la relación con el titular.»

**Corrección.** «Este deber subsiste aún después de concluida la relación con el titular».

Los cuatro escenarios de `controles.py` coinciden con el bloque `text` (`test_privacy_controls_each_scenario_prints_its_documented_output`).

## Las otras tres

Los cambios de `docs/reviews/p10.md` están aplicados. Siete tests de `cf4edfd`, en verde, contra el contenido de ese commit. La minimización usó el PostgreSQL del `database_url` (el fixture `pg_env`).

```text
PASSED test_privacy_controls_each_scenario_prints_its_documented_output
PASSED test_pii_detector_each_scenario_prints_its_documented_output
PASSED test_pii_detector_rules
PASSED test_inventory_each_scenario_prints_its_documented_output
PASSED test_inventory_rules
PASSED test_minimization_each_scenario_prints_its_documented_output
PASSED test_minimization_guided_code_rules
```

- `pii-identification`: el §15 dice «renta» en `rentabilidad_producto`. Esa subcadena existe y la regla por tokens no la toma. Lo comprueba `test_pii_detector_rules`. Las tres salidas de `detector.py` coinciden.
- `processing-activities-inventory`: la conciliación de `actual` y `corregido` sale como alerta; `despliegue-nuevo` bloquea 3 de 4 y distingue «actividad no vigente» de «no declarado». Las tres salidas coinciden.
- `data-minimization-by-layer`: `sin-clasificar` imprime `UNKNOWN silver.segmento` y sale 1. Los cinco escenarios coinciden.

**Hallazgo.** En el inventario, la viñeta Cobertura sigue diciendo que una cuenta sin mapear «bloquea». El §10 nuevo llama a ese código 1 una alerta, y dice que no detiene el consumo.

**Severidad.** Baja.

**Evidencia.** La viñeta Cobertura no cambió en `cf4edfd`. La viñeta Momento, sí: «ese 1 es la alerta operacional del §9, no detiene un consumo en producción».

**Corrección.** En Cobertura, decir que `UNKNOWN` deja la conciliación en 1, como alerta.
