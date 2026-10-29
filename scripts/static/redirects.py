"""Páginas de redirección de la demo estática para las fichas que cambiaron de dominio (ADR-027).

Las 11 fichas de la Ley 21.719 pasaron de 19-compliance a 24-privacy-engineering. La ficha se publica en
/concepts/<slug>/, que no depende del dominio; aun así, /explorer/compliance/<slug>/ debe seguir funcionando para
cualquier enlace que se haya armado con el dominio. Cada página lleva canonical y meta refresh hacia la ruta nueva,
sin JavaScript, y se agrega al zip al empaquetar (no se escribe en frontend/).
"""

from __future__ import annotations

from html import escape

SITE_ORIGIN = "https://felipe-a-cespedes-perez.cl"
OLD_DOMAIN = "compliance"
MOVED_TO_PRIVACY_ENGINEERING = (
    "chile-data-protection", "pii-identification", "processing-activities-inventory", "data-minimization-by-layer",
    "chilean-identifier-pseudonymization", "data-subject-rights-pipeline", "retention-and-erasure",
    "processors-and-international-transfers", "dpia-and-automated-decisions", "data-breach-response",
    "privacy-controls-as-code",
)


def redirect_html(target: str, canonical: str) -> str:
    t, c = escape(target, quote=True), escape(canonical, quote=True)
    return (
        "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"utf-8\">\n"
        f"<title>Redirigiendo…</title>\n<link rel=\"canonical\" href=\"{c}\">\n"
        f"<meta http-equiv=\"refresh\" content=\"0; url={t}\">\n<meta name=\"robots\" content=\"noindex\">\n"
        f"</head>\n<body>\n<p>Esta ficha se movió: <a href=\"{t}\">{t}</a>.</p>\n</body>\n</html>\n"
    )


def redirect_pages(base_path: str, slugs: tuple[str, ...] = MOVED_TO_PRIVACY_ENGINEERING) -> dict[str, str]:
    """Ruta dentro del zip → HTML, para cada /explorer/compliance/<slug>/ → /concepts/<slug>/."""
    pages = {}
    for slug in slugs:
        target = f"{base_path}/concepts/{slug}/"
        pages[f"explorer/{OLD_DOMAIN}/{slug}/index.html"] = redirect_html(target, f"{SITE_ORIGIN}{target}")
    return pages
