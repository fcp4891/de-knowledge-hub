# Revisión B-F3.1 · lote F3b-18b

Rama `b/f3b-review-18b`, creada desde `origin/main` (`22e0b2b`). El pedido está en `docs/status/lane-a.md`. Fichas: `encryption-at-rest`, `encryption-in-transit`, `key-management`, `secrets-management` y `crypto-shredding`. No se editó `content/` ni `frontend/`. El CI de 18b no se esperó: los tests se revisaron como código.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| `secrets-management` dice que la guía «recomienda evitar» las variables de entorno y que «prefiere» la API. *Secret Manager best practices* dice: «Avoid passing secrets to your application through the file system or through the environment variables». La nota del frontmatter ya lo pone como instrucción («Evitar pasar»). La misma página permite esas vías en integraciones serverless. | media | Citar «Avoid passing secrets…» en el cuerpo y en la tabla, y dejar la excepción de las integraciones serverless. |
| En `key-management`, la tabla de AWS dice «Automática cada año por defecto». La nota sí dice «con la rotación automática activada». *Rotate AWS KMS keys*: la rotación automática es opcional en las claves del cliente; una vez activada, el período por defecto es un año (365 días). | baja | Igualar la celda a la nota. |
| Sin otros hallazgos. AES-GCM, el TLS, la rotación de la KEK y los plazos de destrucción coinciden con sus páginas y con el test. Ninguna ficha nombra la ley. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 563 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== encryption-at-rest dups [] extra_topics [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} titles 5 sources 5 law [] off [] ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== encryption-in-transit dups [] extra_topics [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} titles 5 sources 5 law [] off ['verify_mode =', 'verify=False'] ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== key-management dups [] extra_topics [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} titles 7 sources 7 law [] off [] ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== secrets-management dups [] extra_topics [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} titles 7 sources 7 law [] off [] ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== crypto-shredding dups [] extra_topics [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} titles 6 sources 6 law [] off [] ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
```

`law` busca «ley », «21.719», «GDPR» y «legal». No aparecen. «cumplir regulaciones» está solo en la nota de *Customer-managed encryption keys (CMEK)*, que dice «Meet current or future regulation».

En `encryption-in-transit`, `verify_mode =` es la comprobación `verify_mode == CERT_REQUIRED` y `verify=False` está en el bullet de errores frecuentes. Los dos clientes usan `ssl.create_default_context`. Ningún contexto asigna `CERT_NONE` ni `check_hostname = False`.

`tests/test_security_snippets.py` exige estas frases. No se corrió el CI.

```
"descifrar con un byte cambiado: InvalidTag", "descifrar movido a la fila 2: InvalidTag"
"verifica certificado y nombre por defecto: True"
"cliente sin confiar en la CA: rechazado: unable to get local issuer certificate"
"cliente con la CA: conectado con TLSv1.3, recibido b'hola'"
"tras rotar: DEK envuelta con la KEK v2; la v1 se destruyó; datos sin volver a cifrar"
"repr del secreto: Secreto(****)", "log: conectando con password=****"
"respaldo: ['ilegible (clave destruida)', 'luis@example.org', 'ilegible (clave destruida)']"
"registros del respaldo modificados: False"
```

*Authenticated encryption*: `decrypt` lanza `InvalidTag` si cambió el texto cifrado o si la clave, el nonce o los datos asociados no coinciden. El ejemplo usa `tabla:fila` como datos asociados. El §6 dice que un valor cifrado con nonce aleatorio no se puede comparar; el test exige `mismo valor, mismo cifrado: False`.

*Key rotation* (Cloud KMS): «Rotating keys creates new active key versions, but doesn't re-encrypt your data and doesn't disable or delete previous key versions». La nota y la tabla de GCP lo dicen así. El ejemplo re-envuelve la DEK y no vuelve a cifrar `datos`.

*Destroy and restore key versions*: «The default scheduled for destruction duration is 30 days». *Delete an AWS KMS key*: «a waiting period of 7 – 30 days. The default waiting period is 30 days» y «up to 24 hours longer». *Azure Key Vault: soft-delete overview*: «Customers are strongly encouraged to turn on soft delete enforcement for their vaults via Azure Policy» y «Purge protection is an optional Key Vault behavior and is not enabled by default. Purge protection can only be enabled once soft-delete is enabled». `crypto-shredding` separa la destrucción inmediata del ejemplo de esos plazos, y el §15 dice no prometer un borrado inmediato.

Los 26 `page_title` coinciden con el encabezado. En cryptography el h1 incluye el icono del enlace permanente; en *Tutorial* y *Key wrapping* la ficha deja un espacio antes de ese icono.
