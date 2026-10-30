# Ficha `chile-data-protection`

Fuente: `content/concepts/chile-data-protection.md`. Vista: ficha de concepto en `/concepts/chile-data-protection`.

## Identidad

| Campo | Valor |
|---|---|
| Título visible (h1) | Ley 21.719 para ingenieros de datos |
| Título de la introducción (primer h3 del resumen) | Ley 21.719: Protección de datos personales aplicada a Ingeniería de Datos |
| Slug | `chile-data-protection` |
| Dominio | compliance |
| Subdominio | data-engineering-under-ley-21719 |
| Clasificación | core |
| Nivel | intermediate |
| Jurisdicción | CL |
| Verificación | review_required · última verificación 2026-10-25 |
| Alias | compliance-scope-for-data-engineers |

El aviso legal del primer párrafo del resumen no se lee dentro del resumen: se saca y queda en el recuadro de aviso, encima del título.

## Estructura de la página

De arriba hacia abajo, en el artículo:

1. Miga: Inicio / dominio / subdominio / título. El dominio va en azul (`#1f5a8a`).
2. Barra de lectura: «Leído N de 22».
3. Índice lateral, agrupado.
4. Cabecera: insignias, aviso legal, h1, alias, tiempo de lectura y cantidad de fuentes.
5. Sección 1, abierta, con la introducción.
6. Base legal, entre el resumen y el resto.
7. «Expandir todo» / «Contraer todo».
8. Secciones 2 a 22. La 3 y la 10 van abiertas. La 11, la 12 y la 13 son una sola zona con pestañas GCP, AWS y Azure. El resto va plegado.
9. Leyenda del punto de arquitectura, si la ficha usa `[Decisión de arquitectura]`.
10. Pie: «Marcar como comprendido», «Necesita repaso» y «Siguiente en la ruta».

A la derecha, el panel de estudio: estado, notas y relacionados. No hay lista «Fichas de esta ruta». «Parte de» solo aparece si la ficha es hija.

Índice:

| Grupo | Secciones |
|---|---|
| Entender | 1 Resumen, 2 Qué es, 3 Problema que resuelve, 4 Cómo funciona, 5 Cuándo utilizarlo, 6 Cuándo no utilizarlo |
| Aplicar | 7 Ejemplo sencillo, 8 Ejemplo de producción, 9 Arquitectura, 10 Código |
| Multicloud | 11 GCP, 12 AWS, 13 Azure |
| Profundizar | 14 Buenas prácticas, 15 Errores frecuentes, 16 Trade-offs, 17 Conceptos relacionados |
| Practicar | 18 Preguntas técnicas abiertas, 19 Laboratorio relacionado |
| Referencias | 20 Fuentes, 21 Fecha de última verificación, 22 Historial de cambios importantes |

## Diseño

### Cabecera

- Insignias: `core`, `Intermedio`, `En revisión`, `Legislación · CL`.
- Aviso legal: recuadro con borde de aviso y barra izquierda ancha. Lead en negrita: «Esta ficha no es asesoría legal.» Detalle: «Explica el alcance técnico. El detalle de cada requisito está en su ficha hija.»
- h1: el `title` del frontmatter, no el h3 largo de la introducción.
- Meta: alias y «~N min de lectura · N fuentes oficiales».

### Resumen

Bloque con fondo de superficie, borde y radio 14px. El rótulo «1 · RESUMEN» va en mayúsculas pequeñas, color de acento.

Dentro del Markdown:

- El cuerpo usa la fuente de lectura.
- Los h3 usan la fuente de interfaz, 1.15rem. El primero («Ley 21.719: …») va a 1.45rem.
- La tabla de preguntas ocupa el ancho del bloque (`table-layout: fixed`). La primera columna mide 34 % y va en negrita, para que la segunda haga salto de línea.

### Base legal

Bloque con borde `#1e3a5f` y barra izquierda de 8px, fondo `#f4f7fb`. Tabla de tres columnas: Artículo, Qué dice, Implicancia técnica.

Cada fila lleva ancla `lb-ley-19628-<artículo>`. Al llegar desde un «art. N», la fila se pinta `#fff1c2`. El artículo enlaza a BCN y muestra la etiqueta «BCN».

### Marcas en el texto

- `[Obligación legal · art. N]` de la Ley 19.628 se ve como superíndice `art. N`, color `#1e3a5f`, enlazado a la fila de Base legal. El tooltip es la nota del artículo. Si la ley citada no es la 19.628, el texto es `Ley X, art. N`.
- `[Buena práctica]` no se muestra: queda el texto que sigue.
- `[Decisión de arquitectura]` es un punto azul marino. Al pie: «Decisión de arquitectura: elección de diseño, no exigida por la ley».

### Mapa de artículos (§2)

La tabla trae Artículo, Qué implica para datos, Ficha y Etiqueta. En pantalla se ocultan Ficha y Etiqueta. La columna «Qué implica para datos» usa el ancho disponible. Al pasar el cursor por el artículo, el `title` de la celda muestra la ficha hija.

### Nubes (§11–§13)

Pestañas GCP, AWS y Azure. En la columna Etiqueta, la buena práctica desaparece, la decisión de arquitectura queda como punto y la obligación legal queda como `art. N`.

### Diagramas (§9)

Mermaid a 14px, con desplazamiento horizontal y botón «Ampliar». Dos diagramas: del requisito al dato, y control y evidencia.

## Contenido

### 1. Resumen

**Ley 21.719: Protección de datos personales aplicada a Ingeniería de Datos**

**Objetivo**

Comprender cómo la protección de datos personales influye en el diseño, desarrollo, operación, seguridad y auditoría de las plataformas de datos, conectando los principios y obligaciones de la normativa chilena con arquitecturas, herramientas y prácticas reales de Ingeniería de Datos.

El propósito no es formar especialistas legales, sino desarrollar el criterio técnico necesario para identificar riesgos, diseñar soluciones responsables, implementar controles y generar evidencia verificable, integrando la privacidad durante todo el ciclo de vida de los datos.

**Idea central**

Un proceso puede ejecutarse sin errores, cumplir sus controles de calidad y entregar información confiable, pero al mismo tiempo:

- Utilizar datos para una finalidad no autorizada.
- Recopilar o conservar información que no resulta necesaria.
- Exponer datos personales mediante accesos, transformaciones o transferencias inadecuadas.
- Mantener copias o derivados que dificultan la rectificación o supresión.
- Carecer de trazabilidad y evidencia suficiente para investigar incidentes o demostrar la eficacia de sus controles.

Por ello, la Ingeniería de Datos debe incorporar la privacidad como un criterio transversal de diseño y operación, no únicamente como una revisión posterior al desarrollo.

**Contexto normativo**

La Ley 21.719, publicada el 13 de diciembre de 2024, introduce una reforma sustancial a la Ley 19.628 sobre protección de datos personales en Chile y contempla la creación de la Agencia de Protección de Datos Personales.

Las modificaciones tienen establecida su entrada en vigencia general para el 1 de diciembre de 2026. Hay un proyecto en el Senado (boletín 18.623-07) que propone correrla al 1 de diciembre de 2027: mientras no se publique, sigue vigente la fecha ya establecida.

**Qué implica para Ingeniería de Datos**

Las actividades habituales de una plataforma de datos —recolección, ingesta, consulta, transformación, almacenamiento, integración, transmisión, conservación y eliminación— pueden constituir operaciones de tratamiento de datos personales.

En consecuencia, una arquitectura de datos debe permitir responder preguntas fundamentales:

| Pregunta | Qué debe poder responder la plataforma |
|---|---|
| Qué datos tratamos | Identificación, clasificación y contexto de los datos personales. |
| Por qué los tratamos | Finalidad y fundamento de licitud definidos por los responsables correspondientes. |
| Dónde se encuentran | Sistemas de origen, capas de procesamiento, derivados, respaldos y terceros. |
| Quién puede utilizarlos | Identidades, permisos, condiciones de acceso y consumidores autorizados. |
| Durante cuánto tiempo | Políticas de conservación, bloqueo, anonimización o supresión, según corresponda. |
| Cómo protegemos los datos | Medidas de seguridad, minimización, seudonimización y prevención de exposiciones. |
| Cómo respondemos | Mecanismos para gestionar derechos de los titulares, vulneraciones e incidentes. |
| Cómo lo demostramos | Trazabilidad, verificaciones, registros y evidencia de los controles implementados. |

**De la normativa a la implementación técnica**

La ley establece obligaciones y responsabilidades jurídicas. La Ingeniería de Datos contribuye a su cumplimiento mediante soluciones técnicas adecuadas al contexto, al riesgo y a las decisiones adoptadas por las áreas responsables.

Para estudiar esa relación, utilizaremos el enfoque:

**Requisito normativo → Riesgo identificado → Control técnico → Verificación → Evidencia**

Este modelo permite conectar las obligaciones aplicables con decisiones concretas de arquitectura, desarrollo y operación.

**Resultado esperado**

Desarrollar conocimientos que permitan no solo comprender qué debe protegerse, sino también cómo diseñar, implementar, mantener y verificar soluciones de datos que incorporen la privacidad de forma consistente, trazable y sostenible.

### Base legal

Diecisiete filas de la Ley 19.628 (versión con vigencia diferida desde 2026-12-01). «Qué dice» es la nota; «Implicancia técnica» es `implication`.

| Artículo | Qué dice | Implicancia técnica |
|---|---|---|
| 1 bis | Ámbito territorial, también para responsables o encargados fuera de Chile en los casos que indica. | También alcanza al encargado fuera de Chile que trata por cuenta de un responsable en Chile y a quien, desde fuera, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento: el inventario de flujos los incluye. |
| 2 | Definiciones. | Dato personal, sensible, anonimización, seudonimización, perfiles y encargado son las categorías con que se clasifican columnas, datasets y proveedores. |
| 3 | Principios, letras a) a h). | Cada principio necesita un control y una evidencia. |
| 4 | Derechos del titular; desarrollados en los arts. 5 a 11. | Seis tipos de solicitud que la plataforma atiende con plazo y evidencia. |
| 8 bis | Decisiones individuales automatizadas. | Explicación, intervención humana y revisión en los modelos que deciden. |
| 12 | Consentimiento; el responsable prueba la licitud. | Las bases de licitud se registran por actividad de tratamiento. |
| 14 | Obligaciones del responsable. | Acreditar la licitud; suprimir o anonimizar los datos precontractuales. |
| 14 bis | Secreto o confidencialidad, también de datos públicos organizados o combinados. | El secreto alcanza a datos públicos que se organizan o combinan. |
| 14 ter | Información y transparencia. | La política pública se alimenta del catálogo. |
| 14 quáter | Protección desde el diseño y por defecto. | Minimización por defecto: número de datos, extensión del tratamiento, plazo de conservación y accesibilidad. |
| 14 quinquies | Medidas de seguridad y verificación regular; ante un incidente, si hay controversia judicial o administrativa, el responsable acredita sus medidas. | Cifrado, seudonimización, resiliencia, restauración y verificación periódica de las medidas. |
| 14 sexies | Reporte de vulneraciones a la Agencia, registro de esas comunicaciones y aviso a titulares en ciertos casos. | Dimensionar la vulneración para reportarla, registrar la comunicación y decidir el aviso a los titulares. |
| 15 bis | Tratamiento por un encargado. | El encargado cumple secreto y seguridad, reporta las vulneraciones y suprime o devuelve al terminar. |
| 15 ter | Evaluación de impacto. | Evaluación de impacto obligatoria en los casos que el artículo enumera. |
| 16 | Datos sensibles; reglas especiales en los arts. 16 bis a 16 sexies. | Reglas más estrictas por categoría de dato sensible. |
| 27 | Transferencia internacional. | Región de la nube, proveedores y APIs externas: cada flujo al exterior necesita un mecanismo. |
| 35 | Sanciones. | Varias infracciones nacen de fallas técnicas. |

### 2. Qué es

Mapa de artículos de la Ley 19.628 modificada y la ficha hija que los trata. En pantalla: Artículo y Qué implica para datos. La ficha aparece al pasar el cursor.

| Artículo | Qué implica para datos | Ficha (tooltip) |
|---|---|---|
| 1 bis | También se aplica a quien, desde fuera de Chile, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento | `processors-and-international-transfers` |
| 2 | Dato personal, sensible, anonimización, seudonimización, perfiles, encargado | `pii-identification`, `chilean-identifier-pseudonymization` |
| 3 | Cada principio (letras a a h) necesita un control y una evidencia | esta ficha |
| 4 | Acceso, rectificación, supresión, oposición, portabilidad y bloqueo; los arts. 5 a 11 los desarrollan | `data-subject-rights-pipeline` |
| 8 bis | Explicación, intervención humana y revisión de decisiones automatizadas | `dpia-and-automated-decisions` |
| 12 | Consentimiento; el responsable prueba que lo obtuvo y que el tratamiento fue lícito (las demás bases, en el art. 13) | `processing-activities-inventory` |
| 14 | Acreditar la licitud; suprimir o anonimizar datos precontractuales | `processing-activities-inventory` |
| 14 bis | El secreto alcanza datos públicos que se organizan o combinan | esta ficha |
| 14 ter | La política pública de tratamiento se alimenta del catálogo | `processing-activities-inventory` |
| 14 quáter | Por defecto, solo los datos estrictamente necesarios | `data-minimization-by-layer` |
| 14 quinquies | Seguridad, restauración y verificación regular de su eficacia | `privacy-controls-as-code` |
| 14 sexies | Reporte de vulneraciones a la Agencia y registro de esas comunicaciones; aviso a titulares en ciertos casos | `data-breach-response` |
| 15 bis | Encargo; el encargado suprime o devuelve al terminar (la cesión, en el art. 15) | `processors-and-international-transfers` |
| 15 ter | Evaluación de impacto en casos tasados | `dpia-and-automated-decisions` |
| 16 | Datos sensibles: consentimiento expreso, salvo excepciones; salud, biométricos, niños, niñas y adolescentes, investigación y geolocalización, en los arts. 16 bis a 16 sexies | `pii-identification` |
| 27 | Transferencia internacional: cuándo es lícita (países adecuados y cláusulas, en el art. 28) | `processors-and-international-transfers` |
| 35 | Sanciones por tipo de infracción (las infracciones, en los arts. 34 bis a 34 quáter); varias nacen de fallas técnicas | esta ficha (§16) |
| 49 | Modelo de prevención de infracciones: los responsables pueden adoptarlo voluntariamente (art. 49); el certificado del art. 51 acredita el atenuante del art. 36 n.º 5; reglamento en el Decreto 662 | `privacy-controls-as-code` |

Debajo del mapa:

- Ocho principios del art. 3: a) licitud y lealtad, b) finalidad, c) proporcionalidad, d) calidad, e) responsabilidad, f) seguridad, g) transparencia e información, h) confidencialidad.
- Art. 12: la carga de la prueba es del responsable.
- Art. 15 bis: el encargado trata solo según el encargo; si se aparta, responde como responsable.
- Decisión de arquitectura: legal, privacidad y negocio deciden finalidad, base y plazo; seguridad define el riesgo; ingeniería implementa controles y evidencia. La responsabilidad legal sigue en el responsable del tratamiento.

### 3. Problema que resuelve

Sin traducción técnica, la ley queda en un documento: copias sin control, accesos amplios, tablas que no se pueden borrar, backfills que reintroducen datos suprimidos y ninguna evidencia.

Con una matriz requisito → control → evidencia, ejecutada en la CI, cada requisito tiene un dueño técnico, un control que funciona y una prueba reciente.

### 4. Cómo funciona

1. Inventariar y clasificar datos personales y sensibles según el art. 2 (`pii-identification`).
2. Registrar cada actividad de tratamiento con finalidad, base de licitud y plazo, y asociarla a los activos. De ahí sale lo que pide el art. 14 ter (`processing-activities-inventory`).
3. Minimizar desde la ingesta con contratos de datos por capa (art. 14 quáter; `data-minimization-by-layer`).
4. Atender los derechos del art. 4: localizar, exportar, rectificar, bloquear y suprimir (`data-subject-rights-pipeline`, `retention-and-erasure`).
5. Controles de seguridad verificados y capacidad de dimensionar una vulneración (art. 14 sexies; `data-breach-response`).
6. Cada control produce evidencia automática y la CI falla si falta el control, falta la evidencia o está vencida (art. 14 quinquies; `privacy-controls-as-code`).

### 5. Cuándo utilizarlo

- Al diseñar una plataforma o un pipeline que trata datos de personas en Chile, o de personas en Chile desde fuera (art. 1 bis).
- Al preparar una revisión interna, un modelo de prevención o la respuesta a un requerimiento.

### 6. Cuándo no utilizarlo

- Para decidir finalidades, bases de licitud o plazos: eso lo deciden el área legal y el responsable.
- Como interpretación de la ley: esta ficha cita su texto y lo traduce a controles.

### 7. Ejemplo sencillo

| Requisito | Control implementado | Evidencia |
|---|---|---|
| Proporcionalidad y por defecto (arts. 3 c) y 14 quáter) | Contrato de datos con columnas permitidas por capa; retención por tabla | Test de esquema en la CI; retención aplicada |
| Calidad (art. 3 d)) | Tests de exactitud y actualidad | Reporte de calidad |
| Derechos (arts. 4 a 11) | Pipeline de solicitudes con índice de titulares | Log de solicitudes con plazos, sin datos del titular |
| Seguridad (art. 14 quinquies) | Cifrado, mínimo privilegio, seudonimización con HMAC | Revisión periódica de accesos; prueba de restauración |
| Vulneraciones (art. 14 sexies) | Consulta de alcance por linaje | Registro de vulneraciones |
| Encargo (art. 15 bis) | Inventario de encargados por dataset; supresión al cierre | Constancia de supresión o devolución |

### 8. Ejemplo de producción

Caso genérico: una aerolínea con datos de pasajeros, reservas y vuelos, en arquitectura por capas.

| Capa | Qué contiene | Controles | Error frecuente |
|---|---|---|---|
| Ingesta | Reservas, CRM, check-in, APIs | Contrato de datos, clasificación, campos permitidos | Ingerir «todo por si acaso» |
| Bronze | Datos de origen | Acceso restringido, retención definida, lista de supresión aplicada | Creer que bronze está exenta |
| Silver | Validado y minimizado | Seudonimización con HMAC y llave separada | Creer que un seudónimo vuelve anónimo el dato |
| Gold | Agregado o mínimo por caso de uso | Acceso por finalidad; agregación con umbral mínimo | Creer que gold no tiene datos personales |
| Consumo | BI, APIs, modelos | Máscaras de columna, filtros de fila, registro de decisiones automatizadas | Exportaciones sin control |

**Evidencia de cumplimiento**

| Evidencia | Dónde queda | Quién la produce |
|---|---|---|
| Matriz requisito → control → evidencia | Repositorio, versionada | Ingeniería de datos |
| Resultado de la matriz y fecha de cada evidencia | Log de la CI | CI |
| Actividades de tratamiento con finalidad, base y plazo | Catálogo | Dueño del dato, área legal |
| Solicitudes de titulares y su cierre | Log de solicitudes, sin datos del titular | Pipeline de derechos |
| Vulneraciones | Registro de vulneraciones | Seguridad, ingeniería |

### 9. Arquitectura

Dos diagramas.

Del requisito al dato: Legal y negocio (finalidad, base, plazo) → Catálogo de actividades → Ingesta con contrato → capas Bronze → Silver seudonimizado → Gold → Consumo por finalidad.

Control y evidencia: Solicitudes de titulares → Índice de titulares → Bronze, silver, gold. La matriz requisito, control, evidencia y las capas entran a la CI, que falla con brechas y deja evidencia fechada.

### 10. Código

Script de Python 3.12, biblioteca estándar, pensado para la CI. Matriz de seis filas. Sale con código 1 si un requisito no tiene control, no tiene evidencia o la evidencia tiene más de 30 días. Con la fecha fija del ejemplo (2026-10-22) imprime 6 requisitos y 3 brechas: seguridad con evidencia vencida (82 días), registro de vulneraciones sin evidencia y encargados sin control. Un control documentado sin evidencia reciente no demuestra que siga operando (art. 14 quinquies d)).

### 11. GCP

Sensitive Data Protection y Cloud Audit Logs. No ejecutado.

| Necesidad | Servicio | Marca |
|---|---|---|
| Descubrir y clasificar | Sensitive Data Protection: descubre, clasifica y desidentifica; perfila BigQuery, Cloud SQL y Cloud Storage | buena práctica (sin marca) |
| Auditar accesos a datos | Cloud Audit Logs: los Data Access audit logs están desactivados por defecto, salvo en BigQuery | punto de arquitectura |

### 12. AWS

Amazon Macie y AWS CloudTrail. No ejecutado.

| Necesidad | Servicio | Marca |
|---|---|---|
| Descubrir | Amazon Macie: datos sensibles en buckets de S3 | buena práctica (sin marca) |
| Auditar accesos a datos | CloudTrail: los data events no se registran por defecto | punto de arquitectura |

### 13. Azure

Microsoft Purview y Unity Catalog de Azure Databricks. No ejecutado.

| Necesidad | Servicio | Marca |
|---|---|---|
| Descubrir y clasificar | Purview Data Map: clasificaciones de sistema y propias al escanear | buena práctica (sin marca) |
| Gobierno en el lakehouse | Unity Catalog: privilegios, políticas por atributos, filtros de fila y columna, auditoría y linaje | buena práctica (sin marca) |

Ningún servicio certifica cumplimiento por sí solo: cada uno se evalúa por alcance, configuración y evidencia disponible.

### 14. Buenas prácticas

- Una fila de la matriz por requisito, con dueño técnico y fecha de la última evidencia.
- Los metadatos legales viven en el catálogo, por actividad de tratamiento, no en el código del pipeline.
- Seguridad: ningún ambiente no productivo con datos personales reales; datos enmascarados o sintéticos.
- Observabilidad: sin datos personales en los logs; los logs de solicitudes y de vulneraciones guardan identificadores internos.
- GenAI: tratar una API externa de LLM que recibe datos personales como un encargado (art. 15 bis) y revisar si hay transferencia internacional (art. 27).
- Costo: empezar por lo de mayor riesgo: datos sensibles (incluida la situación socioeconómica), datos de niños, niñas y adolescentes, copias y accesos.

### 15. Errores frecuentes

- Tratar la ley como un tema solo del área legal.
- Controles documentados que nadie verifica.
- Base de licitud asignada a un dataset entero.
- Borrar en una tabla y olvidar derivados, respaldos y backfills.
- Creer que seudonimizar es anonimizar.
- Ignorar que tratar datos innecesarios o inexactos es infracción grave (art. 34 ter c) y d)).

### 16. Trade-offs

Una matriz detallada da trazabilidad completa y cuesta mantenerla; una matriz corta se mantiene y deja huecos. Conviene una fila por requisito, con el detalle en las fichas hijas. Exigir evidencia reciente aumenta el costo de operación, pero es lo que permite demostrar que el control funciona.

**Sanciones (arts. 34 bis a 35)**

| Tipo | Ejemplos con origen técnico | Multa máxima |
|---|---|---|
| Leve | Responder solicitudes en forma incompleta o fuera de plazo (34 bis c)) | 5.000 UTM o amonestación escrita |
| Grave | Datos innecesarios o inexactos (34 ter c) y d)); fallas de seguridad (j)); omitir registros de vulneraciones (k)); transferencias contra la ley (m)) | 10.000 UTM |
| Gravísima | Omitir en forma deliberada la comunicación de una vulneración (34 quáter f)); no hacer la evaluación de impacto obligatoria (k)) | 20.000 UTM |

En reincidencia, la Agencia puede aplicar hasta tres veces el monto. Si una empresa que no es de menor tamaño reincide en infracciones graves o gravísimas, la multa puede alcanzar la más gravosa entre ese triple y el 2 % o 4 % de sus ingresos anuales, respectivamente (art. 35). Es atenuante el certificado del art. 51 (art. 36 n.º 5), del modelo de prevención voluntario (art. 49).

**Básico vs. senior**

| Enfoque básico | Enfoque senior |
|---|---|
| Identifica datos personales | Automatiza su descubrimiento y clasificación |
| Aplica permisos IAM | Diseña segregación de funciones y revisiones de privilegios |
| Ejecuta un DELETE | Diseña supresión consistente entre capas, respaldos y reprocesamientos |
| Conoce el cifrado | Gestiona llaves, secretos y evidencia de configuración |
| Documenta pipelines | Mantiene linaje técnico por actividad de tratamiento |
| Ejecuta pruebas de calidad | Pone controles de privacidad en la CI |
| Responde ante incidentes | Calcula el alcance de una vulneración en horas |

### 17. Conceptos relacionados

Hijas del subdominio: `pii-identification`, `processing-activities-inventory`, `data-minimization-by-layer`, `chilean-identifier-pseudonymization`, `data-subject-rights-pipeline`, `retention-and-erasure`, `data-breach-response`, `dpia-and-automated-decisions`, `processors-and-international-transfers`, `privacy-controls-as-code`.

Otra: `data-classification`.

### 18. Preguntas técnicas abiertas

1. ¿Qué pipelines tuyos tratan datos de personas, y para qué actividades?
2. Si mañana llega una solicitud de supresión, ¿en cuántas tablas, respaldos y exportaciones está ese titular?
3. ¿Qué control tuyo tiene evidencia de los últimos 30 días?

### 19. Laboratorio relacionado

Pendiente (F4).

### 20. Fuentes

- BCN Ley Chile: Ley 19.628 (versión con vigencia diferida desde 2026-12-01), Ley 21.719 y Decreto 662.
- Senado: boletín 18623-07 (tramitación) y boletín N° 18.623-07 (mensaje N° 110-374).
- Google Cloud: Sensitive Data Protection overview y Cloud Audit Logs overview.
- AWS: What is Amazon Macie? y Logging data events.
- Microsoft Learn: Data classification in Data Map y What is Unity Catalog?.

El detalle de cada fuente está en `sources` del frontmatter. En la ficha, la sección muestra los enlaces y la nota de cada fuente.

### 21. Fecha de última verificación

2026-10-25: textos legales vueltos a consultar en BCN y en el Senado, sin cambios. `review_required`: pasa a `verified` solo con la aprobación explícita de Felipe. Revisión mensual, y extraordinaria si se publica la ley de postergación.

### 22. Historial de cambios importantes

- 2026-10-21: creación; absorbe `compliance-scope-for-data-engineers`.
- 2026-10-22: reestructura como ficha padre del subdominio.
- 2026-10-24: las hijas se declaran con `PART_OF`; `implication` por artículo en `legal_basis`.
- 2026-10-25: revisión del upgrade y auditoría de las etiquetas «Obligación legal».
- 2026-10-25: §9 con el estándar de diagramas.
- 2026-10-28: el resumen pasa a ser la introducción del subdominio. La vigencia citada sigue siendo la de la ley publicada; el boletín 18.623-07 sigue siendo un proyecto.
