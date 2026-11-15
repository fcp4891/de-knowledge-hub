---
id: concept:pii-identification
slug: pii-identification
type: concept
title: Identificación de datos personales y sensibles
description: 'Identificar qué permite reconocer a una persona, sola o combinada, y registrarlo con fundamento, revisor y fecha: es el primer control.
  La ley define dato personal y enumera los sensibles, incluida la situación socioeconómica. Seis pasos sin umbral universal y un detector didáctico
  (RUT con dígito verificador, correo, nombres sensibles) que da hallazgos para revisión sin imprimir valores; ejecutado en la CI. Detectores
  chilenos en Sensitive Data Protection, Macie y Purview. No es asesoría legal.'
domain: privacy-engineering
subdomain: fundamentos
category: compliance
classification: core
level: intermediate
importance: high
cloud:
- agnostic
technologies:
- python
tags:
- compliance
- privacy
- pii
- rut
- classification
related_topics:
- data-classification
- data-masking
jurisdiction:
- CL
legal_basis:
- law: ley-19628
  article: '2'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Dato personal (letra f: persona identificada o identificable), datos sensibles (letra g), fuente de acceso público (letra i), anonimización
    (letra k) y seudonimización (letra l).'
  implication: Clasificar cada columna como personal, sensible, anonimizada o sin vínculo, incluidas las que identifican por medios indirectos
    y las seudonimizadas.
- law: ley-19628
  article: 14 quinquies
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: Medidas de seguridad; la letra a) menciona el cifrado.
  implication: 'El cifrado protege el dato, pero quien tiene la llave puede volver a él: no es anonimización.'
- law: ley-19628
  article: '16'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: Los datos sensibles se tratan con consentimiento expreso del titular, salvo las excepciones del artículo.
  implication: Las columnas sensibles llevan su categoría propia; la base de licitud la decide el área legal.
- law: ley-19628
  article: 16 quáter
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Datos de niños, niñas y adolescentes: interés superior, autonomía progresiva y consentimiento según la edad.'
  implication: La regla especial se marca además de la categoría; la edad del titular no se infiere de una muestra.
sources:
- source: diario-oficial-cl
  url: https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf
  accessed: '2026-11-12'
  page_title: LEY NÚM. 21.719 REGULA LA PROTECCIÓN Y EL TRATAMIENTO DE LOS DATOS PERSONALES Y CREA LA AGENCIA DE PROTECCIÓN DE DATOS PERSONALES
  label: Diario Oficial
  note: 'Ley 21.719 publicada en el Diario Oficial núm. 44.023, viernes 13 de diciembre de 2024 (CVE 2583630). Texto publicado de la ley modificatoria:
    art. 2 letras f), g), i), k) y l) de la Ley 19.628 (pág. 2); art. 14 quinquies letra a) (pág. 10); art. 16 (pág. 12); art. 16 quáter (pág.
    13). Rigen desde el 2026-12-01.'
- source: bcn-leychile
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  accessed: '2026-11-12'
  page_title: Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES
  note: 'Ley 19.628 en la versión «Con Vigencia Diferida por Fecha» desde el 2026-12-01: texto consolidado con las modificaciones de la Ley 21.719.'
- source: eur-lex
  url: https://eur-lex.europa.eu/eli/reg/2016/679/oj
  accessed: '2026-11-12'
  page_title: Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with
    regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection
    Regulation)
  note: 'Legislación comparada, no chilena. Art. 9: categorías especiales de datos personales; no incluye la situación socioeconómica.'
- source: who-icd-10
  url: https://icd.who.int/browse10/2019/en#/J45
  accessed: '2026-11-12'
  page_title: ICD-10 Version:2019
  note: 'CIE-10 (OMS), versión 2019: J45 es asma. Código del ejemplo de la columna diagnostico.'
- source: gcp-sensitive-data-protection-docs
  url: https://docs.cloud.google.com/sensitive-data-protection/docs/infotypes-reference
  accessed: '2026-11-12'
  page_title: InfoType detector reference
  note: CHILE_CDI_NUMBER (categorías GOVERNMENT_ID, PII y SPII), EMAIL_ADDRESS y detectores de salud, origen étnico, religión, política, orientación
    sexual y sindicatos (MEDICAL_TERM, ETHNIC_GROUP, RELIGIOUS_TERM, POLITICAL_TERM, SEXUAL_ORIENTATION, TRADE_UNION).
- source: gcp-sensitive-data-protection-docs
  url: https://docs.cloud.google.com/sensitive-data-protection/docs/data-profiles
  accessed: '2026-11-12'
  page_title: Overview of sensitive data discovery
  note: Perfiles de datos de BigQuery, Cloud SQL y Cloud Storage; también Amazon S3 y Azure Blob Storage. La página no dice que use el nombre
    de la columna.
- source: gcp-sensitive-data-protection-docs
  url: https://docs.cloud.google.com/sensitive-data-protection/docs/concepts-risk-analysis
  accessed: '2026-11-12'
  page_title: Re-identification risk analysis
  note: 'Análisis de riesgo de reidentificación: k-anonimato, l-diversidad, k-map y δ-presencia.'
- source: aws-macie-docs
  url: https://docs.aws.amazon.com/macie/latest/user/mdis-reference-quick.html
  accessed: '2026-11-12'
  page_title: 'Quick reference: Managed data identifiers by type'
  note: CHILE_RUT_NUMBER entre los identificadores administrados de Amazon Macie, con palabra clave cerca del valor; la referencia no incluye
    correo electrónico.
- source: aws-macie-docs
  url: https://docs.aws.amazon.com/macie/latest/user/cdis-options.html
  accessed: '2026-11-12'
  page_title: Configuration options for custom data identifiers
  note: 'Identificadores personalizados: expresión regular, palabras clave y nombre de columna o campo como palabra clave.'
- source: microsoft-purview-docs
  url: https://learn.microsoft.com/en-us/purview/sit-defn-chile-identity-card-number
  accessed: '2026-11-12'
  page_title: Chile identity card number
  note: Tipo de información sensible de Purview para la cédula chilena; valida el dígito verificador y la confianza sube con una palabra clave
    cerca.
- source: microsoft-purview-docs
  url: https://learn.microsoft.com/en-us/purview/data-map-classification-supported-list
  accessed: '2026-11-12'
  page_title: System classifications supported in Data Map
  note: 'Clasificaciones de sistema de Purview Data Map: Email (según la documentación, no aplica a datos no estructurados); sin clasificaciones
    de salud o religión.'
- source: microsoft-purview-docs
  url: https://learn.microsoft.com/en-us/purview/data-map-classification-custom
  accessed: '2026-11-12'
  page_title: Custom classifications in Data Map
  note: Clasificaciones personalizadas con patrón de datos o de columna (expresión regular sobre el nombre); las reglas personalizadas se documentan
    solo en inglés.
relations:
- type: RELATED_TO
  target: data-classification
  note: La clasificación general; aquí, con las categorías de la ley.
- type: RELATED_TO
  target: data-masking
  note: Lo que se detecta como personal se enmascara al mostrar.
- type: PART_OF
  target: chile-data-protection
  note: El panorama de la ley.
- type: RELATED_TO
  target: data-minimization-by-layer
  note: Lo identificado decide qué columnas pasan de capa.
- type: RELATED_TO
  target: chilean-identifier-pseudonymization
  note: Qué hacer con el RUT detectado.
- type: RELATED_TO
  target: privacy-controls-as-code
  note: Reglas de cobertura de etiquetas sobre lo detectado.
- type: RELATED_TO
  target: data-breach-response
  note: Las categorías deciden el aviso a titulares.
views:
  reading:
    legal_basis_panel: false
    break_identifiers: true
  section_titles:
  - section: 1
    title: Propósito
  - section: 2
    title: Qué cuenta como dato personal y sensible
    ref: Qué protege la ley
  - section: 3
    title: Problema que resuelve
  - section: 4
    title: Cómo funciona
  - section: 5
    title: Cuándo usarlo
  - section: 10
    title: Código
  - section: 11
    title: En la nube
  - section: 14
    title: Hacer y evitar
  - section: 16
    title: Trade-offs
  - section: 18
    title: Preguntas técnicas abiertas
  - section: 20
    title: Fuentes
  catalog_fields:
    title: Por cada columna, el catálogo guarda
    label: Qué guarda el catálogo por cada columna
    headers:
    - Campo
    - Para qué sirve
    rows:
    - field: Categoría
      text: Qué es la columna para la ley. Si es de un niño, niña o adolescente, se marca además la regla especial [(art. 16 quáter)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=13).
      categories:
      - label: personal
        tone: personal
      - label: sensible
        tone: sensitive
      - label: anonimizada
        tone: none
      - label: sin vínculo con personas
        tone: none
      note: 'Mientras nadie la confirma, un candidato dudoso queda «en revisión»: así lo registra el código de la ficha, y el campo Revisión
        dice quién lo resolvió.'
    - field: Fundamento
      text: El artículo y el motivo concreto, para que otra persona pueda revisar la decisión sin repetir el análisis.
    - field: Riesgo técnico
      text: 'Decisión de seguridad, separada de la categoría: define cifrado, acceso y enmascaramiento. No la fija la ley; la fija la organización.'
    - field: Método
      text: 'Cómo se llegó a la conclusión: patrón, nombre de columna, combinación de atributos o conocimiento del dominio. Muestra si bastó la
        detección automática o hizo falta criterio humano.'
    - field: Revisión
      text: 'Quién confirmó la decisión y cuándo. No es permanente: se repite si cambia el esquema, llega una fuente nueva o aparece texto libre.'
  notes:
    catalogo:
      lead: Los mismos campos en toda la ficha.
      text: Son los que muestra el árbol de decisión en «Así queda en el catálogo», y la revisión periódica es el paso «Mantener» del proceso.
    categoria-riesgo:
      lead: Categoría y riesgo van separados.
      text: «Sensible» es una categoría de la ley; el riesgo técnico «alta» es una decisión de seguridad de la organización.
    categoria-preliminar:
      lead: La categoría es preliminar.
      text: 'Se confirma en la revisión con el contexto real de cada columna: es el paso 04, «Clasificar y revisar».'
    riesgo:
      lead: Riesgo
      text: Publicar una tabla analítica o compartirla con un proveedor creyendo que no tiene datos personales.
      tone: risk
    umbral:
      lead: No hay un umbral universal.
      text: Un solo valor sensible en mil filas puede importar. Cuántos valores calzan sirve para priorizar la revisión, no para decidir que una
        columna no tiene datos personales.
    equivalencias:
      lead: No son equivalencias exactas.
      text: Ningún servicio certifica cumplimiento por sí solo. Documentación consultada el 2026-11-12.
  chips:
    ficha-madre:
      label: 'En la ficha madre:'
      items:
      - kind: Cómo funciona
        label: ¿Qué datos trato?
        href: /concepts/chile-data-protection/#como-funciona-01
      - kind: Matriz
        label: Minimización
        href: /concepts/chile-data-protection/#matriz-minimizacion
      - kind: Prácticas
        label: Clasificación automática
        href: /concepts/chile-data-protection/#practica-clasificacion-automatica
    conexiones:
      label: 'Se conecta con:'
      items:
      - kind: Ficha
        label: Minimización por capa
        href: /concepts/data-minimization-by-layer/
      - kind: Ficha
        label: Controles de privacidad como código
        href: /concepts/privacy-controls-as-code/
  concept_map:
    label: Qué protege la ley
    outside:
      kicker: Fuera de la ley
      items:
      - title: Anonimizado
        text: El vínculo con la persona se destruyó de forma irreversible. Deja de ser dato personal [(art. 2 letra k)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
      - title: Sin vínculo con personas
        text: 'Precios, productos, métricas de máquinas: en esa tabla no se refieren a una persona.'
      hint: Preguntas 1 y 2
    personal:
      kicker: Dato personal · [art. 2 letra f](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2)
      definition: «Cualquier información vinculada o referida a una persona natural identificada o identificable».
      text: 'Identificable: su identidad puede determinarse directa o indirectamente, con los medios que razonablemente se podrían usar. No hace
        falta un nombre: puede bastar un número de identificación o una combinación de rasgos, si con esos medios se llega a la persona.'
      also:
        kicker: Siguen siendo dato personal
        items:
        - title: Seudonimizado [(art. 2 letra l)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2)
          text: El identificador se reemplaza por un código, pero con información guardada aparte se vuelve a la persona. No saca el dato de la
            ley.
          example:
            label: Ver con
            column: rut_hash
        - title: De fuente pública [(art. 2 letra i)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2)
          text: 'Que cualquiera pueda consultarlo lícitamente no lo libera: su tratamiento también se somete a la ley.'
          example:
            label: Ver con
            column: nombre_directorio
        - title: Cifrado [(art. 14 quinquies letra a)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=10)
          text: 'La ley lo menciona como medida de seguridad. Quien tiene la llave puede volver al dato: por eso no es la anonimización del [art.
            2 letra k](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).'
    sensitive:
      kicker: Dato sensible · [art. 2 letra g](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2)
      text: 'Un dato personal que revela algo íntimo: salud, origen étnico, situación socioeconómica, creencias, vida u orientación sexual, biometría,
        entre otros. Exige consentimiento expreso, por declaración escrita, verbal o un medio tecnológico equivalente, salvo excepciones [(art.
        16)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=12).'
      hint: Pregunta 3
    minors:
      kicker: Niños, niñas y adolescentes · [art. 16 quáter](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=13)
      text: 'No es otra categoría: es una regla de interés superior y de consentimiento que se suma, según la edad.'
      hint: Pregunta 4
  decision_tree:
    intro:
      title: Cuatro preguntas, en orden, ubican cada columna en este mapa.
      text: 'Elige un ejemplo: se muestran solo las preguntas que recorre, y la caja de resultado indica en qué pregunta termina.'
    examples_title: Elige una columna de ejemplo
    path_label: Recorrido de la columna elegida
    result_label: Resultado para
    catalog_label: Así queda en el catálogo
    answer_labels:
      'yes': Sí
      'no': 'No'
    step_labels:
      question: Pregunta
      next: ↓ siguiente pregunta
      end: → termina aquí
    questions:
    - number: 1
      question: ¿Se destruyó el vínculo con la persona de forma irreversible?
      help: Anonimizar exige que ya no se pueda asociar ni identificar a nadie.
      gloss:
        'yes': el vínculo se destruyó
        'no': no fue anonimizada
      exits:
      - answer: 'yes'
        label: Si es sí
        outcome: anonymized
        title: No es dato personal
        text: Un dato anonimizado deja de ser dato personal [(art. 2 letra k)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    - number: 2
      question: ¿Está vinculada a una persona identificada o identificable?
      help: Porque la identifica (nombre, RUT, combinación de atributos) o porque está en la misma fila que algo que la identifica. Se consideran
        los medios que razonablemente se podrían usar.
      gloss:
        'yes': está vinculada
        'no': no hay vínculo
      exits:
      - answer: 'no'
        label: Si es no
        outcome: unlinked
        title: Sin vínculo con personas
        text: No es dato personal. Se registra el motivo, para revisarlo si cambia la tabla.
    - number: 3
      question: ¿Revela alguna categoría del art. 2 letra g)?
      help: Origen étnico o racial; afiliación política, sindical o gremial; situación socioeconómica; convicciones ideológicas o filosóficas;
        creencias religiosas; salud; perfil biológico humano; biometría; vida sexual, orientación sexual e identidad de género.
      gloss:
        'yes': revela una categoría sensible
        'no': no revela ninguna
      exits:
      - answer: 'yes'
        label: Si es sí
        outcome: sensitive
        title: Dato sensible
        text: Consentimiento expreso, salvo las excepciones de la ley [(art. 16)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=12).
    - number: 4
      question: ¿Es de un niño, niña o adolescente?
      help: 'Niños y niñas: menores de 14. Adolescentes: mayores de 14 y menores de 18.'
      gloss:
        'yes': es de un menor de edad
        'no': no es de un menor de edad
      exits:
      - answer: 'yes'
        label: Si es sí
        outcome: minor
        title: Regla especial
        text: Interés superior y reglas de consentimiento según la edad [(art. 16 quáter)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=13).
      - answer: 'no'
        label: Si es no
        outcome: personal
        title: Dato personal
        text: Persona identificada o identificable [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    fallback:
      label: En los demás casos
      outcome: personal
      title: Dato personal
      text: Persona identificada o identificable [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    catalog_fields:
      category: Categoría
      basis: Fundamento
      risk: Riesgo técnico
      method: Método
      review: Revisión
    review: privacidad · 2026-11-10
    default: tramo_ingreso
    examples:
    - column: cliente_id
      description: Código interno del cliente (C‑10293). La tabla de clientes tiene ese mismo código junto al nombre y el RUT.
      answers:
      - 'no'
      - 'yes'
      - 'no'
      - 'no'
      outcome: personal
      title: Dato personal
      explanation: 'Con la tabla de clientes, el código lleva al nombre y al RUT: identifica indirectamente (art. 2 letra f).'
      catalog:
        category: personal
        basis: art. 2 letra f · identifica indirectamente
        risk: media
        method: conocimiento del dominio
    - column: diagnostico
      description: Código de diagnóstico médico del paciente (J45 = asma).
      answers:
      - 'no'
      - 'yes'
      - 'yes'
      outcome: sensitive
      title: Dato sensible
      explanation: Es un dato relativo a la salud de una persona identificable (art. 2 letra g).
      catalog:
        category: sensible
        basis: art. 2 letra g · salud
        risk: alta
        method: nombre de columna
    - column: tramo_ingreso
      description: 'Tramo de ingreso mensual del cliente: A, B o C, de menor a mayor.'
      answers:
      - 'no'
      - 'yes'
      - 'yes'
      outcome: sensitive
      title: Dato sensible
      explanation: Revela la situación socioeconómica de una persona identificable (art. 2 letra g).
      catalog:
        category: sensible
        basis: art. 2 letra g · situación socioeconómica
        risk: alta
        method: nombre de columna
    - column: rut_hash
      description: RUT reemplazado por un código; la tabla que lo traduce está en otro sistema.
      answers:
      - 'no'
      - 'yes'
      - 'no'
      - 'no'
      outcome: personal
      title: Dato personal
      explanation: 'Seudonimizado: con la tabla que lo traduce se vuelve al titular (art. 2 letra l).'
      catalog:
        category: personal
        basis: art. 2 letra l · seudonimizado
        risk: media
        method: revisión del esquema
    - column: nota_alumno
      description: Nota de un alumno de 12 años, en la tabla de su colegio.
      answers:
      - 'no'
      - 'yes'
      - 'no'
      - 'yes'
      outcome: minor
      title: Dato personal de un niño
      explanation: 'El alumno tiene 12 años: es niño para la ley. Atendiendo a su interés superior y autonomía progresiva, se requiere el consentimiento
        de sus padres, representantes legales o de quien tenga su cuidado personal, salvo que la ley lo autorice o mandate expresamente (art.
        16 quáter).'
      catalog:
        category: personal · niño
        basis: art. 16 quáter
        risk: alta
        method: conocimiento del dominio
      law: true
    - column: nombre_directorio
      description: Nombre de una persona copiado de un registro público.
      answers:
      - 'no'
      - 'yes'
      - 'no'
      - 'no'
      outcome: personal
      title: Dato personal
      explanation: Venir de una fuente de acceso público no le quita el carácter personal (art. 2 letra i).
      catalog:
        category: personal
        basis: art. 2 letra i · fuente pública
        risk: media
        method: origen de la fuente
    - column: ventas_por_region
      description: Total de ventas por región, sin el detalle por cliente; cada región tiene miles de clientes.
      answers:
      - 'yes'
      outcome: anonymized
      title: No es dato personal
      explanation: 'Se agregó de forma irreversible: no conserva el detalle por cliente y ninguna región es tan pequeña como para llegar a alguien.
        Así deja de ser dato personal (art. 2 letra k).'
      catalog:
        category: anonimizado
        basis: art. 2 letra k
        risk: baja
        method: revisión de la agregación
    - column: precio_lista
      description: Precio de un producto en la tabla del catálogo, sin datos de clientes.
      answers:
      - 'no'
      - 'no'
      outcome: unlinked
      title: Sin vínculo con personas
      explanation: 'El precio de lista está en una tabla de productos, sin datos de clientes. Si se copia a una tabla de compras, cambia: ahí
        queda vinculado a quien compró.'
      catalog:
        category: sin vínculo
        basis: no es dato personal
        risk: baja
        method: revisión del esquema
    law:
      summary: Qué dice el art. 16 quáter
      items:
      - El tratamiento solo puede hacerse atendiendo al interés superior del niño, niña o adolescente y respetando su autonomía progresiva. Cumplido
        eso, se aplican las reglas siguientes.
      - '**Niños y niñas (menores de 14):** se requiere el consentimiento de sus padres, representantes legales o de quien tenga su cuidado personal,
        salvo que la ley lo autorice o mandate expresamente.'
      - '**Adolescentes (mayores de 14 y menores de 18):** se aplican las normas de autorización que la ley prevé para los adultos.'
      - '**Datos sensibles de adolescentes menores de 16:** también requieren el consentimiento de padres, representantes legales o de quien tenga
        su cuidado personal, con la misma salvedad.'
      - Los establecimientos educacionales y quien trate o administre estos datos, incluido quien ejerce su cuidado personal, deben velar por
        su uso lícito y su protección.
      link:
        label: Ver el texto en el Anexo · Catálogo legal
        href: /concepts/chile-data-protection/#lb-ley-19628-16-quater
  coverage_strip:
    label: Cobertura sobre las nueve columnas de la muestra
    lead: 'La muestra del código tiene nueve columnas, todas en la misma fila que un RUT, así que todas son información vinculada a una persona
      [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2). Esto es lo que ve cada enfoque:'
    columns:
    - rut_cliente
    - contacto
    - comentarios
    - diagnostico
    - tramo_ingreso
    - comuna
    - edad
    - fecha_ingreso
    - producto
    rows:
    - title: Solo patrones
      text: RUT y correo con expresiones regulares
      count: 3 de 9
      hits:
      - rut_cliente
      - contacto
      - comentarios
      tone: detected
    - title: Detector de la ficha
      text: los cuatro frentes del código
      count: 7 de 9
      hits:
      - rut_cliente
      - contacto
      - comentarios
      - diagnostico
      - tramo_ingreso
      - comuna
      - edad
      tone: detected
    - title: Lo que exige la ley
      text: todas son dato personal
      count: 9 de 9
      hits:
      - rut_cliente
      - contacto
      - comentarios
      - diagnostico
      - tramo_ingreso
      - comuna
      - edad
      - fecha_ingreso
      - producto
      tone: law
    note: 'Las cifras del detector salen de ejecutar el escenario `muestra`; las de «solo patrones», de aplicar únicamente las expresiones de
      RUT y correo. Las dos columnas restantes, y un `cliente_id` enlazable, se clasifican con conocimiento del dominio. El detalle por tipo de
      columna:'
  column_types:
    headers:
    - Tipo de columna
    - Solo patrones
    - Detector de la ficha
    - Categoría probable
    - Por qué
    rows:
    - type: Identificador directo
      examples: '`rut_cliente` `contacto`'
      patterns:
        mark: ok
        text: RUT y correo
      detector:
        mark: ok
        text: RUT y correo
      categories:
      - label: Personal
        tone: personal
      why: Identifica a la persona por sí solo [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    - type: Valor malformado
      examples: RUT con DV inválido en `rut_cliente`
      patterns:
        mark: miss
        text: Lo descarta, si valida el DV
      detector:
        mark: part
        text: Lo deja en revisión
      categories:
      - label: Revisar
        tone: review
      why: Un error de captura puede seguir apuntando a una persona.
    - type: Texto libre
      examples: '`comentarios`'
      patterns:
        mark: part
        text: Solo el correo
      detector:
        mark: ok
        text: Correo y «licencia médica»
      categories:
      - label: Personal
        tone: personal
      - label: Sensible
        tone: sensitive
      why: Puede traer cualquier dato, incluida la salud [(art. 2 letra g)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    - type: Atributo que revela una categoría sensible
      examples: '`diagnostico` `tramo_ingreso`'
      patterns:
        mark: miss
        text: Nada
      detector:
        mark: ok
        text: Por el nombre de la columna
      categories:
      - label: Sensible
        tone: sensitive
      why: Salud y situación socioeconómica, si se asocian a una persona identificable [(art. 2 letra g)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
    - type: Combinación de atributos
      examples: '`comuna` + `edad`'
      patterns:
        mark: miss
        text: Nada
      detector:
        mark: ok
        text: Combinación única en 2 de 4 filas
      categories:
      - label: Revisar
        tone: review
      why: Solas no identifican; juntas pueden dejar a una sola persona.
    - type: Clave interna enlazable
      examples: '`cliente_id` (no está en la muestra)'
      patterns:
        mark: miss
        text: Nada
      detector:
        mark: miss
        text: Tampoco
      categories:
      - label: Personal
        tone: personal
      why: Identifica si se puede enlazar con la tabla de clientes. Se clasifica por conocimiento del dominio.
    - type: Sin señal propia
      examples: '`fecha_ingreso` `producto`'
      patterns:
        mark: miss
        text: Nada
      detector:
        mark: miss
        text: Nada
      categories:
      - label: Personal
        tone: personal
      why: 'Solas no identifican, pero están en la misma fila que un RUT: son información vinculada a esa persona [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
        El detector no lo marca: «sin hallazgo» no es «anónimo».'
    legend:
    - ✓ detecta
    - ~ detecta una parte
    - ✕ no detecta
    - Los ejemplos son las columnas de la muestra del código; su salida se puede comprobar al ejecutarlo.
  evidence_steps:
    evidence_label: Evidencia
    steps:
    - number: '01'
      title: Inventariar
      text: Fuentes, tablas, vistas, archivos, eventos, logs y exportaciones, con su esquema y su responsable.
      evidence: Inventario de activos en el catálogo
    - number: '02'
      title: Detectar candidatos
      text: Patrones sobre los valores, nombres de columna por token, diccionarios por categoría y detectores de la nube.
      evidence: Hallazgos en el log del job, sin valores personales
    - number: '03'
      title: Evaluar el contexto
      text: Enlaces con otras tablas, texto libre, campos codificados y combinaciones que dejan a una sola persona.
      evidence: Relaciones y combinaciones revisadas
    - number: '04'
      title: Clasificar y revisar
      arq: true
      text: Categoría jurídica y etiqueta técnica, por separado. Lo dudoso va al dueño del dato y a privacidad.
      evidence: Decisión con fundamento, revisor y fecha
    - number: '05'
      title: Registrar y habilitar
      arq: true
      text: La entrada queda en el catálogo. Una puerta bloquea la capa si hay candidatos sensibles o dudosos sin revisar.
      evidence: Resultado de la puerta (0 o 1) y columnas que la bloquean
    - number: '06'
      title: Mantener
      text: Reanalizar ante cambios de esquema, fuentes nuevas, transformaciones y revisiones periódicas según el riesgo.
      evidence: Historial de cambios y reclasificaciones
    flow:
    - title: Catálogo
      text: Qué columnas son personales o sensibles, con qué fundamento.
    - title: Controles
      text: Permisos, contratos de datos, minimización y monitoreo. La clasificación los alimenta, pero no los implementa.
  use_avoid:
    use:
      title: Usarlo
      items:
      - 'Antes de incorporar una fuente o habilitar un consumidor nuevo: es la puerta de habilitación del código.'
      - 'Cuando cambia un esquema o se cruzan tablas: un cruce nuevo puede volver identificable lo que antes no lo era.'
      - Antes de publicar o compartir un agregado, para comprobar que ningún grupo es tan pequeño que identifique a alguien.
      - En migraciones, copias a ambientes de desarrollo e integraciones con APIs, incluidas las de modelos de lenguaje.
      - En el escaneo periódico de las capas, para encontrar datos personales donde no deberían estar.
    avoid:
      title: No usarlo para
      items:
      - 'Certificar que no hay datos personales: «sin hallazgos» no significa anónimo.'
      - 'Anonimizar: detectar o enmascarar no es anonimizar, que exige que el vínculo se destruya de forma irreversible [(art. 2 letra k)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).'
      - 'Decidir la base de licitud de un dato sensible: es una decisión jurídica, no técnica.'
      - 'Reemplazar la revisión: un patrón no sabe que una clave interna se enlaza con otra tabla.'
  control_evidence:
    title: Detección y habilitación
    lead: 'Patrón general: cómo una plataforma decide si una capa nueva puede habilitarse para consumo.'
    steps:
    - number: '1'
      title: Muestrear
      items:
      - Columnas de la capa que se va a habilitar
      - Una muestra mínima, sin copiar la tabla completa
    - number: '2'
      title: Detectar candidatos
      items:
      - Identificadores directos por patrón
      - Sensibles por nombre y por contenido
      - Combinaciones que dejan a una sola persona
    - number: '3'
      title: Registrar en el catálogo
      items:
      - Categoría, fundamento y método por hallazgo
      - Lo ya revisado conserva su revisor
      - Un candidato dudoso queda «en revisión», nunca como aprobado
    decide:
      number: '4'
      title: Decidir la habilitación
      outcomes:
      - tone: pass
        text: Todo revisado · se habilita
      - tone: fail
        text: Sensibles o dudosos sin revisor · se bloquea
      - tone: keep
        text: El reporte nunca imprime valores
    note: Servicios como Sensitive Data Protection, Amazon Macie o Microsoft Purview automatizan la detección; ninguno decide la categoría
      jurídica por sí solo.
    example:
      summary: Ver ejemplo con el código de la ficha
      steps:
      - title: '@paso 1 · Reglas'
        items:
        - text: Dígito verificador por módulo 11
        - text: Nombres de columna que revelan salud, situación socioeconómica, creencias religiosas o biometría (art. 2 letra g)
        - text: Diccionario mínimo de términos de salud
        - text: 'Cuasi identificadores: comuna y edad'
      - title: '@paso 2 · Detección'
        items:
        - text: RUT y correos, también en texto libre
          code: identificadores_directos
        - text: Sensibles por el nombre de la columna
          code: sensibles_por_nombre
        - text: Sensibles en el contenido
          code: sensibles_en_contenido
        - text: Combinación única de atributos
          code: identificacion_indirecta
      - title: '@paso 3 · Catálogo'
        items:
        - text: Una entrada por hallazgo
          code: registrar
        - text: Columna, categoría, fundamento, método, fecha y revisor
        - text: Sin revisión, el revisor queda «pendiente»
      - title: '@paso 4 · Puerta'
        items:
        - text: Bloquea si hay sensibles o dudosos sin revisor
          code: puerta
        - text: 'Salida 0: la CI habilita'
        - text: 'Salida 1: la CI bloquea'
        - text: '3 escenarios: 1 habilita y 2 bloquean'
      note: Cubre 5 de los 7 tipos de columna de la tabla «Tipo de columna»; las claves internas y las columnas sin señal propia se clasifican por conocimiento
        del dominio.
      code_link:
        label: Ver código ↓
        href: '#s10'
  code_guide:
    lead:
      title: Qué hace
      text: Revisa una muestra de columnas en cuatro frentes, registra cada hallazgo en el catálogo y bloquea la capa mientras haya candidatos
        sensibles o dudosos sin revisor. Si bloquea, la CI sale con 1; si habilita, con 0. El reporte nunca imprime valores.
    rules:
      headers:
      - Frente
      - Función
      - Tipo de columna de §3
      - Qué encuentra en la muestra
      items:
      - rule: Identificadores directos
        fn: identificadores_directos
        requirement: Identificador directo · Valor malformado · Texto libre
        finds: RUT válidos, uno con DV inválido (queda en revisión) y correos, también dentro del texto libre
      - rule: Sensibles por nombre
        fn: sensibles_por_nombre
        requirement: Atributo que revela una categoría sensible
        finds: '`diagnostico` (salud) y `tramo_ingreso` (situación socioeconómica); compara por token, así que `fecha_ingreso` no calza'
      - rule: Sensibles en el contenido
        fn: sensibles_en_contenido
        requirement: Texto libre
        finds: «licencia médica» en `comentarios`
      - rule: Identificación indirecta
        fn: identificacion_indirecta
        requirement: Combinación de atributos
        finds: '`comuna` + `edad`: combinación única en 2 de 4 filas'
    not_covered:
      title: Qué no cubre
      intro: 'Cubre 5 de los 7 tipos de columna de la tabla «Tipo de columna». Los otros dos no se detectan con patrones:'
      items:
      - title: 'Clave interna enlazable:'
        text: un `cliente_id` parece un código cualquiera; es personal porque se puede enlazar con la tabla de clientes, y eso solo lo sabe quien
          conoce el dominio.
      - title: 'Sin señal propia:'
        text: '`fecha_ingreso` o `producto` no dicen nada por sí solas; son personales por estar en la misma fila que un RUT [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
          Por eso el reporte las lista como «sin hallazgos (no significa anónimo)».'
      note: 'Tampoco responde la pregunta 4 del árbol de decisión: la edad del titular no se infiere de la muestra.'
    scenarios:
      title: Escenarios
      items:
      - name: muestra
        text: 'candidatos sin revisor: la puerta bloquea y dice cuáles'
        exit_code: 1
      - name: revisado
        text: 'los mismos candidatos, ya revisados: la puerta habilita'
        exit_code: 0
      - name: fuente-nueva
        text: 'aparece `observacion_medica`, sensible por nombre y contenido, sin revisor: vuelve a bloquear'
        exit_code: 1
    simplifies:
      title: Qué simplifica
      items:
      - title: 'RUT:'
        text: valida la forma y el dígito verificador, no que exista ni a quién pertenece.
      - title: 'Correo:'
        text: reconoce el formato, no que la dirección exista.
      - title: 'Sensibles:'
        text: un diccionario mínimo; un término ausente no se detecta.
      - title: 'Combinaciones:'
        text: solo prueba la declarada (comuna + edad), no otras ni relaciones entre tablas.
      - title: 'Muestra:'
        text: con 4 filas casi toda combinación parece única; en producción se usan muestras más grandes y minimizadas.
    limit:
      title: Límite.
      text: Es un ejemplo didáctico. Produce candidatos para revisión humana; no declara que una columna sea legalmente sensible, y una puerta
        habilitada no demuestra que el tratamiento sea lícito.
  cloud_compare:
    title: Detectores en la nube, por frente del código
    intro: Los cuatro frentes del detector, comparados con lo que ofrece cada servicio. El RUT está cubierto en las tres nubes y el
      correo en dos; los sensibles y las combinaciones, de forma desigual.
    alert:
      title: Ojo
      text: 'Ningún detector administrado sabe por sí solo que tu `cliente_id` enlaza con la tabla de clientes, y ninguno de los tres trae un
        detector de situación socioeconómica. Se les puede enseñar con reglas personalizadas, pero alguien tiene que definirlas: el criterio propio
        y la revisión siguen siendo necesarios.'
    headers:
    - Necesidad
    - Este ejemplo
    - GCP
    - AWS
    - Azure
    rows:
    - need: RUT o cédula chilena
      meta: Identificadores directos
      own:
        text: Forma y dígito verificador por módulo 11
      gcp:
        name: '[Sensitive Data Protection](https://docs.cloud.google.com/sensitive-data-protection/docs/infotypes-reference) · `CHILE_CDI_NUMBER`'
        text: Categorías GOVERNMENT_ID, PII y SPII; sensibilidad alta. La documentación no dice si valida el dígito verificador.
      aws:
        name: '[Amazon Macie](https://docs.aws.amazon.com/macie/latest/user/mdis-reference-quick.html) · `CHILE_RUT_NUMBER`'
        text: Requiere una palabra clave cerca del valor.
      azure:
        name: '[Purview](https://learn.microsoft.com/en-us/purview/sit-defn-chile-identity-card-number) · Chile identity card number'
        text: Valida el dígito verificador; con palabra clave cerca sube la confianza.
    - need: Correo electrónico
      meta: Identificadores directos
      own:
        text: Formato, también dentro del texto libre
      gcp:
        name: '`EMAIL_ADDRESS`'
        text: Detector global.
      aws:
        name: No figura en la [referencia de identificadores administrados](https://docs.aws.amazon.com/macie/latest/user/mdis-reference-quick.html)
        text: Se crea un identificador personalizado con una expresión regular.
      azure:
        name: '[Email](https://learn.microsoft.com/en-us/purview/data-map-classification-supported-list)'
        text: Según la documentación, no aplica a datos no estructurados.
    - need: Sensible por el nombre de la columna
      meta: Sensibles por nombre
      own:
        text: 'Tokens del nombre: `diagnostico`, `tramo_ingreso`'
      gcp:
        name: Sin equivalente documentado
        text: La documentación de los [perfiles de datos](https://docs.cloud.google.com/sensitive-data-protection/docs/data-profiles) no dice
          que use el nombre de la columna.
      aws:
        name: '[Identificador personalizado](https://docs.aws.amazon.com/macie/latest/user/cdis-options.html)'
        text: La palabra clave puede estar en el nombre de la columna o del campo (CSV, Parquet, JSON, entre otros).
      azure:
        name: '[Clasificación personalizada](https://learn.microsoft.com/en-us/purview/data-map-classification-custom) con patrón de columna'
        text: Una expresión regular sobre el nombre de la columna.
    - need: Sensible en el contenido
      meta: Sensibles en el contenido
      own:
        text: 'Diccionario mínimo: «licencia médica», «diagnóstico»'
      gcp:
        name: '`MEDICAL_TERM`, `ETHNIC_GROUP`, `RELIGIOUS_TERM`, `POLITICAL_TERM`, `SEXUAL_ORIENTATION`, `TRADE_UNION`'
        text: 'Cubren varias categorías del art. 2 letra g. La documentación no indica su cobertura en español: conviene probarlos con una muestra
          propia.'
      aws:
        name: Sin identificadores administrados para términos
        text: Los de salud detectan números de seguros o registros de EE. UU., Canadá y Europa, no palabras como «diagnóstico». Para términos
          se crea un identificador personalizado.
      azure:
        name: Sin clasificación de sistema para salud o religión
        text: 'Se crea una clasificación personalizada. Las reglas personalizadas solo se documentan en inglés: un término en español hay que
          probarlo, no darlo por cubierto.'
    - need: Combinación de atributos
      meta: Identificación indirecta
      own:
        text: Combinación única de `comuna` + `edad` en la muestra
      gcp:
        name: '[Análisis de riesgo](https://docs.cloud.google.com/sensitive-data-protection/docs/concepts-risk-analysis)'
        text: k-anonimato, l-diversidad, k-map y δ-presencia.
      aws:
        name: Sin equivalente en Macie
        text: 'Su documentación no incluye análisis de reidentificación: se calcula con código propio, por ejemplo k-anonimato con un `GROUP BY`.'
      azure:
        name: Sin equivalente en Purview Data Map
        text: 'Igual que en AWS: se calcula con código propio.'
    - need: Dónde busca
      tone: where
      own:
        text: La muestra que recibe en la CI
      gcp:
        name: Perfiles de BigQuery, Cloud SQL y Cloud Storage; también Amazon S3 y Azure Blob Storage
      aws:
        name: Buckets de S3
      azure:
        name: Orígenes escaneados por Purview Data Map
  practice_pairs:
    start:
      title: Por dónde empezar
      text: Activos con datos de clientes, trabajadores, pacientes o menores de edad, y columnas de texto libre.
    labels:
      do: Hacer
      avoid: Evitar
    items:
    - do: Clasificar por contenido, contexto y nombre de columna.
      avoid: Clasificar solo por el nombre de la columna.
    - do: Comparar nombres por token, con reglas de varios tokens (`tramo` + `ingreso`).
      avoid: 'Comparar por subcadena: «renta» calza en `rentabilidad_producto`.'
    - do: Analizar si una clave interna o un hash permite volver a la persona [(art. 2 letra l)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
      avoid: Tratar `cliente_id` o un hash como no personal sin analizarlo.
    - do: Usar las categorías sensibles de la ley chilena, que incluyen la situación socioeconómica [(art. 2 letra g)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2).
      avoid: 'Copiar la lista de datos sensibles del RGPD (art. 9): no incluye la situación socioeconómica.'
    - do: Dejar en revisión un RUT con dígito verificador inválido.
      avoid: 'Descartarlo: un error de captura puede seguir apuntando a una persona.'
    - do: Usar el conteo de coincidencias para priorizar la revisión.
      avoid: 'Concluir que una columna no es personal porque pocas filas calzan: un solo RUT ya identifica a alguien.'
    - do: Reanalizar ante cambios de esquema, fuentes nuevas y texto libre.
      avoid: Clasificar una vez y no volver a escanear.
    - do: 'Tratar las muestras como datos personales: mínimas, con acceso restringido y borradas al terminar.'
      avoid: Imprimir valores en los logs o reportes del detector.
  trade_offs:
    resolution_label: Se resuelve con
    items:
    - a: Cobertura
      a_text: Escanear todo encuentra los casos raros.
      b: Costo
      b_text: El volumen crece con cada capa y cada copia.
      resolution: escaneo completo donde hay más riesgo (texto libre, datos de clientes y pacientes) y selectivo en el resto.
    - a: Precisión
      a_text: Reglas estrictas generan menos alertas falsas.
      b: Sensibilidad
      b_text: Reglas amplias omiten menos casos reales.
      resolution: 'ajustar por categoría: más sensibilidad para salud y menores, más precisión para el resto.'
    - a: Automatización
      a_text: Los detectores escalan a miles de columnas.
      b: Revisión humana
      b_text: Las personas resuelven lo ambiguo y mantienen las reglas.
      resolution: automatizar la detección y reservar la revisión para lo sensible y lo dudoso.
    - a: Detector propio
      a_text: Entiende formatos locales y tu dominio.
      b: Detector de la nube
      b_text: Escala y cubre muchos tipos de datos.
      resolution: 'usar los dos: la nube para lo general y el propio para el RUT, las claves internas y las reglas del art. 2 letra g).'
  open_questions:
    intro: Si no sabes responder una, el enlace indica en qué parte de la ficha se trabaja.
    items:
    - question: Ante una fuente nueva, ¿qué columnas son identificadores indirectos, texto libre o datos sin señal propia en la misma fila que
        un identificador?
      tags:
      - section: 3
        label: Problema que resuelve
        href: '#s3'
    - question: ¿Qué columnas se pueden enlazar con una tabla que identifica a la persona?
      tags:
      - section: 4
        label: Evaluar el contexto
        href: '#s4'
    - question: ¿Tu lista de categorías sensibles incluye la situación socioeconómica, o la copiaste del RGPD o de una herramienta?
      tags:
      - section: 2
        label: Qué protege la ley
        href: '#s2'
      - section: 14
        label: Hacer y evitar
        href: '#s14'
    - question: ¿Qué casos locales se le escapan a tu detector, como un RUT sin una palabra clave cerca o con dígito verificador inválido?
      tags:
      - section: 10
        label: Código
        href: '#s10'
      - section: 11
        label: En la nube
        href: '#s11'
    - question: ¿Tratas datos de niños, niñas o adolescentes, y cómo lo sabes?
      tags:
      - section: 2
        label: Pregunta 4
        href: '#s2'
      - label: art. 16 quáter
        legal: true
        href: https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=13
    - question: ¿Quién confirma los casos dudosos y dónde queda esa decisión?
      tags:
      - section: 4
        label: Clasificar y revisar
        href: '#s4'
    - question: ¿Qué pasa con la clasificación cuando cambia el esquema o llega una fuente nueva?
      tags:
      - section: 4
        label: Mantener
        href: '#s4'
      - section: 10
        label: Escenario fuente-nueva
        href: '#s10'
    - question: ¿Dónde quedan las muestras que usa tu detector, quién accede a ellas, y sus logs exponen valores?
      tags:
      - section: 14
        label: Hacer y evitar
        href: '#s14'
  sources_grouped:
    heading: Fuentes
    link_titles: true
    groups:
    - title: Normativa chilena
      layout: list
      sources:
      - title: Ley 21.719 · Diario Oficial, 2024-12-13
        urls:
        - https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf
        publisher: Diario Oficial
        why: Art. 2 letras f, g, i, k y l; art. 14 quinquies; art. 16; art. 16 quáter. Rigen desde el 2026-12-01.
      - title: Ley 19.628 · texto que rige desde el 2026-12-01
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
        publisher: BCN
        why: Texto consolidado, versión con vigencia diferida.
    - title: Referencias de comparación
      layout: list
      sources:
      - title: Reglamento (UE) 2016/679 (RGPD)
        urls:
        - https://eur-lex.europa.eu/eli/reg/2016/679/oj
        publisher: EUR-Lex
        why: 'Art. 9: categorías especiales; no incluye la situación socioeconómica.'
      - title: CIE-10 · J45 Asma
        urls:
        - https://icd.who.int/browse10/2019/en#/J45
        publisher: OMS
        why: Código del ejemplo `diagnostico`.
    - title: Servicios cloud · consultados el 2026-11-12
      layout: list
      sources:
      - title: InfoType detector reference
        urls:
        - https://docs.cloud.google.com/sensitive-data-protection/docs/infotypes-reference
        publisher: Google Cloud
        why: CHILE_CDI_NUMBER, EMAIL_ADDRESS y detectores de salud, origen étnico, religión, política, orientación sexual y sindicatos.
      - title: Sensitive data discovery
        urls:
        - https://docs.cloud.google.com/sensitive-data-protection/docs/data-profiles
        publisher: Google Cloud
        why: Perfiles de BigQuery, Cloud SQL y Cloud Storage; también Amazon S3 y Azure Blob Storage.
      - title: Re-identification risk analysis
        urls:
        - https://docs.cloud.google.com/sensitive-data-protection/docs/concepts-risk-analysis
        publisher: Google Cloud
        why: k-anonimato, l-diversidad, k-map y δ-presencia.
      - title: Managed data identifiers by type
        urls:
        - https://docs.aws.amazon.com/macie/latest/user/mdis-reference-quick.html
        publisher: AWS
        why: CHILE_RUT_NUMBER en Amazon Macie; no incluye correo electrónico.
      - title: Configuration options for custom data identifiers
        urls:
        - https://docs.aws.amazon.com/macie/latest/user/cdis-options.html
        publisher: AWS
        why: Expresión regular, palabras clave y nombre de columna como palabra clave.
      - title: Chile identity card number
        urls:
        - https://learn.microsoft.com/en-us/purview/sit-defn-chile-identity-card-number
        publisher: Microsoft
        why: Tipo de información sensible de Purview; valida el dígito verificador.
      - title: System classifications supported in Data Map
        urls:
        - https://learn.microsoft.com/en-us/purview/data-map-classification-supported-list
        publisher: Microsoft
        why: Clasificación Email; sin clasificaciones de salud o religión.
      - title: Custom classifications in Data Map
        urls:
        - https://learn.microsoft.com/en-us/purview/data-map-classification-custom
        publisher: Microsoft
        why: Patrón de columna; reglas personalizadas documentadas solo en inglés.
    - title: En esta plataforma
      layout: list
      sources:
      - title: Ley 21.719 para ingenieros de datos
        page: chile-data-protection
        label: Ficha madre
        why: Principios, matriz de control y sanciones.
      - title: Seudonimización de identificadores chilenos
        page: chilean-identifier-pseudonymization
        label: Ficha
        why: Qué hacer con el RUT detectado.
      - title: Minimización por capa
        page: data-minimization-by-layer
        label: Ficha
        why: Qué columnas pasan de capa.
      - title: Controles de privacidad como código
        page: privacy-controls-as-code
        label: Ficha
        why: Cómo la clasificación se vuelve un control en la CI.
created_at: 2026-10-21
updated_at: '2026-11-14'
last_verified: '2026-11-12'
owner_approved_at: 2026-11-14
verification_status: verified
availability: available
---

## 1. Resumen

Esta ficha no es asesoría legal: cubre la parte técnica de identificar datos personales y sensibles.

### Saber qué columnas tienen datos personales, cuáles son sensibles y con qué fundamento

**Identificar** es encontrar las columnas con información vinculada o referida a una persona identificada o identificable [(art. 2 letra f)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=2), aunque no la nombren: claves internas, texto libre y combinaciones de atributos también cuentan. **Clasificar** es dejar esa conclusión en el catálogo, con su fundamento, para que otros puedan revisarla y aplicar los controles que corresponden.

<!-- view: catalog_fields -->

<!-- view: note catalogo -->

<!-- view: chips ficha-madre -->

## 2. Qué es

### Qué protege la ley

<!-- view: concept_map -->

<!-- view: decision_tree -->

<!-- view: note categoria-riesgo -->

## 3. Problema que resuelve

### Las nueve columnas de la muestra son personales; un detector de patrones ve tres

<!-- view: coverage_strip -->

<!-- view: column_types -->

<!-- view: note categoria-preliminar -->

<!-- view: note riesgo -->

## 4. Cómo funciona

### Seis pasos, cada uno deja evidencia

<!-- view: evidence_steps -->

<!-- view: note umbral -->

<!-- view: chips conexiones -->

## 5. Cuándo utilizarlo

### Cada vez que cambia lo que entra o lo que sale

<!-- view: use_avoid -->

## 10. Código

### Detector con puerta de habilitación

<!-- view: control_evidence -->

```python
# Python 3.12+, biblioteca estándar. De punta a punta: muestra de columnas → detección en cuatro frentes →
# clasificación → registro en el catálogo → puerta de habilitación → código de salida (0 habilita, 1 bloquea).
# Uso: python detector.py muestra | revisado | fuente-nueva. Didáctico: produce candidatos para revisión humana, no
# declara que una columna sea legalmente sensible. El reporte nunca imprime valores, solo columna, método y conteos.
import re
import sys
import unicodedata
from dataclasses import dataclass, replace
from datetime import date
from typing import Literal

# @paso 1 Reglas
Categoria = Literal["personal", "sensible", "revisión"]
EstadoRut = Literal["valido", "dv_invalido", "no_rut"]
REFERENCIA = date(2026, 11, 3)   # fecha fija: resultado reproducible
CAPA = "silver.clientes"         # la capa que se va a habilitar para consumo
PERSONAL = "art. 2 f)"           # dato personal: persona identificada o identificable
SALUD, SOCIOECONOMICA = "datos relativos a la salud", "situación socioeconómica"
REGLAS_NOMBRE: list[tuple[frozenset[str], str]] = [   # tokens que deben estar todos en el nombre -> categoría art. 2 g)
    (frozenset({"diagnostico"}), SALUD), (frozenset({"medica"}), SALUD), (frozenset({"salud"}), SALUD),
    (frozenset({"tramo", "ingreso"}), SOCIOECONOMICA), (frozenset({"ingresos"}), SOCIOECONOMICA),
    (frozenset({"renta"}), SOCIOECONOMICA), (frozenset({"sueldo"}), SOCIOECONOMICA),
    (frozenset({"religion"}), "creencias religiosas"), (frozenset({"huella"}), "datos biométricos"),
]
TERMINOS = {SALUD: ("diagnóstico", "licencia médica")}   # diccionario mínimo por categoría del art. 2 g)
CUASI_IDENTIFICADORES = ("comuna", "edad")


def dv(cuerpo: str) -> str:
    """Dígito verificador del RUT: módulo 11 con factores 2 a 7."""
    suma = sum(int(d) * f for d, f in zip(reversed(cuerpo), [2, 3, 4, 5, 6, 7] * 2))
    resto = 11 - suma % 11
    return {11: "0", 10: "K"}.get(resto, str(resto))


RUT = re.compile(r"(\d{1,2})\.?(\d{3})\.?(\d{3})-?([\dK])")   # 11.111.111-1 o 111111111; una fecha no calza


def clasificar_rut(valor: str) -> EstadoRut:
    m = RUT.fullmatch(valor.strip().upper())
    if m is None:
        return "no_rut"
    if dv("".join(m.groups()[:3])) == m.group(4):
        return "valido"
    return "dv_invalido"


def ficticio(numero: int) -> str:
    """RUT ficticio de dígitos repetidos, con su DV calculado (no usar RUT reales en ejemplos)."""
    return f"{numero:,}".replace(",", ".") + "-" + dv(str(numero))


def con_dv_alterado(rut: str) -> str:
    """El mismo RUT con otro dígito verificador: forma de RUT, DV inválido."""
    otro = "1" if rut[-1] != "1" else "2"
    return rut[:-1] + otro


def es_correo(valor: str) -> bool:
    return re.search(r"[^@\s]+@[^@\s]+\.[a-z]{2,}", valor, re.I) is not None   # también dentro de texto libre


def sin_tildes(texto: str) -> str:
    return unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()


# @paso 2 Detección
@dataclass(frozen=True)
class Hallazgo:
    columna: str
    categoria: Categoria
    fundamento: str
    metodo: str


def identificadores_directos(columna: str, valores: list[str]) -> list[Hallazgo]:
    """RUT (válido o con DV inválido) y correo, también dentro del texto libre."""
    hallazgos = []
    estados = [clasificar_rut(v) for v in valores]
    if validos := estados.count("valido"):
        hallazgos.append(Hallazgo(columna, "personal", PERSONAL, f"RUT con DV válido ({validos} de {len(valores)})"))
    if invalidos := estados.count("dv_invalido"):
        hallazgos.append(Hallazgo(columna, "revisión", PERSONAL,
                                  f"forma de RUT con DV inválido ({invalidos} de {len(valores)})"))
    if correos := sum(map(es_correo, valores)):
        hallazgos.append(Hallazgo(columna, "personal", PERSONAL, f"correo en el valor ({correos} de {len(valores)})"))
    return hallazgos


def sensibles_por_nombre(columna: str) -> list[Hallazgo]:
    """Compara por token (split por «_»): fecha_ingreso no es socioeconómica; tramo_ingreso sí."""
    tokens = set(sin_tildes(columna).split("_"))
    return [Hallazgo(columna, "sensible", f"art. 2 g), {categoria}", f"nombre de columna ({', '.join(sorted(regla))})")
            for regla, categoria in REGLAS_NOMBRE if regla <= tokens]


def sensibles_en_contenido(columna: str, valores: list[str]) -> list[Hallazgo]:
    """Términos del diccionario mínimo por categoría, buscados en el texto libre."""
    hallazgos = []
    for categoria, terminos in TERMINOS.items():
        calzan = sum(1 for v in valores if any(sin_tildes(t) in sin_tildes(v) for t in terminos))
        if calzan:
            hallazgos.append(Hallazgo(columna, "sensible", f"art. 2 g), {categoria}",
                                      f"términos en el texto ({calzan} de {len(valores)})"))
    return hallazgos


def identificacion_indirecta(muestra: dict[str, list[str]]) -> list[Hallazgo]:
    """Combinaciones únicas de cuasi-identificadores: una fila única puede identificar a alguien (art. 2 f)."""
    if not all(c in muestra for c in CUASI_IDENTIFICADORES):
        return []
    filas = list(zip(*(muestra[c] for c in CUASI_IDENTIFICADORES)))
    unicas = sum(1 for f in filas if filas.count(f) == 1)
    if not unicas:
        return []
    return [Hallazgo(" + ".join(CUASI_IDENTIFICADORES), "revisión", PERSONAL,
                     f"combinación única en {unicas} de {len(filas)} filas")]


def detectar(muestra: dict[str, list[str]]) -> list[Hallazgo]:
    hallazgos = []
    for columna, valores in muestra.items():
        hallazgos += identificadores_directos(columna, valores)
        hallazgos += sensibles_por_nombre(columna)
        hallazgos += sensibles_en_contenido(columna, valores)
    return hallazgos + identificacion_indirecta(muestra)


# @paso 3 Catálogo
@dataclass(frozen=True)
class Entrada:
    columna: str
    categoria: Categoria
    fundamento: str
    metodo: str
    fecha: date = REFERENCIA
    revisor: str = "pendiente"


def registrar(hallazgos: list[Hallazgo], revisados: dict[tuple[str, str], str]) -> list[Entrada]:
    """Una entrada por hallazgo; conserva el revisor de lo que ya se revisó (misma columna y método)."""
    catalogo = []
    for h in hallazgos:
        entrada = Entrada(h.columna, h.categoria, h.fundamento, h.metodo)
        if revisor := revisados.get((h.columna, h.metodo)):
            entrada = replace(entrada, revisor=revisor)
        catalogo.append(entrada)
    return catalogo


# @paso 4 Puerta y reporte
def puerta(catalogo: list[Entrada]) -> list[str]:
    """Bloquea la capa si un candidato sensible o de revisión no tiene revisor."""
    pendientes = [f"{e.columna} ({e.categoria})" for e in catalogo
                  if e.categoria != "personal" and e.revisor == "pendiente"]
    return list(dict.fromkeys(pendientes))   # una vez por columna y categoría


def etiqueta(e: Entrada) -> str:
    if e.categoria == "revisión":
        return "revisión personal"
    return e.categoria


MUESTRA = {   # cuatro filas ficticias: RUT de dígitos repetidos y correos en example.test
    "rut_cliente": [ficticio(11_111_111), ficticio(22_222_222).replace(".", "").replace("-", ""),
                    con_dv_alterado(ficticio(33_333_333)), "sin dato"],
    "contacto": ["ana@example.test", "sin correo", "bruno@example.test", ""],
    "comentarios": ["Cliente pide cambio de fecha", "Avisar a luis@example.test", "Presenta licencia médica", ""],
    "diagnostico": ["J45", "E11", "", "J45"],
    "tramo_ingreso": ["A", "B", "A", "C"],
    "fecha_ingreso": ["2026-01-10", "2026-03-02", "2026-03-02", "2026-05-20"],
    "comuna": ["Ñuñoa", "Ñuñoa", "Maipú", "Ñuñoa"],
    "edad": ["34", "34", "51", "29"],
    "producto": ["Notebook", "Monitor", "Notebook", "Teclado"],
}
NUEVA = {"observacion_medica": ["Control por licencia médica", "", "Diagnóstico pendiente", ""]}


def main(escenario: str) -> int:
    revisados = {(h.columna, h.metodo): "equipo-privacidad" for h in detectar(MUESTRA)}
    muestras = {"muestra": (MUESTRA, {}), "revisado": (MUESTRA, revisados),
                "fuente-nueva": ({**MUESTRA, **NUEVA}, revisados)}
    muestra, previos = muestras[escenario]
    catalogo = registrar(detectar(muestra), previos)
    print(f"catálogo de {CAPA} · {len(next(iter(muestra.values())))} filas · referencia {REFERENCIA}")
    for e in catalogo:
        print(f"  {e.columna}: {etiqueta(e)}: {e.metodo} · {e.fundamento} · revisor: {e.revisor}")
    cubiertas = {c for e in catalogo for c in e.columna.split(" + ")}
    print(f"sin hallazgos (no significa anónimo): {[c for c in muestra if c not in cubiertas]}")
    bloqueos = puerta(catalogo)
    if bloqueos:
        print(f"puerta de {CAPA}: bloqueada (1), sin revisor: {', '.join(bloqueos)}")
        return 1
    print(f"puerta de {CAPA}: habilitada (0)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "muestra"))
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`.

```text
$ python detector.py muestra
catálogo de silver.clientes · 4 filas · referencia 2026-11-03
  rut_cliente: personal: RUT con DV válido (2 de 4) · art. 2 f) · revisor: pendiente
  rut_cliente: revisión personal: forma de RUT con DV inválido (1 de 4) · art. 2 f) · revisor: pendiente
  contacto: personal: correo en el valor (2 de 4) · art. 2 f) · revisor: pendiente
  comentarios: personal: correo en el valor (1 de 4) · art. 2 f) · revisor: pendiente
  comentarios: sensible: términos en el texto (1 de 4) · art. 2 g), datos relativos a la salud · revisor: pendiente
  diagnostico: sensible: nombre de columna (diagnostico) · art. 2 g), datos relativos a la salud · revisor: pendiente
  tramo_ingreso: sensible: nombre de columna (ingreso, tramo) · art. 2 g), situación socioeconómica · revisor: pendiente
  comuna + edad: revisión personal: combinación única en 2 de 4 filas · art. 2 f) · revisor: pendiente
sin hallazgos (no significa anónimo): ['fecha_ingreso', 'producto']
puerta de silver.clientes: bloqueada (1), sin revisor: rut_cliente (revisión), comentarios (sensible), diagnostico (sensible), tramo_ingreso (sensible), comuna + edad (revisión)
```

```text
$ python detector.py revisado
catálogo de silver.clientes · 4 filas · referencia 2026-11-03
  rut_cliente: personal: RUT con DV válido (2 de 4) · art. 2 f) · revisor: equipo-privacidad
  rut_cliente: revisión personal: forma de RUT con DV inválido (1 de 4) · art. 2 f) · revisor: equipo-privacidad
  contacto: personal: correo en el valor (2 de 4) · art. 2 f) · revisor: equipo-privacidad
  comentarios: personal: correo en el valor (1 de 4) · art. 2 f) · revisor: equipo-privacidad
  comentarios: sensible: términos en el texto (1 de 4) · art. 2 g), datos relativos a la salud · revisor: equipo-privacidad
  diagnostico: sensible: nombre de columna (diagnostico) · art. 2 g), datos relativos a la salud · revisor: equipo-privacidad
  tramo_ingreso: sensible: nombre de columna (ingreso, tramo) · art. 2 g), situación socioeconómica · revisor: equipo-privacidad
  comuna + edad: revisión personal: combinación única en 2 de 4 filas · art. 2 f) · revisor: equipo-privacidad
sin hallazgos (no significa anónimo): ['fecha_ingreso', 'producto']
puerta de silver.clientes: habilitada (0)
```

```text
$ python detector.py fuente-nueva
catálogo de silver.clientes · 4 filas · referencia 2026-11-03
  rut_cliente: personal: RUT con DV válido (2 de 4) · art. 2 f) · revisor: equipo-privacidad
  rut_cliente: revisión personal: forma de RUT con DV inválido (1 de 4) · art. 2 f) · revisor: equipo-privacidad
  contacto: personal: correo en el valor (2 de 4) · art. 2 f) · revisor: equipo-privacidad
  comentarios: personal: correo en el valor (1 de 4) · art. 2 f) · revisor: equipo-privacidad
  comentarios: sensible: términos en el texto (1 de 4) · art. 2 g), datos relativos a la salud · revisor: equipo-privacidad
  diagnostico: sensible: nombre de columna (diagnostico) · art. 2 g), datos relativos a la salud · revisor: equipo-privacidad
  tramo_ingreso: sensible: nombre de columna (ingreso, tramo) · art. 2 g), situación socioeconómica · revisor: equipo-privacidad
  observacion_medica: sensible: nombre de columna (medica) · art. 2 g), datos relativos a la salud · revisor: pendiente
  observacion_medica: sensible: términos en el texto (2 de 4) · art. 2 g), datos relativos a la salud · revisor: pendiente
  comuna + edad: revisión personal: combinación única en 2 de 4 filas · art. 2 f) · revisor: equipo-privacidad
sin hallazgos (no significa anónimo): ['fecha_ingreso', 'producto']
puerta de silver.clientes: bloqueada (1), sin revisor: observacion_medica (sensible)
```

<!-- view: code_guide -->

## 11. GCP

### Detectores en la nube, por frente del código

<!-- view: cloud_compare -->

<!-- view: note equivalencias -->

## 14. Buenas prácticas

### Ocho decisiones que separan una clasificación confiable de una que no lo es

<!-- view: practice_pairs -->

## 16. Trade-offs

### Cuatro equilibrios al diseñar el detector

<!-- view: trade_offs -->

## 18. Preguntas técnicas abiertas

### Respóndelas para tu plataforma

<!-- view: open_questions -->

## 20. Fuentes

### Fuentes

## 22. Historial de cambios importantes

- 2026-10-21: creación (lote F3b-19a).
- 2026-10-22: upgrade de 19: pasa a ser ficha hija de `chile-data-protection`; relaciones con `chilean-identifier-pseudonymization`, `privacy-controls-as-code` y `data-breach-response`. Sin cambios de contenido legal ni de código.
- 2026-10-24: `PART_OF` hacia `chile-data-protection` (ADR-024) e `implication` por artículo en `legal_basis` (enmienda de ADR-023). Sin cambios de contenido legal ni de código.
- 2026-10-25: revisión del upgrade (`docs/reviews/cards-f3b-19-upgrade.md`) y auditoría de las etiquetas «Obligación legal»: cada una afirma solo lo que dice su artículo; lo demás pasa a buena práctica o decisión de arquitectura. Textos de BCN y del Senado consultados el 2026-10-25, sin cambios desde el 2026-10-22.
- 2026-10-27: mejora de contenido con tres niveles de lectura: §1 (definición de identificar y resultado esperado), §2 (art. 2 g) citado tal cual desde BCN, identificador directo e indirecto, dato seudonimizado, etiqueta técnica frente a categoría jurídica), §3 (caso de cinco columnas), §4 (seis pasos; se quita el umbral del 60 %), §5, §6, §7, §8 (escenario por capas y evidencia sin valores personales), §9 (cadena fuente → políticas), §10 (detector con varios hallazgos por columna, sin umbral ni valores en el reporte, con limitaciones), §11–13 (páginas consultadas el 2026-10-27 y criterio de selección), §14–16, §17 (nota editorial), §18 y §19 (laboratorio para F4). Sin cambios en `legal_basis`, aviso ni vigencia.
- 2026-10-27: se revierte un `verified` registrado por error: no hubo aprobación (el mensaje se refería solo al criterio de los RUT ficticios). Sigue en `review_required`, sin `owner_approved_at`.
- 2026-10-27: revisión `docs/reviews/pii-v2.md` aplicada: la etiqueta **[Obligación legal · art. 2]** del §2 dice solo lo del art. 2 f); la combinación de columnas queda en la buena práctica del identificador indirecto.
- 2026-10-28: pasa al dominio 24-privacy-engineering, tramo `fundamentos` (ADR-027), desde 19-compliance; sin cambios de contenido. La URL de la ficha (`/concepts/pii-identification/`) no cambia.
- 2026-10-30: Enmienda 3 de ADR-023: en §11, §12, §13, la tabla con la misma etiqueta en todas sus filas pasa a la línea «Etiqueta: […]» antes de la tabla, sin columna. Sin cambios de contenido.
- 2026-10-30: Enmienda 4 de ADR-023: 3 tabla(s) sin columna ni línea «Etiqueta»; la fila con origen legal lleva «Obligación legal» al inicio de su primera celda. Sin cambios de contenido.
- 2026-11-01: aprobada con lista explícita (`owner_approved_at: 2026-11-01`); pasa a `verified` (ADR-023).
- 2026-11-03: se quita del resumen «**Cómo leerla.** *Comprender* (§1–6): qué es un dato personal y uno sensible. *Aplicar* (§7–13): cómo se detecta y clasifica. *Demostrar*: la evidencia del §8, el detector del §10 y las preguntas del §18.» y, del §2, la buena práctica «El RUT tiene un dígito verificador (módulo 11) que separa un RUT bien escrito de un número cualquiera; un DV inválido no prueba que el dato no sea personal.»
- 2026-11-03: §10 reescrito de punta a punta: muestra → detección en cuatro frentes (identificadores directos con `clasificar_rut` y correo; sensibles por nombre comparando por token; sensibles en el contenido con un diccionario mínimo; combinación única de `comuna` + `edad`) → catálogo con fundamento, fecha y revisor → puerta con código de salida 0/1; marcadores `# @paso 1–4` y tres escenarios (`muestra`, `revisado`, `fuente-nueva`) con su línea `$ python detector.py <escenario>`, iguales a la salida de la CI. §15 suma el falso positivo por substring y §8 la evidencia de la puerta. Vuelve a `review_required` hasta la aprobación.
- 2026-11-03: aprobada con el §10 nuevo (`owner_approved_at: 2026-11-03`); vuelve a `verified` (ADR-023).
- 2026-11-04: revisión `docs/reviews/p10.md` aplicada: en §15, el ejemplo falso «renta» en `herramienta_id` pasa a `rentabilidad_producto`, que sí contiene la subcadena; un test lo comprueba contra la ficha. Vuelve a `review_required`.
- 2026-11-04: aprobada con la revisión P10 aplicada (`owner_approved_at: 2026-11-04`); vuelve a `verified` (ADR-023).
- 2026-11-12: migrada desde la maqueta aprobada: 11 secciones con su texto tal cual, en vistas (ADR-030, enmienda 5) y con la numeración y el «Leído N de M» del ADR-029 (enmienda 3). Salen las secciones 6, 7, 8, 9, 12, 13, 15, 17, 19 y 21. Citas a los artículos en el texto publicado en el Diario Oficial; servicios cloud consultados el 2026-11-12. §10 con el detector de la maqueta: la CI ejecuta muestra, revisado y fuente-nueva (salidas 1, 0 y 1) y mypy --strict. Vuelve a `review_required`, sin `owner_approved_at`, hasta la revisión.
- 2026-11-14: aprobada con lista explícita (`owner_approved_at: 2026-11-14`) tras la re-revisión de la migración; pasa a `verified` (ADR-023). Se quitan dos copias repetidas de la entrada del 2026-11-12.
- 2026-11-14: los resultados de la puerta (`control_evidence.decide.outcomes`) dejan de empezar con ✓ / ✕: el ícono lo pone el `tone` (CSS) y salía dos veces. Lo que se ve no cambia; el validador rechaza un ícono al inicio de esos textos.
- 2026-11-14: §11 (En la nube) muestra su subtítulo «Detectores en la nube, por frente del código» como `###` del cuerpo: `cloud_compare.title` ya lo tenía, pero `CloudCompare` es compartido y pintarlo agregaría «En la nube» repetido en chile-data-protection.
- 2026-11-15: sin el panel «Base legal» en la lectura (`views.reading.legal_basis_panel: false`; `legal_basis` sigue en el frontmatter). Fuentes con título visible y el título de cada fuente como enlace (ADR-030, enmienda 8). Las 18 referencias en línea «§N · Nombre» se reescriben como texto corrido, sin cambiar el sentido; quedan los chips de §10 y «Ver código ↓».
