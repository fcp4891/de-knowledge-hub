# Revisión B-F3.1 · lote F3b-18a

Rama `b/f3b-review-18a`, creada desde `origin/main` (`fe71bb8`). El pedido está en `docs/status/lane-a.md`. Fichas: `iam-fundamentals`, `rbac`, `abac`, `least-privilege`, `service-accounts`, `row-level-security`, `column-level-security` y `data-masking`. No se editó `content/` ni `frontend/`. El CI de 18a no se esperó: los tests se revisaron como código.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| `least-privilege` iguala `GRANT ALL` a 21 privilegios. En PostgreSQL 17, `ALL` también concede `MAINTAIN` (`VACUUM`, `ANALYZE`, `CLUSTER`, `REINDEX`, `LOCK TABLE`). `information_schema.table_privileges` no lo lista, así que el script no lo cuenta ni lo revoca. | media | Decir que los 21 son los de esa vista (7 tipos × 3 tablas) y que `MAINTAIN` queda concedido, o revocarlo con `has_table_privilege`. |
| Sin otros hallazgos. RLS cita el default-deny y el bypass. Azure ABAC y el enmascaramiento coinciden con sus páginas. La cuenta 21 / 3 / 18 es la del test. `gcp-iam-for-data` solo enlaza. Ninguna ficha nombra la ley. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 555 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== iam-fundamentals dups [] missing17 [] sec14 True titles 5 sources 5 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== rbac dups [] missing17 [] sec14 True titles 5 sources 5 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== abac dups [] missing17 [] sec14 True titles 4 sources 4 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== least-privilege dups [] missing17 [] sec14 True titles 6 sources 6 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== service-accounts dups [] missing17 [] sec14 True titles 4 sources 4 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== row-level-security dups [] missing17 [] sec14 True titles 4 sources 4 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== column-level-security dups [] missing17 [] sec14 True titles 5 sources 5 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== data-masking dups [] missing17 [] sec14 True titles 4 sources 4 law [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

`law` busca «ley », «21.719», «GDPR» y «regulaci». No aparecen.

`tests/test_security_snippets.py` exige las frases de las fichas. No se corrió el CI.

```
"con RLS y sin política, norte ve: []"
"norte ve: [1, 3]"
"sur ve: [2]"
"superusuario (salta RLS) ve: [1, 2, 3, 4]"
"privilegios: 21; usados en 30 días: 3; sobran: 18"
"REVOKE DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON clientes FROM pipeline_ventas"
"quedan: [('staging_ventas', 'INSERT'), ('staging_ventas', 'SELECT'), ('ventas', 'INSERT')]"
"dinámico, soporte ve: ['ana.perez@example.com', 'luis@example.org']"
"dinámico, analista ve: ['a***@example.com', 'l***@example.org']"
"estático, copia de desarrollo: ['cliente1@ejemplo.invalid', 'cliente2@ejemplo.invalid']"
"el original no cambió: ['ana.perez@example.com', 'luis@example.org']"
```

*5.9. Row Security Policies* (PostgreSQL 17): «If no policy exists for the table, a default-deny policy is used, meaning that no rows are visible or can be modified». «Superusers and roles with the BYPASSRLS attribute always bypass the row security system». «Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY». La ficha lo dice así. El test ejecuta el default-deny y el salto del superusuario.

*What is Azure attribute-based access control (Azure ABAC)?*: «You cannot explicitly deny access to specific resources using conditions». La nota y la tabla de `abac` lo dicen en español.

*Dynamic data masking*: «Dynamic data masking doesn't aim to prevent database users from connecting directly to the database and running exhaustive queries that expose pieces of the sensitive data». `data-masking` separa dinámico (la máscara al consultar) de estático (una copia) y cita ese límite.

La cuenta de `least-privilege` sale del código: `GRANT ALL` sobre 3 tablas, y la vista lista `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` y `TRIGGER`. 7 × 3 = 21; usados 3; sobran 18. Eso es lo que el test exige. *GRANT* de PostgreSQL 17 incluye además `MAINTAIN` en `ALL`, y *35.53. table_privileges* no lo nombra entre los `privilege_type`.

En AWS, *IAM roles*: «when you assume a role, it provides you with temporary security credentials». `rbac` dice que un rol de IAM es una identidad que se asume, no una lista de miembros.

Los 27 `page_title` coinciden con el encabezado. En PostgreSQL es el `h2` del apartado. En Google, el aviso de collections no entra en el título.

## Diff de gcp-iam-for-data

`git diff d4dc135^..d4dc135 -- content/concepts/gcp-iam-for-data.md`. Solo las dos relaciones, el §17 y una línea de historial. `data-governance` sigue pendiente de ficha.

```diff
diff --git a/content/concepts/gcp-iam-for-data.md b/content/concepts/gcp-iam-for-data.md
index 81d0924..b07f363 100644
--- a/content/concepts/gcp-iam-for-data.md
+++ b/content/concepts/gcp-iam-for-data.md
@@ -97,6 +97,12 @@ relations:
   - type: RELATED_TO
     target: infrastructure-as-code
     note: Las concesiones de IAM se declaran y revisan como código.
+  - type: RELATED_TO
+    target: service-accounts
+    note: Cuentas de servicio fuera de Google Cloud.
+  - type: RELATED_TO
+    target: column-level-security
+    note: Seguridad por columna en general.
 created_at: 2026-10-01
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -218,7 +224,9 @@ Permisos granulares por dataset y bucket reducen el impacto de un error, a cambi
 
 - `gcs-buckets-and-objects`: permisos por bucket con acceso uniforme.
 - `infrastructure-as-code`: concesiones declaradas y revisadas.
-- Del blueprint, pendientes de ficha: `data-governance`, `column-level-security`, `service-accounts`.
+- `service-accounts`: cuentas de servicio en general.
+- `column-level-security`: seguridad a nivel de columna en general.
+- Del blueprint, pendiente de ficha: `data-governance`.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -247,3 +255,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: creación (lote 4 de F3).
 - 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-21: lote F3b-18a (regla del §17): relations y el §17 enlazan `service-accounts` y `column-level-security`, que ya tienen ficha; antes figuraban como pendientes de ficha.
```
