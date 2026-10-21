# Revisión B-F3.1 · lote F3b-18c

Rama `b/f3b-review-18c`, creada desde `origin/main` (`0cb523b`). El pedido está en `docs/status/lane-a.md`. Fichas: `pseudonymization-vs-anonymization`, `tokenization`, `keyed-hashing` y `k-anonymity`. No se editó `content/` ni `frontend/`. El CI no se esperó: los tests se revisaron como código.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Lo seudonimizado queda como datos de personas, con fuentes N4 y N1, y sin ley. La anonimización no se declara irreversible: IR 8053 dice que a veces se reidentifica. El token de una vía sí lo es, en la página de Sensitive Data Protection. La bóveda de `tokenization` es un dict, no postgres:17; el mapeo está separado de las filas. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 571 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== pseudonymization-vs-anonymization dups [] extra [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} t 7 s 7 hits [] pg False ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== tokenization dups [] extra [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} t 4 s 4 hits [] pg False ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== keyed-hashing dups [] extra [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} t 7 s 7 hits [] pg False ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
== k-anonymity dups [] extra [] missing17 [] sec14 {'Seguridad': True, 'Observabilidad': True, 'Costo': True} t 6 s 6 hits [] pg False ticks [] 11:tabla+fuente+noej 12:tabla+fuente+noej 13:tabla+fuente+noej
TOK psycopg False por_token True
```

`hits` busca «ley », «21.719», «GDPR», «legal», «dato personal» e «irrevers». No aparecen. `pg` busca postgres. `nist-csrc` es Nivel 4; `aws-databrew-docs`, `aws-clean-rooms-docs` y `azure-confidential-computing-docs` son Nivel 1.

`tests/test_security_snippets.py` exige estas frases. Los cuatro ejemplos están en `STDLIB`. No se corrió el CI.

```
"seudonimizado, reidentificados: ['Ana', 'Bea', 'Ciro', 'Dani']"
"anonimizado (sin id, edad en rango, sexo suprimido), reidentificados: []"
"hash simple: 3 de 3 reidentificados probando 1000000 valores", "HMAC sin la clave: 0 de 3 reidentificados"
"mismo valor, mismo token: True", "el token contiene el valor: False"
"k con la edad exacta: 1", "k con la edad en rangos de 10 años: 2"
"clases con un solo valor de plan (l=1): [('norte', '50-59', 'M'), ('sur', '20-29', 'M')]"
```

*NIST SP 800-188* (resumen): «De-identification is a general term for any process of removing the association between a set of identifying data and the data subject». *NIST IR 8053* (resumen): «De-identification removes identifying information from a dataset so that individual data cannot be linked with specific individuals» y «some de-identified data can sometimes be re-identified». El §14 de `pseudonymization-vs-anonymization` dice que los datos seudonimizados siguen siendo datos de personas. La tabla del §7 dice «ninguno, con este cruce» y la frase siguiente dice que eso no prueba que sea anónimo.

*Pseudonymization* (Sensitive Data Protection), secciones «no ejecutado»: «Pseudonymization is sometimes referred to as tokenization or surrogate replacement». «A one-way token has been transformed irreversibly, while a two-way token can be reversed». «Cryptographic hashing: ... The hashed output of the transformation is always the same length and can't be re-identified». «Enforce irreversible data masking with cryptographic hashing: Generate one-way HMAC-SHA-256 digests». «Directly in raw text form. (Not recommended.)».

En `keyed-hashing` la clave sale de `secrets.token_bytes(32)`. El atacante usa otro `token_bytes`. No hay una llave escrita. El espacio es `000000` a `999999`. *Detect and process sensitive data*: «pass the detected PII value to a SHA-256 cryptographic hash function»; la página no nombra una clave. *CRYPTOGRAPHIC_HASH*: «If you do not provide a hash algorithm, the service defaults to "HMAC_SHA256"»; los HMAC «require the secretId parameter».

`tokenization` no abre postgres. La clase guarda `_por_valor` y `_por_token`; pedidos y reclamos solo reciben el token. El pedido de este lote pide biblioteca estándar.

`k_de` agrupa por región, edad y sexo. Con la edad exacta k es 1; con rangos de 10 años, 2. *Re-identification risk analysis*: hay l-diversidad si cada grupo tiene al menos l valores sensibles distintos. El ejemplo lista las clases con un solo plan. *Aggregation analysis rule*: «aggregation constraints in the form of COUNT (DISTINCT column) >= X» y «The minimum must be at least value of 2»; la ficha lo separa del k sobre filas publicadas. En Azure la ficha propone `GROUP BY` y `HAVING`, y dice que es una consulta, no un servicio. *PII detection and masking*: «calls Foundry Tools».

Los `page_title` coinciden con el encabezado. En el RFC 2104 el título está en `<span class="h1">HMAC: Keyed-Hashing for Message Authentication</span>`.
