# Revisión · NULL en CONCAT y claves no exigidas

Fichas en `content/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-07, incluidas las cinco propuestas: advertir que el separador `|` no debe aparecer en los valores; advertir que el marcador `\N` no debe aparecer como valor; en `data-reconciliation`, publicar el caso con `monto` NULL (los dos lados, conteo, suma, huellas y `!=` frente a `IS DISTINCT FROM`); en `grain` §4, `NONCLUSTERED` junto a `NOT ENFORCED` en Fabric; en `surrogate-keys` §10, marcar el SQL de BigQuery como sintaxis documentada, no ejecutado. Carril A aplica las propuestas.

Alcance: `grain` §4; `data-reconciliation` §10; snippet `bigquery-reconciliation`; `surrogate-keys` §10; `surrogate-key-generation` §4, §8 y §10.

## Comprobaciones pedidas

| Criterio | Hallazgo | Estado |
|---|---|---|
| Separador entre campos | En las huellas de varias columnas hay `\|` entre cada par: `venta_id` y `monto` en `data-reconciliation` y en el snippet; `origen`, `cliente_id_origen` y `valido_desde` en `surrogate-keys`. `('ab','c')` queda `ab\|c` y `('a','bc')` queda `a\|bc`. `surrogate-key-generation` hashea una sola clave, con prefijo `cliente\|` o `producto\|`: ese par de dos campos no se arma. Un valor que ya contiene `\|` sí choca: `('a\|b','c')` y `('a','b\|c')` dan la misma cadena. Estas fichas no lo dicen. Propuesta: donde hay más de una columna, decir que el separador no debe aparecer en los valores. | aprobada |
| Marcador `\N` | El literal de BigQuery en el archivo es `'\\N'` y el de PostgreSQL es `'\N'`: los dos son la cadena barra invertida + N. Un `NULL` y un texto real `\N` producen la misma huella. En `monto` (y en un `venta_id` numérico) el `CAST` a texto no genera `\N`. En `surrogate-keys`, `origen` y `cliente_id_origen` van como texto, y en `surrogate-key-generation` la clave natural también: un valor `\N` coincide con un `NULL`. Rechazar la clave nula antes, como dice `surrogate-key-generation`, no cubre ese texto. `change-detection` §4 ya pide un marcador que no pueda aparecer en los datos; estas fichas copian `\N` y no repiten esa condición. Propuesta: advertirlo en cada ficha que usa el marcador. | aprobada |
| Caso con `monto` NULL | La prosa de `data-reconciliation` §10 es la aritmética de ese ejemplo: origen `(1, 100), (2, NULL)` y destino `(1, 100), (3, NULL)`; sin marcador, conteo 2, suma 100 y la misma huella, porque `\|\|` con `NULL` da `NULL` y `BIT_XOR` omite esa fila; con marcador, `2\|\N` y `3\|\N` dejan huellas distintas. Un `monto` que pasa de 100 a `NULL` en la misma clave no entra en un `WHERE` con `!=` y sí con `IS DISTINCT FROM`. El bloque publicado no muestra eso: son dos `SELECT` solo sobre `origen`, sin destino, sin conteo, sin suma y sin el `WHERE` de `!=` frente a `IS DISTINCT FROM`. El comentario dice que `fp()` reproduce `FARM_FINGERPRINT`; son 60 bits de MD5, y alcanzan para ver el `NULL`, no el valor de FarmHash. Propuesta: publicar las dos tablas, el conteo, la suma, las dos huellas y la comparación `!=` / `IS DISTINCT FROM`. | aprobada |

## `grain` · §4

| Criterio | Hallazgo | Estado |
|---|---|---|
| Claves no exigidas, por motor | La §4 separa los tres: BigQuery no aplica la clave primaria (`NOT ENFORCED`), Redshift la trata como informativa y Fabric Warehouse solo la admite como `NOT ENFORCED`. Cada frase usa el término de la nota de ese motor. No junta `UNIQUE` ni claves foráneas en esa oración. La página de Fabric exige `NONCLUSTERED` y `NOT ENFORCED` juntos; la §13 ya lo dice y la §4 se queda en `NOT ENFORCED`. Propuesta: en la §4, «`NONCLUSTERED` y `NOT ENFORCED`», como la §13. | aprobada |

## `data-reconciliation` · §10 y snippet `bigquery-reconciliation`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Marcador, `CAST` e `IS DISTINCT FROM` | Las dos copias usan `IFNULL(CAST(… AS STRING), '\\N')` y `\|` en `venta_id` y `monto`, y el detalle compara el monto con `IS DISTINCT FROM`. La nota de operadores de BigQuery respalda ese predicado; no se lo atribuye a Redshift. El snippet remite el caso de prueba a la §10. El SQL de BigQuery está marcado como no ejecutado. Aplican las tres propuestas de arriba: el separador dentro del valor, la advertencia del marcador y el bloque de PostgreSQL con los dos lados. | aprobada |

## `surrogate-keys` · §10

| Criterio | Hallazgo | Estado |
|---|---|---|
| Marcador y `CAST` | `cliente_hk` lleva `IFNULL` y `\|` en las tres columnas. `valido_desde` va con `CAST` a `STRING`. `origen` y `cliente_id_origen` entran como texto, sin `CAST`. El comentario dice que un `NULL` dejaría la clave en `NULL`. El bloque no dice que ese SQL de BigQuery no se ejecutó; `data-reconciliation` y `surrogate-key-generation` sí lo dicen. Propuesta: marcarlo como sintaxis documentada, no ejecutado. Aplican también la advertencia del marcador y la del separador dentro del valor. | aprobada |

## `surrogate-key-generation` · §4, §8 y §10

| Criterio | Hallazgo | Estado |
|---|---|---|
| Marcador en la clave natural | §4, §8 y §10 usan `CONCAT('cliente\|', IFNULL(CAST(… AS STRING), '\\N'))`. El ejemplo ejecutado en PostgreSQL es `producto\|` más `coalesce(codigo, '\N')`, con `P1` y `P3`: no hay un `NULL` en esos datos, así que esa consulta no muestra el marcador. La §4 dice que una clave natural nula se rechaza antes. Aplica la advertencia de que `\N` no sea un valor real. Hay una sola columna de negocio, con el `\|` entre el prefijo y la clave. | aprobada |
