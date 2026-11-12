import assert from "node:assert/strict";
import { test } from "node:test";

import { htaccessBody } from "../../frontend/scripts/write-htaccess.mjs";

const body = htaccessBody("/aprendizaje-continuo");

test("el .htaccess conserva índice, 404, mime, deflate y caché", () => {
  for (const line of [
    "DirectoryIndex index.html",
    "ErrorDocument 404 /aprendizaje-continuo/404.html",
    "AddType application/json .json",
    "AddOutputFilterByType DEFLATE",
    'Header set Cache-Control "public, max-age=31536000, immutable" env=long_cache',
  ]) {
    assert.ok(body.includes(line), line);
  }
});

test("el .htaccess fuerza HTTPS con THE_REQUEST y redirige la ruta física a la pública", () => {
  const lines = body.split("\n");
  for (const line of [
    "Options -Indexes",
    "RewriteEngine On",
    "RewriteCond %{HTTPS} !=on",
    "RewriteCond %{THE_REQUEST} \\s(\\S+)\\s",
    "RewriteRule ^ https://%{HTTP_HOST}%1 [R=301,L,NE]",
    "RewriteCond %{THE_REQUEST} \\s/projects/DES_conocimiento(/[^\\s?]*)?[\\s?] [NC]",
    "RewriteRule ^ /aprendizaje-continuo%1 [R=301,L,NE]",
  ]) {
    assert.ok(lines.includes(line), line);
  }
  assert.equal(body.includes("REQUEST_URI} "), false);   // nunca REQUEST_URI en las reglas de reescritura
});

test("el .htaccess trae las cabeceras de seguridad, sin includeSubDomains, preload ni CSP", () => {
  for (const header of [
    'X-Content-Type-Options "nosniff"',
    'X-Frame-Options "SAMEORIGIN"',
    'Referrer-Policy "strict-origin-when-cross-origin"',
    'Strict-Transport-Security "max-age=31536000"',
  ]) {
    assert.ok(body.includes(header), header);
  }
  const headers = body.slice(body.indexOf("<IfModule mod_headers.c>"));
  assert.ok(headers.includes("Strict-Transport-Security"));
  for (const absent of ["includeSubDomains", "preload", "Content-Security-Policy"]) {
    assert.equal(body.includes(absent), false, absent);
  }
});
