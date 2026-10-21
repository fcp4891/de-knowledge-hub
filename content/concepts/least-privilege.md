---
id: concept:least-privilege
slug: least-privilege
type: concept
title: Mínimo privilegio
description: "Conceder solo los permisos necesarios, sobre los recursos necesarios, y retirar los que no se usan. Se aplica al dar el acceso y se mantiene comparando lo concedido con lo usado. Ejemplo ejecutado en la CI: privilegios de un rol en PostgreSQL 17 frente a su uso, con los REVOKE de lo que sobra. Use IAM securely en Google Cloud, buenas prácticas de IAM y Access Analyzer en AWS, y Azure RBAC, con sus diferencias."
domain: security
subdomain: access-control
category: security
classification: core
level: basic
importance: high
cloud: [agnostic]
technologies: [postgresql, gcp-iam, aws-iam, microsoft-entra-id]
tags: [security, least-privilege, iam, revoke, access-review]
related_topics: [iam-fundamentals, rbac]
sources:
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-grant.html
    accessed: 2026-10-21
    page_title: "GRANT"
    note: "GRANT (PostgreSQL 17): concede privilegios sobre objetos (tablas, columnas, secuencias, esquemas, entre otros) a roles, también por columna (SELECT, INSERT, UPDATE o REFERENCES sobre columnas indicadas) y con WITH GRANT OPTION para que el receptor pueda concederlos a su vez."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/ddl-priv.html
    accessed: 2026-10-21
    page_title: "5.8. Privileges"
    note: "5.8. Privileges (PostgreSQL 17): al crear un objeto se le asigna un dueño y al principio solo él (o un superusuario) puede usarlo; para otros roles hay que conceder privilegios, que REVOKE quita. Entre los privilegios está MAINTAIN, que permite VACUUM, ANALYZE, CLUSTER, REFRESH MATERIALIZED VIEW, REINDEX y LOCK TABLE sobre una relación. Los privilegios concedidos se muestran como una lista de aclitem (grantee = abreviaturas / grantor)."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/infoschema-table-privileges.html
    accessed: 2026-10-21
    page_title: "35.53. table_privileges"
    note: "35.53. table_privileges (PostgreSQL 17): la vista identifica los privilegios concedidos sobre tablas o vistas a un rol habilitado o por él; su columna privilege_type solo toma los valores SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES o TRIGGER, así que MAINTAIN no aparece en ella."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/using-iam-securely
    accessed: 2026-10-21
    page_title: "Use IAM securely"
    note: "Use IAM securely (Google Cloud), sección Least privilege: los roles básicos incluyen miles de permisos de todos los servicios; en producción no se conceden salvo que no haya alternativa, sino los roles predefinidos o personalizados más limitados que alcancen; para reemplazar un rol básico se pueden usar las recomendaciones de roles y el Policy Simulator para comprobar que el cambio no afecta el acceso."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
    accessed: 2026-10-01
    page_title: "Security best practices in IAM"
    note: "Mínimo privilegio: conceder solo los permisos necesarios, definiendo acciones sobre recursos concretos bajo condiciones concretas; personas federadas con credenciales temporales."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html
    accessed: 2026-10-12
    page_title: "Using AWS Identity and Access Management Access Analyzer"
    note: "Using IAM Access Analyzer: analizadores de acceso externo (recursos compartidos con entidades externas), de acceso interno y de acceso sin uso."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview
    accessed: 2026-10-01
    page_title: "Understand scope for Azure RBAC"
    note: "Ámbitos en cuatro niveles con relación padre-hijo: grupo de administración, suscripción, grupo de recursos y recurso."
relations:
  - type: RELATED_TO
    target: iam-fundamentals
    note: El modelo de permisos.
  - type: RELATED_TO
    target: rbac
    note: Roles con lo justo.
  - type: RELATED_TO
    target: service-accounts
    note: Las cuentas de servicio también, o más.
  - type: RELATED_TO
    target: column-level-security
    note: Mínimo privilegio a nivel de columna.
created_at: 2026-10-21
updated_at: 2026-10-21
last_verified: 2026-10-21
verification_status: verified
---

## 1. Resumen

**Mínimo privilegio** es conceder solo los permisos necesarios, sobre los recursos necesarios, y retirar los que no se usan. Tiene dos momentos:

- **al conceder:** el rol más acotado que alcanza, en el alcance más chico que sirve (Google Cloud: no conceder roles básicos en producción salvo que no haya alternativa, *Use IAM securely*);
- **al mantener:** comparar lo concedido con lo usado y revocar lo que sobra (AWS: Access Analyzer detecta, entre otros, accesos sin uso).

## 2. Qué es

- **Privilegio concedido:** lo que el rol puede hacer.
- **Privilegio usado:** lo que hizo en un período (de los logs de auditoría).
- **Exceso:** concedido y no usado; candidato a revocar.

## 3. Problema que resuelve

Para que un pipeline nuevo «funcione ya», le dan `ALL` sobre tres tablas. Un año después, una credencial filtrada de ese pipeline permite borrar clientes, aunque el pipeline solo insertaba. Con mínimo privilegio, el pipeline tenía `INSERT` en dos tablas y `SELECT` en una.

## 4. Cómo funciona

1. Al crear el acceso, se concede lo mínimo y se prueba.
2. Se registra el uso real (auditoría).
3. Periódicamente, se compara concedido con usado.
4. Se revoca el exceso, con aviso al dueño.
5. Se vuelve a probar que el proceso sigue funcionando.

## 5. Cuándo utilizarlo

- Siempre, y más con cuentas de servicio y roles con escritura.
- Antes de dar acceso a datos sensibles.

## 6. Cuándo no utilizarlo

- Revocando sin mirar el período: un proceso trimestral no aparece en 30 días de logs.

## 7. Ejemplo sencillo

El rol `pipeline_ventas` tenía `ALL` sobre `staging_ventas`, `ventas` y `clientes`: 24 privilegios, 8 por tabla, incluido `MAINTAIN` (*5.8. Privileges*). La vista `information_schema.table_privileges` muestra 21, porque no lista `MAINTAIN` (*35.53. table_privileges*); por eso el ejemplo los lee de `pg_class.relacl` con `aclexplode`. En 30 días usó 3.

| Tabla | Se revoca | Queda |
|---|---|---|
| `staging_ventas` | DELETE, MAINTAIN, REFERENCES, TRIGGER, TRUNCATE, UPDATE | INSERT, SELECT |
| `ventas` | DELETE, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | INSERT |
| `clientes` | todo, incluido MAINTAIN | nada |

## 8. Ejemplo de producción

- Roles nuevos con lo mínimo, aprobados por el dueño de los datos.
- Un job mensual compara privilegios con 90 días de auditoría y propone revocaciones.
- El dueño aprueba; la revocación se aplica como código.
- Las cuentas de servicio sin uso en 90 días se deshabilitan.

## 9. Arquitectura

```mermaid
flowchart LR
  G["Concedido<br/>(pg_class.relacl)"] --> C{"Comparar"}
  U["Usado<br/>(auditoría)"] --> C
  C -- "exceso" --> R["REVOKE propuesto"]
  R --> D["Dueño aprueba"]
```

## 10. Código

```python
# Python 3.12 y psycopg contra PostgreSQL 17 (ejecutado en la CI con el servicio postgres:17): mínimo privilegio.
# Se leen los privilegios reales del rol desde pg_class.relacl con aclexplode (incluye MAINTAIN, que la vista
# information_schema.table_privileges no muestra), se comparan con los usados en 30 días y se revoca lo que sobra.
# PG_HOST, PG_PORT, PG_USER, PG_PASSWORD y PG_DB: base vacía temporal; el rol lleva sufijo y se borra.
import os

import psycopg

S = os.environ["PG_DB"]
ROL = f"pipeline_ventas_{S}"
TABLAS = ("staging_ventas", "ventas", "clientes")
USADOS = {("staging_ventas", "INSERT"), ("staging_ventas", "SELECT"), ("ventas", "INSERT")}   # del log de 30 días
ACL = ("SELECT c.relname, a.privilege_type FROM pg_class c CROSS JOIN LATERAL aclexplode(c.relacl) a "
       "WHERE a.grantee = %s::regrole AND c.relname = ANY(%s) ORDER BY 1, 2")


def privilegios(conn: psycopg.Connection[tuple[str, str]]) -> set[tuple[str, str]]:
    return set(conn.execute(ACL, (ROL, list(TABLAS))).fetchall())


with psycopg.connect(host=os.environ["PG_HOST"], port=os.environ["PG_PORT"], user=os.environ["PG_USER"],
                     password=os.environ["PG_PASSWORD"], dbname=S, autocommit=True) as conn:
    try:
        for t in TABLAS:
            conn.execute(f"CREATE TABLE {t} (id int)")
        conn.execute(f"CREATE ROLE {ROL}")
        conn.execute(f"GRANT ALL ON {', '.join(TABLAS)} TO {ROL}")      # lo que alguien dio «por si acaso»
        tiene = privilegios(conn)
        vista = conn.execute("SELECT count(*) FROM information_schema.table_privileges WHERE grantee = %s",
                             (ROL,)).fetchone()
        assert vista is not None
        sobran = sorted(tiene - USADOS)
        print(f"privilegios: {len(tiene)} (la vista table_privileges muestra {vista[0]}: no lista MAINTAIN)")
        print(f"usados en 30 días: {len(USADOS & tiene)}; sobran: {len(sobran)}")
        for tabla in TABLAS:
            privs = ", ".join(p for t, p in sobran if t == tabla)
            if privs:
                conn.execute(f"REVOKE {privs} ON {tabla} FROM {ROL}")
                print(f"  REVOKE {privs} ON {tabla} FROM pipeline_ventas")
        quedan = sorted(privilegios(conn))
        print("quedan:", quedan)
        print("MAINTAIN revocado en todas:", not any(p == "MAINTAIN" for _, p in quedan))
    finally:
        conn.execute(f"DROP TABLE IF EXISTS {', '.join(TABLAS)}")
        conn.execute(f"DROP ROLE IF EXISTS {ROL}")
```

El script se **ejecuta en la CI contra el servicio postgres:17** y pasa `mypy --strict`. Imprime `privilegios: 24 (la vista table_privileges muestra 21: no lista MAINTAIN)`, `usados en 30 días: 3; sobran: 21`, los tres `REVOKE` (los tres incluyen `MAINTAIN`), lo que queda (`INSERT` y `SELECT` en `staging_ventas` e `INSERT` en `ventas`) y `MAINTAIN revocado en todas: True`.

## 11. GCP

En GCP, **IAM**. Según *GRANT* y *Use IAM securely* (no ejecutado):

| | Revisión propia (este ejemplo) | Google Cloud |
|---|---|---|
| Al conceder | El privilegio exacto | No conceder roles básicos en producción salvo sin alternativa; usar los predefinidos o personalizados más limitados |
| Al mantener | Concedido frente a usado | Recomendaciones de roles y Policy Simulator para comprobar el cambio |

## 12. AWS

En AWS, **IAM** y **Access Analyzer**. Según *Security best practices in IAM* y *Using AWS Identity and Access Management Access Analyzer* (no ejecutado):

| | Revisión propia (este ejemplo) | AWS |
|---|---|---|
| Principio | Lo necesario | Solo los permisos necesarios: acciones sobre recursos concretos bajo condiciones concretas |
| Detectar exceso | Comparar con la auditoría | Analizadores de acceso externo, interno y sin uso |

## 13. Azure

En Azure, **Azure RBAC**. Según *GRANT* y *Understand scope for Azure RBAC* (no ejecutado):

| | Revisión propia (este ejemplo) | Azure RBAC |
|---|---|---|
| Acotar | Privilegio por tabla | El ámbito de la asignación de rol (grupo de administración, suscripción, grupo de recursos, recurso) |

## 14. Buenas prácticas

- Lo mínimo al conceder, con prueba.
- Revisión periódica de concedido frente a usado.
- Período de uso que cubra los procesos menos frecuentes.
- **Seguridad:** una credencial con lo justo limita el daño si se filtra.
- **Observabilidad:** auditoría de uso activada; sin ella no hay comparación.
- **Costo:** revisar cuesta horas; automatizar la propuesta y dejar al dueño la aprobación.

## 15. Errores frecuentes

- `ALL` «por ahora».
- Revisar solo al dar el acceso.
- Revocar sin avisar y romper un proceso mensual.
- Contar privilegios con una vista que no los muestra todos: en PostgreSQL 17, `table_privileges` no lista `MAINTAIN`.

## 16. Trade-offs

Menos privilegios reducen el daño posible y generan más pedidos de acceso. Revocar con poca historia de uso rompe procesos poco frecuentes; con mucha, el exceso dura más.

## 17. Conceptos relacionados

- `iam-fundamentals`: el modelo.
- `rbac`: roles.
- `service-accounts`: cuentas de procesos.
- `column-level-security`: privilegios por columna.

## 18. Preguntas técnicas abiertas

1. ¿Qué cuentas de servicio tienen escritura que no usan?
2. ¿Tienes auditoría de uso para comparar?
3. ¿Cada cuánto se revisan los accesos?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- PostgreSQL 17: *GRANT*, *5.8. Privileges* y *35.53. table_privileges*.
- Google Cloud: *Use IAM securely*.
- AWS: *Security best practices in IAM* y *Using AWS Identity and Access Management Access Analyzer*.
- Microsoft Learn: *Understand scope for Azure RBAC*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-21. Pasa a `verified`: revisión B-F3.1 del lote F3b-18a aplicada y CI en verde (run 39677322697).

## 22. Historial de cambios importantes

- 2026-10-21: creación (lote F3b-18a).
- 2026-10-21: revisión B-F3.1 del lote F3b-18a (docs/reviews/cards-f3b-18a.md): el ejemplo lee los privilegios de `pg_class.relacl` con `aclexplode`, así cuenta y revoca `MAINTAIN`, que `information_schema.table_privileges` no muestra; cifras reales (24 concedidos, 3 usados, 21 revocados) y cita de *5.8. Privileges* y *35.53. table_privileges*.
- 2026-10-21: `verification_status: verified` (revisión aplicada; CI en verde, run 39677322697).
