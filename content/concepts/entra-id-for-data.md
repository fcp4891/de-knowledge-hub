---
id: concept:entra-id-for-data
slug: entra-id-for-data
type: concept
title: Microsoft Entra ID para plataformas de datos
description: "Cómo se da acceso en una plataforma de datos de Azure según su documentación: Microsoft Entra ID (antes Azure Active Directory, según su página de cambio de nombre) es la identidad; las identidades administradas (asignadas por el sistema o por el usuario) obtienen tokens sin credenciales que administrar; Azure RBAC autoriza con asignaciones de rol (principal, definición de rol y alcance) en cuatro niveles de alcance, con deny assignments que bloquean el acceso."
domain: azure
subdomain: governance-and-security
category: azure
classification: modern
level: intermediate
importance: high
cloud: [azure]
technologies: [microsoft-entra-id, azure-adls, terraform]
tags: [entra-id, managed-identity, rbac, least-privilege]
aliases: [Azure AD para plataformas de datos]
related_topics: [gcp-iam-for-data, aws-iam-for-data]
sources:
  - source: microsoft-entra-docs
    url: https://learn.microsoft.com/en-us/entra/fundamentals/new-name
    accessed: 2026-10-13
    page_title: "New name for Azure Active Directory"
    note: "New name for Azure Active Directory: «Microsoft renamed Azure Active Directory (Azure AD) to Microsoft Entra ID»; los nombres Azure Active Directory, Azure AD y AAD se reemplazan por Microsoft Entra ID; Microsoft Entra es la familia de productos de identidad y acceso de red, y Entra ID es uno de ellos."
  - source: microsoft-entra-docs
    url: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview
    accessed: 2026-10-13
    page_title: "What is managed identities for Azure resources?"
    note: "What is managed identities for Azure resources?: las aplicaciones obtienen tokens de Microsoft Entra sin administrar credenciales. Asignada por el sistema: un service principal especial ligado al ciclo de vida del recurso, que Azure borra con el recurso. Asignada por el usuario: un service principal que se administra aparte y se puede asignar a uno o más recursos."
  - source: microsoft-entra-docs
    url: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
    accessed: 2026-10-13
    page_title: "What is Azure role-based access control (Azure RBAC)?"
    note: "What is Azure role-based access control (Azure RBAC)?: sistema de autorización sobre Azure Resource Manager para gestionar quién accede a los recursos, qué puede hacer y en qué ámbito. Una asignación de rol une un principal de seguridad (usuario, grupo, service principal o identidad administrada), una definición de rol y un alcance. Si aplica una deny assignment, el acceso se bloquea."
  - source: microsoft-entra-docs
    url: https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview
    accessed: 2026-10-13
    page_title: "Understand scope for Azure RBAC"
    note: "Understand scope for Azure RBAC: cuatro niveles de alcance con relación padre-hijo (grupo de administración, suscripción, grupo de recursos y recurso); un rol se puede asignar en cualquiera, y el nivel define qué tan amplio aplica."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/overview
    accessed: 2026-10-14
    page_title: "IAM overview"
    note: "IAM controla quién puede hacer qué sobre qué recursos. Se concede un rol (colección de permisos de la forma servicio.recurso.verbo) a un principal sobre un recurso mediante una allow policy; no se conceden permisos sueltos. Tipos de rol: predefinidos (gestionados por Google), personalizados (más mantenimiento y con límite de cantidad) y básicos (muy amplios, no recomendados en producción). Los recursos se organizan en jerarquía y los hijos heredan las políticas de sus padres. Principales humanos (cuentas, grupos, identidades federadas) y de cargas de trabajo (cuentas de servicio, identidades federadas de workload). Además de las allow policies, «Deny policies prevent principals from using certain permissions, even if they're granted a role with the permission»."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/service-account-overview
    accessed: 2026-10-01
    page_title: "Service accounts overview"
    note: "Una cuenta de servicio es una cuenta para aplicaciones o cargas de trabajo, identificada por un email; la forma más común de autenticarse como ella es adjuntarla al recurso que ejecuta la aplicación; al autenticarse, la aplicación accede a todo lo que la cuenta tiene permitido."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html
    accessed: 2026-10-12
    page_title: "IAM roles"
    note: "IAM roles: identidad con permisos que puede asumir quien la necesite (usuarios, aplicaciones o servicios); no tiene credenciales de largo plazo, y al asumirla se obtienen credenciales de seguridad temporales para la sesión."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html
    accessed: 2026-10-12
    page_title: "Policy evaluation logic"
    note: "Policy evaluation logic: en la misma cuenta, los permisos efectivos son la unión de las políticas de identidad y de recurso; un Deny explícito en cualquiera de ellas prevalece sobre el Allow. Con un permissions boundary, el resultado es la intersección."
relations:
  - type: RELATED_TO
    target: gcp-iam-for-data
    note: IAM de GCP, con cuentas de servicio y otra jerarquía.
  - type: RELATED_TO
    target: aws-iam-for-data
    note: IAM de AWS, con roles y políticas en JSON.
  - type: RELATED_TO
    target: adls-gen2-storage
    note: El rol del ejemplo da lectura sobre un contenedor del lake.
  - type: RELATED_TO
    target: key-vault-secrets
    note: Key Vault también se autoriza con Azure RBAC.
  - type: RELATED_TO
    target: infrastructure-as-code
    note: Identidades y asignaciones de rol como código.
created_at: 2026-10-13
updated_at: 2026-10-14
last_verified: 2026-10-14
verification_status: verified
---

## 1. Resumen

En Azure, la identidad es **Microsoft Entra ID**. Su página de cambio de nombre dice: «Microsoft renamed Azure Active Directory (Azure AD) to Microsoft Entra ID»; los nombres Azure Active Directory, Azure AD y AAD se reemplazan.

Para una plataforma de datos, según su documentación:

- cada job, función o servicio usa una **identidad administrada**: obtiene tokens de Entra **sin credenciales que administrar**;
- la autorización es **Azure RBAC**: una **asignación de rol** une un principal, una definición de rol y un **alcance**;
- el alcance tiene cuatro niveles (grupo de administración, suscripción, grupo de recursos y recurso): cuanto más bajo, más acotado;
- una **deny assignment** bloquea el acceso aunque un rol lo permita.

## 2. Qué es

- **Microsoft Entra ID:** el servicio de identidad (antes Azure AD); parte de la familia Microsoft Entra.
- **Identidad administrada:**
  - *asignada por el sistema*: ligada a un recurso; se borra con él;
  - *asignada por el usuario*: recurso propio, que se asigna a uno o más recursos.
- **Asignación de rol:** principal (usuario, grupo, service principal o identidad administrada) + definición de rol + alcance.
- **Alcance:** grupo de administración, suscripción, grupo de recursos o recurso; las asignaciones se heredan hacia abajo.
- **Deny assignment:** si aplica, el acceso se bloquea.

## 3. Problema que resuelve

Los jobs de datos necesitan leer y escribir en el lake, las bases y los secretos. Sin identidades administradas, terminan con claves y contraseñas en la configuración; sin alcances acotados, un job puede leer todo lo de la suscripción.

## 4. Cómo funciona

1. Se crea una identidad administrada asignada por el usuario para el job.
2. Se le asigna el rol «Storage Blob Data Reader» con alcance en el contenedor `curated`, no en la cuenta ni en la suscripción.
3. El job, al correr, obtiene un token de Entra con esa identidad.
4. Azure RBAC evalúa la solicitud: si una asignación la permite y ninguna deny assignment la bloquea, accede.

## 5. Cuándo utilizarlo

- Siempre: todo acceso a recursos de Azure pasa por Entra ID y Azure RBAC.
- Identidad asignada por el usuario cuando varios recursos comparten la misma identidad o cuando debe sobrevivir al recurso.
- Identidad asignada por el sistema para un recurso con su propia identidad.

## 6. Cuándo no utilizarlo

- Claves de cuenta o contraseñas en la configuración del job: identidades administradas.
- Roles con alcance de suscripción para un job que lee un contenedor.
- Un rol amplio «por si acaso».

## 7. Ejemplo sencillo

La identidad `id-job-ventas` tiene «Storage Blob Data Reader» sobre el contenedor `curated`. El job lee `curated/ventas/` sin ninguna clave; si intenta leer otro contenedor, no tiene permiso.

## 8. Ejemplo de producción

Una plataforma define en Terraform, revisado en cada cambio:

- una identidad administrada por job o servicio;
- asignaciones con el alcance más chico posible: contenedor, vault o base;
- grupos de Entra para las personas, con roles por grupo de recursos;
- nada de claves de cuenta en la configuración.

## 9. Arquitectura

```mermaid
flowchart LR
  J["Job de datos"] -- "identidad administrada" --> E["Microsoft Entra ID<br/>token"]
  E --> RB["Azure RBAC<br/>asignación: principal + rol + alcance"]
  RB --> C["Contenedor curated<br/>(alcance: recurso)"]
  D["Deny assignment"] -. "bloquea" .-> RB
```

## 10. Código

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): identidad administrada asignada
# por el usuario para un job, con el rol «Storage Blob Data Reader» solo sobre un contenedor (el alcance más chico).
# Requiere: provider hashicorp/azurerm ~> 5.0; grupo de recursos y contenedor existentes.
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  type = string
}

variable "location" {
  type    = string
  default = "eastus2"
}

variable "curated_container_id" {
  type        = string
  description = "ID de recurso del contenedor curated (alcance del rol)"
}

resource "azurerm_user_assigned_identity" "job_ventas" {
  name                = "id-job-ventas"
  resource_group_name = var.resource_group_name
  location            = var.location
}

resource "azurerm_role_assignment" "leer_curated" {
  scope                = var.curated_container_id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = azurerm_user_assigned_identity.job_ventas.principal_id
  principal_type       = "ServicePrincipal"
}
```

El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**. Asigna el rol con alcance en el contenedor, el nivel más bajo de los que describe *Understand scope for Azure RBAC*.

## 11. GCP

No aplica de forma específica: esta ficha describe Entra ID y Azure RBAC. En GCP es IAM (ver `gcp-iam-for-data`). Las diferencias, según sus páginas:

| | Entra ID / Azure RBAC | IAM de GCP |
|---|---|---|
| Identidad de cargas de trabajo | Identidad administrada (del sistema o del usuario) | Cuenta de servicio, identificada por un email y adjunta al recurso |
| Concesión | Asignación de rol: principal + definición de rol + alcance | Rol concedido a un principal sobre un recurso, en una política de permisos |
| Bloqueo explícito | Deny assignments | Deny policies: impiden usar ciertos permisos aunque el principal tenga un rol que los conceda (*IAM overview*) |

## 12. AWS

No aplica de forma específica. En AWS es IAM (ver `aws-iam-for-data`). Las diferencias, según sus páginas:

| | Entra ID / Azure RBAC | IAM de AWS |
|---|---|---|
| Identidad de cargas de trabajo | Identidad administrada, que obtiene tokens de Entra | Rol que se asume y entrega credenciales temporales |
| Concesión | Asignación de rol en un alcance jerárquico | Políticas de identidad y de recurso en JSON |
| Bloqueo explícito | Deny assignments | Un Deny explícito en una política prevalece sobre el Allow |

## 13. Azure

**Microsoft Entra ID y Azure RBAC.** El cambio de nombre, las identidades administradas, las asignaciones de rol, los alcances y las deny assignments son los de sus páginas.

## 14. Buenas prácticas

- Una identidad administrada por job o servicio.
- El alcance más chico posible para cada asignación.
- Grupos para las personas; nada de asignaciones a usuarios uno por uno.
- Identidades y asignaciones como código, revisadas.
- **Seguridad:** sin claves de cuenta ni contraseñas en la configuración; revisar asignaciones con alcance de suscripción.
- **Observabilidad:** revisar periódicamente las asignaciones de rol y las identidades sin uso.
- **Costo:** el costo que importa de un permiso amplio es el riesgo de un borrado o una fuga, y lo que cuesta recuperarse.

## 15. Errores frecuentes

- Usar la clave de la cuenta de almacenamiento en lugar de una identidad.
- Asignar roles en la suscripción para un job que lee un contenedor.
- Identidades del sistema en recursos que se recrean, perdiendo las asignaciones.
- Llamar «Azure AD» al servicio en documentación nueva.

## 16. Trade-offs

Las identidades administradas eliminan las credenciales del código, a cambio de definir una identidad y sus asignaciones por carga. Los alcances bajos reducen el daño posible, con más asignaciones que mantener. Las identidades asignadas por el usuario sobreviven al recurso; las del sistema son más simples.

## 17. Conceptos relacionados

- `gcp-iam-for-data` y `aws-iam-for-data`: IAM en GCP y AWS.
- `adls-gen2-storage` y `key-vault-secrets`: recursos que se autorizan con Azure RBAC.
- `infrastructure-as-code`: identidades y roles como código.

## 18. Preguntas técnicas abiertas

1. ¿Qué jobs de tu plataforma usan todavía claves o contraseñas?
2. ¿Qué asignaciones podrías bajar de alcance?
3. ¿Cuándo usarías una identidad asignada por el usuario?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn: *New name for Azure Active Directory*, *What is managed identities for Azure resources?*, *What is Azure role-based access control (Azure RBAC)?* y *Understand scope for Azure RBAC*.
- Google Cloud: *IAM overview* y *Service accounts overview*. AWS: *IAM roles* y *Policy evaluation logic*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-14. Pasa a `verified`: revisión B-F3.1 del lote F3b-10b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10b), con el nombre actual del servicio según su página de cambio de nombre.
- 2026-10-14: revisión B-F3.1 del lote F3b-10b aplicada (docs/reviews/cards-f3b-10b.md): la celda de bloqueo explícito del §11 dice las deny policies de IAM, citadas de *IAM overview*.
- 2026-10-14: `verification_status: verified` (sin VERIFY pendientes).
