# ADR-022 — cryptography en los tests de snippets

- **Estado:** Aceptado
- **Fecha:** 2026-10-21
- **Fase:** F3b — Contenido por dominio, dominio 18-security (decisión de Felipe al aprobar el plan de 18)
- **Referencias:** ADR-019 (Great Expectations), `requirements-snippets.txt`, `tests/test_security_snippets.py`.

## Contexto

Las fichas de 18b (cifrado en reposo, en tránsito, gestión de claves y crypto-shredding) se entienden mejor si sus ejemplos corren: un AES-GCM que falla al alterar el texto cifrado, una envelope encryption con rotación de la KEK, un borrado de clave que deja ilegibles todas las copias, un TLS local con una CA propia. La biblioteca estándar de Python no trae AES ni genera certificados X.509.

## Decisión

1. **Versión fija.** `cryptography==50.0.2` (PyPI, 2026-09-30; requiere Python >=3.9) en `requirements-snippets.txt`. Ya llegaba como dependencia transitiva (por ejemplo, de Great Expectations, ADR-019); se fija para que la versión de los ejemplos no dependa de otra biblioteca.
2. **Sin conflictos.** Es la versión que ya resolvía `pip` con `requirements.txt` y `requirements-snippets.txt`; fijarla no cambia ningún paquete instalado.
3. **Qué se usa.** `AESGCM` (cifrado autenticado), `aes_key_wrap` y `aes_key_unwrap` (envolver claves, RFC 3394) y el módulo `x509` para una CA y un certificado de prueba. El TLS lo hace el módulo `ssl` de la biblioteca estándar.
4. **Fuente.** `cryptography-docs` (cryptography.io, en `/en/stable/`, que hoy muestra la documentación de 50.0.2). Por la regla de CLAUDE.md, las fichas no citan la versión de parche de la biblioteca.
5. **KMS simulado.** Los ejemplos no llaman a un KMS de nube: una clase de pocas líneas hace de KMS (guarda las KEK por versión, envuelve y desenvuelve, rota y destruye). Los KMS de cada nube quedan «no ejecutado».

## Consecuencias

- `make snippets-deps` no instala nada nuevo en la práctica; la versión queda explícita.
- Actualizar `cryptography` es cambiar la versión aquí y en `requirements-snippets.txt`, y volver a correr `tests/test_security_snippets.py`.
