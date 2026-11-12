import { writeFileSync } from "node:fs";
import path from "node:path";

// Ruta física del sitio en el hosting; el .htaccess raíz la reescribe a BASE_PATH.
const PHYSICAL_PATH = "/projects/DES_conocimiento";
// HSTS de 1 día mientras se verifica el dominio completo en HTTPS; después se sube a 31536000 (1 año).
// Sin includeSubDomains ni preload: el dominio raíz aloja otros sitios.
const HSTS_MAX_AGE = 86400;

/** .htaccess de la demo estática. THE_REQUEST (nunca REQUEST_URI) para no exponer la ruta física tras el rewrite. */
export function htaccessBody(basePath) {
  return `# Generado por frontend/scripts/write-htaccess.mjs. No lo duplique Carril A.
DirectoryIndex index.html
Options -Indexes

ErrorDocument 404 ${basePath}/404.html

RewriteEngine On

# La ruta física redirige a la pública, directo a HTTPS (una sola redirección).
RewriteCond %{THE_REQUEST} \\s${PHYSICAL_PATH}(/[^\\s?]*)?[\\s?] [NC]
RewriteRule ^ https://%{HTTP_HOST}${basePath}%1 [R=301,L,NE]

# HTTPS forzado con la ruta pedida por el navegador, no la reescrita.
RewriteCond %{HTTPS} !=on
RewriteCond %{THE_REQUEST} \\s(\\S+)\\s
RewriteRule ^ https://%{HTTP_HOST}%1 [R=301,L,NE]

<IfModule mod_mime.c>
  AddType application/json .json
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "public, max-age=300"
  </FilesMatch>
  SetEnvIf Request_URI "/data/" short_cache
  Header set Cache-Control "public, max-age=300" env=short_cache
  SetEnvIf Request_URI "_next/static/" long_cache
  Header set Cache-Control "public, max-age=31536000, immutable" env=long_cache
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=${HSTS_MAX_AGE}"
</IfModule>
`;
}

export function writeHtaccess(outDir, basePath) {
  writeFileSync(path.join(outDir, ".htaccess"), htaccessBody(basePath));
}
