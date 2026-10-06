import { writeFileSync } from "node:fs";
import path from "node:path";

export function writeHtaccess(outDir, basePath) {
  const body = `# Generado por frontend/scripts/write-htaccess.mjs. No lo duplique Carril A.
DirectoryIndex index.html

ErrorDocument 404 ${basePath}/404.html

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
</IfModule>
`;
  writeFileSync(path.join(outDir, ".htaccess"), body);
}
