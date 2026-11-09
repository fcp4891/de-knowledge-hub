---
id: concept:chile-data-protection
slug: chile-data-protection
type: concept
title: Ley 21.719 para ingenieros de datos
description: "Ficha padre del dominio 24. Qué cambia la Ley 21.719 para quien diseña y opera plataformas de datos: casi todo pipeline es tratamiento y hay que demostrar que cumple. Mapa de artículos de la Ley 19.628 modificada a sus fichas hijas, vigencia y boletín 18.623-07 según BCN y el Senado, Decreto 662, sanciones, seis preguntas de diseño y cuatro controles con PASS, FAIL y UNKNOWN que hacen fallar la CI. No es asesoría legal."
domain: privacy-engineering
subdomain: fundamentos
category: compliance
classification: core
level: intermediate
importance: high
cloud: [agnostic]
technologies: [python]
tags: [compliance, privacy, ley-21719, chile, personal-data]
related_topics: [pii-identification, processing-activities-inventory]
aliases: [compliance-scope-for-data-engineers]
jurisdiction: [CL]
legal_basis:
  - {law: ley-19628, article: "1 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Ámbito territorial, también para responsables o encargados fuera de Chile en los casos que indica.", implication: "También alcanza al encargado fuera de Chile que trata por cuenta de un responsable en Chile y a quien, desde fuera, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento: el inventario de flujos los incluye."}
  - {law: ley-19628, article: "2", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Definiciones.", implication: "Dato personal, sensible, anonimización, seudonimización, perfiles y encargado son las categorías con que se clasifican columnas, datasets y proveedores."}
  - {law: ley-19628, article: "3", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Principios: licitud y lealtad, finalidad, proporcionalidad, calidad, responsabilidad, seguridad, transparencia e información y confidencialidad.", implication: "Cada principio necesita un control y una evidencia."}
  - {law: ley-19628, article: "4", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Derechos del titular; desarrollados en los arts. 5 a 11.", implication: "Seis tipos de solicitud que la plataforma atiende con plazo y evidencia."}
  - {law: ley-19628, article: "8 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Decisiones individuales automatizadas.", implication: "Explicación, intervención humana y revisión en los modelos que deciden."}
  - {law: ley-19628, article: "12", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Consentimiento; el responsable prueba la licitud.", implication: "Las bases de licitud se registran por actividad de tratamiento."}
  - {law: ley-19628, article: "14", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Obligaciones del responsable.", implication: "Acreditar la licitud; suprimir o anonimizar los datos precontractuales."}
  - {law: ley-19628, article: "14 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Secreto o confidencialidad, también de datos públicos organizados o combinados.", implication: "El secreto alcanza a datos públicos que se organizan o combinan."}
  - {law: ley-19628, article: "14 ter", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Información y transparencia.", implication: "La política pública se alimenta del catálogo."}
  - {law: ley-19628, article: "14 quáter", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Protección desde el diseño y por defecto.", implication: "Minimización por defecto: número de datos, extensión del tratamiento, plazo de conservación y accesibilidad."}
  - {law: ley-19628, article: "14 quinquies", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Medidas de seguridad y verificación regular; ante un incidente, si hay controversia judicial o administrativa, el responsable acredita sus medidas.", implication: "Cifrado, seudonimización, resiliencia, restauración y verificación periódica de las medidas."}
  - {law: ley-19628, article: "14 sexies", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Reporte de vulneraciones a la Agencia, registro de esas comunicaciones y aviso a titulares en ciertos casos.", implication: "Dimensionar la vulneración para reportarla, registrar la comunicación y decidir el aviso a los titulares."}
  - {law: ley-19628, article: "15 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Tratamiento por un encargado.", implication: "El encargado cumple secreto y seguridad, reporta las vulneraciones y suprime o devuelve al terminar."}
  - {law: ley-19628, article: "15 ter", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Evaluación de impacto.", implication: "Evaluación de impacto obligatoria en los casos que el artículo enumera."}
  - {law: ley-19628, article: "16", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Datos sensibles; reglas especiales en los arts. 16 bis a 16 sexies.", implication: "Reglas más estrictas por categoría de dato sensible."}
  - {law: ley-19628, article: "27", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Transferencia internacional.", implication: "Región de la nube, proveedores y APIs externas: cada flujo al exterior necesita un mecanismo."}
  - {law: ley-19628, article: "35", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Sanciones.", implication: "Varias infracciones nacen de fallas técnicas."}
sources:
  - source: bcn-leychile
    url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
    accessed: 2026-10-28
    page_title: "Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES"
    note: "Ley 19.628 en la versión «Con Vigencia Diferida por Fecha» desde 2026-12-01 (texto con las modificaciones de la Ley 21.719), consultada el 2026-10-25 y de nuevo el 2026-10-28, sin cambios. Art. 1 bis: se aplica al responsable o mandatario establecido en Chile, al mandatario que trata a nombre de un responsable en Chile y a quien, sin estar en Chile, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento. Art. 2: definiciones, entre ellas f) dato personal, g) sensibles (incluida la situación socioeconómica), k) anonimización, l) seudonimización, v) cesión, w) elaboración de perfiles y x) encargado. Art. 3: principios a) licitud y lealtad (el responsable acredita la licitud) a h) confidencialidad. Arts. 4 a 11: derechos y procedimiento. Art. 8 bis: decisiones automatizadas. Arts. 12 y 13: bases de licitud; el responsable prueba la licitud. Art. 14 a 14 septies: obligaciones, secreto, transparencia, diseño y por defecto, seguridad, vulneraciones y estándares diferenciados. Arts. 15 y 15 bis: cesión y encargo. Art. 15 ter: evaluación de impacto. Arts. 16 a 16 sexies: sensibles, salud, biométricos, niños, niñas y adolescentes, investigación y geolocalización. Arts. 27 y 28: transferencia internacional. Arts. 34 bis a 35: infracciones y sanciones. Art. 49: modelo de prevención voluntario."
  - source: bcn-leychile
    url: https://www.bcn.cl/leychile/navegar?idNorma=1209272
    accessed: 2026-10-28
    page_title: "Ley 21719 REGULA LA PROTECCIÓN Y EL TRATAMIENTO DE LOS DATOS PERSONALES Y CREA LA AGENCIA DE PROTECCIÓN DE DATOS PERSONALES"
    note: "Ley 21.719, publicada en el Diario Oficial el 2024-12-13 (promulgada el 2024-11-25). Su artículo primero transitorio dispone que las modificaciones de sus artículos primero, segundo y tercero permanentes entran en vigencia el día primero del mes vigésimo cuarto posterior a su publicación en el Diario Oficial. BCN muestra para la Ley 19.628 una versión «Con Vigencia Diferida por Fecha» desde el 2026-12-01. Consultado el 2026-10-25 y de nuevo el 2026-10-28, sin cambios."
  - source: senado-tramitacion
    url: https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07
    accessed: 2026-10-28
    page_title: "Boletín 18623-07"
    label: tramitación
    note: "Boletín 18623-07, «Modifica la ley N° 21.719 [...] en el sentido que indica», consultado el 2026-10-28 con el servicio de tramitación del Senado (https://tramitacion.senado.cl/wspublico/tramitacion.php?boletin=18623): ingreso el 2026-09-01 por mensaje; primeros informes de las comisiones de Constitución, Legislación, Justicia y Reglamento y de Hacienda el 2026-10-27; el 2026-10-28, «Discusión general. Aprobado en general y particular a la vez»; urgencia actual: discusión inmediata; etapa: primer trámite constitucional (Senado); subetapa: «Oficio de ley a Cámara Revisora»; estado: en tramitación."
  - source: senado-tramitacion
    url: https://tramitacion.senado.cl/appsenado/index.php?mo=tramitacion&ac=getDocto&iddocto=19307&tipodoc=mensaje_mocion
    accessed: 2026-10-28
    page_title: "Boletín N° 18.623-07"
    label: mensaje
    note: "Mensaje N° 110-374 del 31 de agosto de 2026 (boletín 18.623-07), en el Senado: el numeral 2 del artículo único reemplaza, en el artículo primero transitorio de la Ley 21.719, la frase «día primero del mes vigésimo cuarto posterior a la publicación de esta ley en el Diario Oficial» por «1 de diciembre de 2027»; también aumenta el Consejo Directivo de la Agencia de tres a cinco consejeros y elimina la limitación a empresas de menor tamaño del artículo sexto transitorio. Es un proyecto, no una ley."
  - source: bcn-leychile
    url: https://www.bcn.cl/leychile/navegar?idNorma=1227971
    accessed: 2026-10-28
    page_title: "Decreto 662 APRUEBA REGLAMENTO QUE REGULA LOS REQUISITOS, MODALIDADES Y PROCEDIMIENTOS PARA LA IMPLEMENTACIÓN, CERTIFICACIÓN, REGISTRO Y SUPERVISIÓN DE LOS MODELOS DE PREVENCIÓN DE INFRACCIONES A QUE SE REFIERE EL ARTÍCULO 49 QUE INCORPORA LA LEY N° 21.719 A LA LEY N° 19.628"
    note: "Decreto 662 del Ministerio de Hacienda, promulgado el 2025-06-13 y publicado el 2026-09-09: reglamento de los requisitos, modalidades y procedimientos para implementar, certificar, registrar y supervisar los modelos de prevención de infracciones del art. 49 de la Ley 19.628."
  - source: gcp-sensitive-data-protection-docs
    url: https://docs.cloud.google.com/sensitive-data-protection/docs/sensitive-data-protection-overview
    accessed: 2026-11-07
    page_title: "Sensitive Data Protection overview"
    note: "Sensitive Data Protection overview: ayuda a descubrir, clasificar y desidentificar datos sensibles dentro y fuera de Google Cloud; un caso de uso es escanear y perfilar en forma continua activos de BigQuery, Cloud SQL y Cloud Storage para encontrar datos sensibles sin catalogar."
  - source: gcp-cloud-logging-docs
    url: https://docs.cloud.google.com/logging/docs/audit
    accessed: 2026-11-07
    page_title: "Cloud Audit Logs overview"
    note: "Cloud Audit Logs overview: salvo en BigQuery, los Data Access audit logs están desactivados por defecto porque generan mucho volumen; para registrarlos en otros servicios hay que activarlos en forma explícita."
  - source: aws-macie-docs
    url: https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html
    accessed: 2026-11-07
    page_title: "What is Amazon Macie?"
    note: "What is Amazon Macie?: servicio de seguridad de datos que descubre datos sensibles con machine learning y coincidencia de patrones, da visibilidad de los riesgos y permite protección automatizada; lleva un inventario de los buckets de propósito general de Amazon S3 y evalúa y monitorea su seguridad y control de acceso."
  - source: aws-cloudtrail-docs
    url: https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html
    accessed: 2026-11-07
    page_title: "Logging data events"
    note: "Logging data events (AWS CloudTrail): por defecto, los trails y event data stores no registran data events, que informan las operaciones sobre un recurso o dentro de él; registrarlos tiene cargos adicionales según la página de precios de CloudTrail."
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/data-map-classification
    accessed: 2026-11-07
    page_title: "Data classification in Microsoft Purview Data Map"
    note: "Data classification in Microsoft Purview Data Map: asignar etiquetas o clases lógicas a los activos según su contexto de negocio (número de pasaporte, de licencia, de tarjeta, código SWIFT, nombre de persona); ayuda a entender, buscar y gobernar, y a entender riesgos. Más de 200 clasificaciones de sistema incorporadas y clasificaciones propias; se clasifica automáticamente al escanear o a mano después."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/
    accessed: 2026-11-07
    page_title: "What is Unity Catalog?"
    note: "What is Unity Catalog? (Azure Databricks): herramientas de gobierno de datos e IA; el control de acceso cubre privilegios, políticas basadas en atributos y filtros de fila y de columna; además, auditoría y linaje."
  - source: iso-iec-27701
    url: https://www.iso.org/standard/27701
    accessed: 2026-11-07
    note: "Página oficial de ISO/IEC 27701 (Privacy information management systems). iso.org respondió HTTP 403 a la verificación automática el 2026-11-07: la URL sale del buscador de ISO y el título de la página queda por verificar. Se cita como uno de los marcos que sintetiza el enfoque del Resumen."
  - source: nist-privacy-framework
    url: https://www.nist.gov/privacy-framework
    accessed: 2026-11-07
    page_title: "Privacy Framework"
    note: "Privacy Framework (NIST): herramienta voluntaria, construida con las partes interesadas, para identificar y gestionar riesgos de privacidad. Se cita como uno de los marcos que sintetiza el enfoque del Resumen."
  - source: iso-iec-27001
    url: https://www.iso.org/standard/27001
    accessed: 2026-11-09
    note: "Página oficial de ISO/IEC 27001. iso.org respondió HTTP 403 a la verificación automática el 2026-11-09: título por verificar (Felipe). El enfoque cita las cláusulas 4.2, 6.1.2, 6.1.3, 7.5, 9.1 y 9.2 y los controles A.5.31 y A.5.34 de la edición 2022."
  - source: eur-lex
    url: https://eur-lex.europa.eu/eli/reg/2016/679/oj
    accessed: 2026-11-09
    page_title: "Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation)"
    note: "Legislación comparada, no chilena. El art. 4.2 del RGPD define tratamiento e incluye expresamente la supresión o destrucción; la ficha lo usa solo como referencia comparada en el Resumen."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/column-level-security-intro
    accessed: 2026-11-09
    page_title: "Introduction to column-level access control"
    note: "Control de acceso por columna en BigQuery con policy tags."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/row-level-security-intro
    accessed: 2026-11-09
    page_title: "Introduction to BigQuery row-level security"
    note: "Políticas de acceso por fila: filtros sobre una tabla que determinan qué filas ve cada usuario o grupo autorizado."
  - source: aws-lake-formation-docs
    url: https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html
    accessed: 2026-11-09
    page_title: "Data filtering and cell-level security in Lake Formation"
    note: "Filtros de datos de Lake Formation: seguridad por columna, fila y celda."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/admin/account-settings/audit-log-delivery
    accessed: 2026-11-09
    page_title: "Configure diagnostic log delivery"
    note: "Entrega de los registros de diagnóstico de Azure Databricks a una cuenta de almacenamiento, Event Hubs o Log Analytics (Azure Monitor); hay que activarla en Diagnostic settings y requiere el plan Premium."
relations:
  - {type: RELATED_TO, target: data-classification, note: "Clasificación técnica de datos."}
views:
  central_idea:
    checks_title: El pipeline lo comprueba
    checks:
    - Se ejecuta sin errores
    - Cumple sus controles de calidad
    - Entrega información confiable
    status: 'estado: exitoso'
    risks_title: Y aun así puede
    risks:
    - text: Usar datos para una finalidad no autorizada
      tag: Finalidad
    - text: Recopilar o conservar datos que no son necesarios
      tag: Proporcionalidad
    - text: Exponer datos por accesos, transformaciones o transferencias inadecuadas
      tag: Seguridad
    - text: Mantener copias que impiden rectificar o suprimir
      tag: Derechos
    - text: Carecer de trazabilidad y evidencia suficiente para investigar incidentes o demostrar la eficacia de sus controles.
      tag: Responsabilidad
    closing: Por ello, la Ingeniería de Datos debe incorporar la privacidad como un criterio transversal de diseño y operación, no únicamente como una revisión posterior
      al desarrollo.
  vigencia_timeline:
    items:
    - date: '2024-12-13'
      title: Publicación de la ley
      icon: calendar
      state: past
      detail: Se publica la Ley 21.719, que moderniza la regulación sobre protección de datos personales en Chile.
      links:
      - label: BCN
        href: https://www.bcn.cl/leychile/navegar?idNorma=1209272
    - date: '2026-10-28'
      title: Avance legislativo
      icon: institution
      state: past
      detail: El Senado aprueba la propuesta de postergación y la envía a la Cámara de Diputados.
      links:
      - label: Boletín 18.623-07
        href: https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07
    - date: '2026-12-01'
      title: Entrada en vigencia
      icon: calendar
      state: current
      detail: Fecha establecida por la ley, mientras no se publique una modificación.
      note: Fecha legal indicada
    - date: '2027-12-01'
      title: Postergación propuesta
      icon: calendar
      state: proposed
      detail: Nueva fecha planteada, sujeta a aprobación y publicación como ley.
      note: Proyecto en tramitación
    as_of: 'Estado de la tramitación: 28 de octubre de 2026 · Fuentes: BCN y Senado.'
  treatment_map:
    lead: 'Para la ley, **tratamiento** es cualquier operación que permita recolectar, procesar, almacenar, comunicar, transmitir o utilizar datos personales ([art.
      2 letra o](https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01)). En una plataforma de datos, esos verbos se ven así:'
    law_label:
      title: Ley
      detail: art. 2 letra o
    tech_label:
      title: Ingeniería de datos
      detail: interpretación técnica
    verbs:
    - verb: Recolectar
      practice: Recolección e ingesta
      examples: APIs · CDC · archivos
    - verb: Procesar
      practice: Transformación, integración y consulta
      examples: bronze → gold
    - verb: Almacenar
      practice: Tablas, respaldos y retención
      examples: lakehouse · backups
    - verb: Comunicar
      practice: Exportaciones y entrega a terceros
      examples: archivos · APIs externas
    - verb: Transmitir
      practice: Envíos entre sistemas y réplicas
      examples: 'fuera de Chile: revisar art. 27'
    - verb: Utilizar
      practice: Dashboards, modelos e IA
      examples: reportes · entrenamiento
    conclusion: Por eso, cualquier actividad de un pipeline que toque datos personales es tratamiento.
    note: 'La fila de ingeniería es una interpretación técnica, no texto legal: una misma actividad puede caer en más de un verbo. Borrar también es una operación
      sobre los datos; el RGPD lo incluye expresamente en su definición de tratamiento ([RGPD art. 4.2, referencia comparada](https://eur-lex.europa.eu/eli/reg/2016/679/oj)).'
    sources:
    - title: Ley 21.719
      href: https://www.bcn.cl/leychile/navegar?idNorma=1209272
      detail: Diario Oficial, 2024-12-13 · Legislación · Nivel 1 · art. 2 letra o), definición de tratamiento
    - title: Reglamento (UE) 2016/679 (RGPD)
      href: https://eur-lex.europa.eu/eli/reg/2016/679/oj
      detail: EUR-Lex · Legislación comparada · Nivel 1 · art. 4.2
  approach:
    title: De la normativa a la implementación técnica
    intro: 'La ley establece obligaciones y responsabilidades jurídicas. La Ingeniería de Datos contribuye a su cumplimiento con soluciones técnicas adecuadas al
      contexto, al riesgo y a las decisiones de las áreas responsables. Para estudiar esa relación, es posible utilizar este enfoque:'
    step_label: Paso
    example_label:
      title: Ejemplo
      detail: fila de la matriz
    reference_label:
      title: Referencia
      detail: ISO/IEC 27001:2022
    steps:
    - name: Requisito normativo
      description: Qué exige la ley
      example: 'Minimización: solo los datos necesarios'
      reference: 4.2 · A.5.31 requisitos legales
    - name: Riesgo identificado
      description: Qué puede fallar en la plataforma
      example: Columnas no aprobadas llegan a capas analíticas
      reference: 6.1.2 evaluación de riesgos
    - name: Control técnico
      description: Qué lo previene o detecta
      example: Contrato de campos permitidos
      reference: 6.1.3 · Anexo A tratamiento y controles
    - name: Verificación
      description: Cómo se prueba que funciona
      example: Test de esquema en CI
      reference: 9.1 · 9.2 medición y auditoría
    - name: Evidencia
      description: Qué queda para demostrarlo
      example: Resultado del test y versión del contrato
      reference: 7.5 información documentada
    notes:
    - title: De dónde viene
      text: Es una adaptación propia de la lógica de gestión de riesgos de ISO/IEC 27001, que ISO/IEC 27701 extiende a datos personales, y del NIST Privacy Framework.
    - title: Por qué se ajusta
      text: La ley fija principios y deberes, pero en general no prescribe tecnologías ni arquitecturas; el enfoque convierte cada obligación en un control que un
        pipeline puede ejecutar y probar, y la ficha lo aplica igual en la matriz de control y en el código.
    sources:
    - title: ISO/IEC 27001:2022
      href: https://www.iso.org/standard/27001
      detail: Norma · Nivel 1 · cláusulas 4.2, 6.1.2, 6.1.3, 7.5, 9.1, 9.2; controles A.5.31 y A.5.34
    - title: ISO/IEC 27701
      href: https://www.iso.org/standard/27701
      detail: Norma · Nivel 1 · extensión de privacidad
    - title: NIST Privacy Framework
      href: https://www.nist.gov/privacy-framework
      detail: Marco · Nivel 1
  legal_foundations:
    title: Principios y responsabilidades
    roles:
      caption: Quién decide y quién implementa · modelo organizacional típico, no fijado por la ley
      responsible:
        title: Responsable · la organización
        lead: Decide los fines y medios del tratamiento y responde ante la ley ([art. 2 letra n](https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01)).
        decide:
          kicker: Deciden y evalúan
          items:
          - title: Legal, privacidad y negocio
            text: Definen finalidad, base de licitud y plazos.
          - title: Privacidad
            text: Evalúa el riesgo para los titulares.
          - title: Seguridad
            text: Evalúa el riesgo de seguridad y define las medidas de protección.
        build:
          kicker: Implementa
          items:
          - title: Ingeniería de Datos
            text: Implementa controles, automatización, trazabilidad y evidencia. No decide la finalidad ni la base; reporta las implicancias técnicas y sus limitaciones.
      processor:
        title: Encargado · fuera de la organización
        text: 'Proveedor que trata datos por cuenta del responsable: nube, SaaS, API de LLM ([art. 2 letra x](https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01);
          [art. 15 bis](https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01)).'
      source:
        title: Ley 21.719
        href: https://www.bcn.cl/leychile/navegar?idNorma=1209272
        detail: Diario Oficial, 2024-12-13 · Legislación · Nivel 1 · art. 2 letras n) y x), art. 3, art. 15 bis
  problem_journey:
    question:
      kicker: La pregunta central
      text: ¿Podemos reconstruir qué ocurrió con los datos de una persona y demostrar qué medidas se aplicaron?
    lead: 'Sin traducción técnica, la ley queda en un documento. Así se ve el recorrido de los datos de una persona por la plataforma:'
    labels:
      route: Recorrido
      without: Sin controles
      with: Con controles
    stages:
    - title: Ingesta
      detail: fuente → bronze
      gap: 'Copias sin registro: no se sabe dónde está'
      gap_mark: '?'
      control: Linaje e índice de titulares
    - title: Consumo
      detail: silver · gold
      gap: 'Accesos amplios: no se sabe quién la vio'
      gap_mark: '?'
      control: Acceso por finalidad, revisado y fechado
    - title: Almacenamiento
      detail: tablas · respaldos
      gap: Tablas que no se pueden borrar
      gap_mark: ×
      control: Supresión consistente entre capas y respaldos
    - title: Reproceso
      detail: backfill · replay
      gap: El backfill reintroduce lo suprimido
      gap_mark: ×
      control: El replay respeta las supresiones
    - title: Auditoría
      detail: revisión · incidente
      gap: Ninguna evidencia de qué se hizo
      gap_mark: '?'
      control: Evidencia fechada en la CI
    note: Cada control de la fila inferior está en la matriz de control y, los de acceso, retención, minimización y supresión, en el código.
  design_board:
    intro: Ocho preguntas de diseño, desde identificar los datos hasta demostrar que los controles funcionan. Cada una indica dónde se desarrolla en esta ficha.
    groups:
    - title: Conocer
      items:
      - number: '01'
        question: ¿Qué datos trato?
        text: Descubrir identificadores directos e indirectos, datos sensibles y combinaciones reidentificables.
        tags:
        - kind: Prácticas
          label: Clasificación automática
      - number: '02'
        question: ¿Para qué los necesito?
        arq: true
        text: Registrar cada actividad de tratamiento con finalidad, base de licitud y plazo, y asociarla a sus activos. Un dataset puede servir a varias actividades
          con bases distintas.
        tags:
        - kind: Matriz
          label: Finalidad
    - title: Controlar
      items:
      - number: '03'
        question: ¿Dónde circulan?
        text: Trazar fuentes, APIs, colas, buckets, tablas, modelos, exportaciones y proveedores, incluidos los que están fuera de Chile.
        tags:
        - kind: Matriz
          label: Transferencias
      - number: '04'
        question: ¿Quién accede?
        text: Acceso por finalidad con IAM o RBAC, segregación de funciones y revisión periódica de permisos.
        tags:
        - kind: Matriz
          label: Acceso restringido
    - title: Proteger
      items:
      - number: '05'
        question: ¿Cómo los protejo?
        arq: true
        text: Minimizar desde la ingesta con contratos de campos por capa, seudonimizar cuando proceda y evaluar el impacto cuando la ley lo exige.
        tags:
        - kind: Matriz
          label: Minimización
      - number: '06'
        question: ¿Cuánto tiempo los guardo?
        text: Plazo por clase de dato y almacenamiento; al vencer, suprimir o anonimizar.
        tags:
        - kind: Matriz
          label: Retención
    - title: Responder
      items:
      - number: '07'
        question: ¿Cómo atiendo los derechos?
        text: Corregir, bloquear o suprimir alcanzando derivados, historiales, respaldos, CDC y reprocesos.
        tags:
        - kind: Matriz
          label: Derechos del titular
        - label: art. 4
      - number: 08
        question: ¿Cómo lo demuestro?
        arq: true
        text: Cada control produce evidencia y la CI falla si falta un control o su evidencia. Ante una vulneración, la consulta por linaje dimensiona el alcance.
        tags:
        - kind: Matriz
          label: Vulneraciones
        - kind: Código
          label: validate()
  control_matrix:
    title: Matriz de control
    legend: '**art.** fundamento legal del requisito · **función** control implementado en el código de la ficha'
    headers:
    - Requisito
    - Riesgo
    - Control técnico
    - Verificación
    - Evidencia
    rows:
    - name: Finalidad
      bases:
      - Principio de finalidad · art. 3
      risk: Datos usados para un fin no autorizado
      control: Autorización por finalidad y catálogo de actividades
      code: purpose_check
      check: Test de que cada consumo declara una finalidad aprobada
      evidence: Catálogo versionado y accesos por finalidad
    - name: Minimización
      bases:
      - Principio de proporcionalidad · art. 3
      code: schema_minimization
      risk: Columnas no aprobadas llegan a capas analíticas
      control: Contrato de campos permitidos
      check: Test de esquema en CI
      evidence: Resultado del test y versión del contrato
    - name: Retención
      bases:
      - Principio de proporcionalidad · art. 3
      code: retention_check
      risk: Datos vencidos siguen guardados o vuelven con un replay
      control: Política por clase de dato y almacenamiento
      check: Control de vencidos tras la purga y en el replay
      evidence: Configuración, ejecución y excepciones
    - name: Acceso restringido
      bases:
      - Medidas de seguridad · art. 14 quinquies
      code: access_review
      risk: Usuarios inactivos o con privilegios de más
      control: IAM o RBAC, segregación de funciones
      check: Revisión periódica de permisos
      evidence: Inventario de permisos y revisión fechada
    - name: Derechos del titular
      bases:
      - Derechos · art. 4
      code: erasure_replay_check
      risk: No localizar todos los registros de un titular, o que lo suprimido reaparezca
      control: Localizador de registros y flujo autorizado
      check: 'Prueba de punta a punta: localizar, ejecutar y reprocesar'
      evidence: ID interno de la solicitud, estados y resultado
    - name: Vulneraciones
      bases:
      - Reporte de vulneraciones · art. 14 sexies
      risk: No poder dimensionar el alcance a tiempo
      control: Logs, alertas y consulta de alcance por linaje
      check: Simulacro de consulta de alcance
      evidence: Línea de tiempo, sistemas afectados y acciones
    - name: Transferencias
      bases:
      - Transferencia internacional · arts. 27 a 29
      - Encargado · art. 15 bis
      risk: Flujos a terceros o al extranjero sin control
      control: Inventario de destinos y controles del proveedor
      check: Conciliación de flujos contra el inventario
      evidence: Contrato, evaluación y trazabilidad
    closing: La evidencia no guarda nombres, RUT ni datos sensibles cuando basta una referencia interna protegida.
  when_to_use:
    intro: En cada cambio de la plataforma o del uso de los datos. Estos son los disparadores más comunes; los de borde marcado tienen un deber legal asociado.
    groups:
    - title: Cambia la plataforma
      hint: dónde y cómo se tratan
      items:
      - title: Diseño o rediseño
        text: Una plataforma o pipeline nuevo que trata datos personales.
        tags:
        - kind: Matriz
          label: Minimización
      - title: Nueva fuente o integración
        text: APIs, CDC, archivos o colas que traen datos personales.
        tags:
        - kind: Matriz
          label: Transferencias
      - title: Migración a la nube
        text: Cambian ubicaciones, proveedores y copias.
        tags:
        - kind: Matriz
          label: Transferencias
      - title: Ambientes y respaldos
        text: Desarrollo, pruebas, respaldos y recuperación.
        tags:
        - kind: Matriz
          label: Retención
    - title: Cambia el uso
      hint: para qué y quién recibe
      items:
      - title: Nueva finalidad
        text: Usar datos existentes para un fin distinto del original.
        legal: true
        tags:
        - label: Principio de finalidad · art. 3
          legal: true
        - kind: Matriz
          label: Finalidad
      - title: Productos de datos
        text: Modelos, dashboards y exportaciones.
        tags:
        - kind: Matriz
          label: Finalidad
      - title: Nuevo proveedor
        legal: true
        text: Un tercero que trata datos por cuenta de la organización, incluida una API de LLM.
        tags:
        - label: Encargado · art. 15 bis
          legal: true
      - title: Destino fuera de Chile
        text: Réplicas, proveedores o APIs en otro país.
        legal: true
        tags:
        - label: Transferencia internacional · arts. 27 a 29
          legal: true
    - title: Momentos de control
      hint: revisar y demostrar
      items:
      - title: Tratamiento de alto riesgo
        text: Antes de empezar, evaluar el impacto en protección de datos.
        legal: true
        tags:
        - label: Evaluación de impacto · art. 15 ter
          legal: true
      - title: Vulneración
        text: Dimensionar el alcance y reportar.
        legal: true
        tags:
        - label: Reporte · art. 14 sexies
          legal: true
        - kind: Matriz
          label: Vulneraciones
      - title: Revisión periódica
        text: Auditorías internas y requerimientos de la Agencia.
        tags:
        - kind: Matriz
          label: Evidencia
  requirement_to_data:
    title: Del requisito al dato
    lead: 'Arquitectura de referencia ilustrativa: dónde se ubica cada control en una plataforma por capas.'
    governance:
      kicker:
        title: Gobierno
        detail: qué se permite
      items:
      - title: Legal y negocio
        detail: finalidad, base de licitud, plazo
      - title: Catálogo de actividades
        detail: metadatos por actividad
      legend:
      - el contrato fija los campos permitidos
      - el plazo define la purga
      - la finalidad autoriza el consumo
    data:
      kicker:
        title: Datos
        detail: cómo circulan
      stages:
      - title: Ingesta con contrato
        pill: Minimización
        tone: end
      - title: Bronze
        detail: crudo, solo campos permitidos
        tone: layer
      - title: Silver
        pill: Seudonimización
        tone: layer
      - title: Gold
        detail: agregado por producto
        tone: layer
      - title: Consumo por finalidad
        pill: Finalidad
        tone: end
      banner: Retención y supresión en todas las capas, respaldos y reprocesos
  control_evidence:
    title: Control y evidencia
    lead: 'Patrón de cumplimiento continuo (*policy as code*): cómo una plataforma demuestra que sus controles funcionan.'
    steps:
    - number: '1'
      title: Recolectar el estado
      items:
      - Configuración y permisos
      - Datos por capa y respaldos
      - Solicitudes de titulares atendidas
    - number: '2'
      title: Evaluar controles
      items:
      - Cada control aplica una regla definida y responde PASS, FAIL o UNKNOWN
      - UNKNOWN (falta el dato) no cuenta como PASS
    - number: '3'
      title: Validar la evidencia
      items:
      - 'Completa: están todos los controles'
      - 'Reciente: dentro del plazo de la política'
      - 'Íntegra: no se alteró después de generarse'
    decide:
      number: '4'
      title: Decidir y registrar
      outcomes:
      - tone: pass
        text: Sin brechas · se aprueba
      - tone: fail
        text: Con brechas · se rechaza
      - tone: keep
        text: En ambos casos se guarda la evidencia fechada
    note: Herramientas como Open Policy Agent, AWS Config o Azure Policy implementan este patrón; ninguna certifica cumplimiento por sí sola.
    example:
      summary: Ver ejemplo con el código de la ficha
      steps:
      - title: '@paso 1 · Datos'
        items:
        - text: Warehouse y source ficticios
        - text: Usuarios activos e inactivos
        - text: Tombstones de supresiones
      - title: '@paso 2 · Controles'
        items:
        - text: Todo consumo declara una finalidad aprobada
          code: purpose_check
        - text: Solo columnas aprobadas
          code: schema_minimization
        - text: Sin datos vencidos, tampoco tras un replay
          code: retention_check
        - text: Ningún usuario inactivo con acceso
          code: access_review
        - text: Lo suprimido no reaparece al reprocesar
          code: erasure_replay_check
      - title: '@paso 3 · Validación'
        items:
        - text: Cada control aparece una vez
        - text: Evidencia de 30 días o menos (política de ejemplo)
        - text: Huella SHA-256 igual a la guardada
      - title: '@paso 4 · Resultado'
        items:
        - text: 'Salida 0: la CI aprueba'
        - text: 'Salida 1: la CI rechaza'
        - text: '6 escenarios: 1 aprueba y 5 rechazan'
      note: Cubre 5 de los 7 requisitos de la matriz; vulneraciones y transferencias se verifican fuera de este ejemplo.
  code_guide:
    lead:
      title: Qué hace.
      text: Revisa automáticamente cinco reglas de privacidad sobre datos ficticios y valida que su evidencia sea completa, reciente e íntegra. Si algo falla, la
        CI rechaza el cambio (salida 1); si todo pasa, lo aprueba (salida 0).
    rules:
      headers:
      - Regla
      - Función
      - Requisito de la matriz
      items:
      - rule: Todo consumo declara una finalidad aprobada en el catálogo
        fn: purpose_check
        requirement: Finalidad
      - rule: Solo columnas aprobadas
        fn: schema_minimization
        requirement: Minimización
      - rule: Sin datos vencidos, tampoco tras un replay
        fn: retention_check
        requirement: Retención
      - rule: Ningún usuario inactivo con acceso
        fn: access_review
        requirement: Acceso restringido
      - rule: Lo suprimido no reaparece al reprocesar
        fn: erasure_replay_check
        requirement: Derechos del titular
    not_covered:
      title: Qué no cubre
      intro: 'Cubre 5 de los 7 requisitos de la matriz. Los otros dos no se resuelven con una regla que pase o falle en cada cambio:'
      items:
      - title: 'Vulneraciones:'
        text: 'es un proceso de respuesta a incidentes: detectar, dimensionar el alcance y reportar a la Agencia (art. 14 sexies). Se prueba con simulacros.'
      - title: 'Transferencias:'
        text: dependen de contratos con encargados y de evaluar cada destino (art. 15 bis; arts. 27 a 29). Un script puede conciliar flujos contra un inventario,
          pero no juzgar si un contrato o un país dan garantías suficientes.
    scenarios:
      title: Escenarios
      items:
      - name: con-brechas
        text: 'una brecha por regla: las cinco fallan'
        exit_code: 1
      - name: corregido
        text: las cinco reglas pasan
        exit_code: 0
      - name: sin-revision
        text: 'falta la fecha de la última revisión de accesos: queda en UNKNOWN, que no cuenta como aprobado'
        exit_code: 1
      - name: evidencia-alterada
        text: la evidencia de retención se edita después de guardada y su huella ya no coincide
        exit_code: 1
      - name: control-faltante
        text: no llega el resultado de minimización
        exit_code: 1
      - name: evidencia-vencida
        text: la evidencia de accesos tiene 31 días, más que los 30 de la política de ejemplo
        exit_code: 1
    simplifies:
      title: Qué simplifica
      items:
      - title: 'Finalidad:'
        text: comprueba que el consumo declare una finalidad aprobada, no que el uso real sea compatible con ella; eso requiere revisión humana.
      - title: 'Supresión:'
        text: solo revisa la reconstrucción desde la fuente; en producción también debe alcanzar respaldos, CDC y derivados.
      - title: 'Minimización:'
        text: usa una sola lista de columnas aprobadas; en producción la lista es por finalidad y por capa.
      - title: 'Evidencia:'
        text: la huella se calcula en la misma ejecución; en producción se compara con la evidencia guardada en un almacenamiento inmutable.
    limit:
      title: 'Límite:'
      text: es un ejemplo didáctico. Un resultado aprobado demuestra que los controles funcionaron, no que el tratamiento sea lícito.
  cloud_compare:
    title: En la nube
    intro: Servicios nativos que apoyan tres controles de la ficha. No son equivalencias exactas.
    alert:
      title: Por defecto.
      text: 'En las tres nubes, la auditoría de acceso a datos no queda activa sola: hay que configurarla. Sin ella no hay evidencia de quién accedió.'
    headers:
    - Necesidad
    - GCP
    - AWS
    - Azure
    rows:
    - need: Descubrir y clasificar
      meta: Cómo funciona · ¿Qué datos trato?
      gcp:
        name: Sensitive Data Protection
        text: Perfila BigQuery, Cloud SQL y Cloud Storage; también desidentifica.
      aws:
        name: Amazon Macie
        text: Datos sensibles en buckets de S3; no cubre otros almacenes.
      azure:
        name: Purview Data Map
        text: Clasificaciones de sistema y propias al escanear.
    - need: Restringir acceso a filas y columnas
      meta: Matriz · Acceso restringido
      gcp:
        name: BigQuery
        text: Seguridad por columna (policy tags) y políticas de acceso por fila.
      aws:
        name: Lake Formation
        text: Permisos finos por tabla, columna y fila.
      azure:
        name: Unity Catalog
        text: 'En Azure Databricks: privilegios, filtros de fila y máscaras de columna.'
    - need: Auditar accesos a datos
      meta: Matriz · Vulneraciones y evidencia
      gcp:
        name: Cloud Audit Logs
        text: Data Access audit logs, configurables por servicio.
        warn: Desactivados por defecto, salvo BigQuery
      aws:
        name: CloudTrail · data events
        text: Registra lecturas y escrituras sobre los datos.
        warn: No se registran por defecto
      azure:
        name: Registros de diagnóstico de Azure Databricks
        text: Entrega de registros de auditoría a Azure Monitor o almacenamiento.
        warn: Hay que configurar su entrega
    closing: 'Ningún servicio certifica cumplimiento por sí solo: cada uno se evalúa por alcance, configuración y evidencia disponible.'
  practice_lanes:
    start:
      title: Por dónde empezar
      text: 'Por lo de mayor riesgo: datos sensibles (incluida la situación socioeconómica), datos de niños, niñas y adolescentes, copias y accesos.'
    lanes:
    - title: Descubrir
      items:
      - title: Clasificación automática
        text: Descubrir y clasificar datos personales sin depender de inventarios manuales.
      - title: Linaje por actividad
        text: Linaje técnico asociado a cada actividad de tratamiento.
      - title: Metadatos en el catálogo
        text: Los metadatos legales viven en el catálogo, no en el código del pipeline.
        arq: true
    - title: Proteger
      items:
      - title: Privilegios mínimos
        text: Segregación de funciones y revisiones de privilegios.
      - title: Llaves y secretos
        text: Gestionados, con evidencia de configuración.
      - title: Ambientes no productivos
        text: 'Sin datos personales reales: enmascarados o sintéticos.'
    - title: Operar
      items:
      - title: Logs limpios
        text: Sin datos personales; solicitudes y vulneraciones con identificadores internos.
      - title: GenAI
        text: Una API externa de LLM que recibe datos personales es un encargado (art. 15 bis); revisar si hay transferencia internacional (art. 27).
    - title: Demostrar
      items:
      - title: Matriz viva
        text: Una fila por requisito, con dueño técnico y fecha de la última evidencia.
      - title: Controles en la CI
        text: La CI falla si falta un control o su evidencia.
      - title: Alcance en horas
        text: Dimensionar una vulneración con la consulta por linaje.
    - title: Suprimir
      items:
      - title: Supresión consistente
        text: 'Entre capas, respaldos y reprocesos: un backfill no restaura lo suprimido.'
  severity_cards:
    levels:
    - name: Leve
      level: 1
      amount: 5.000 UTM
      note: máximo, o amonestación escrita
      examples:
      - Responder solicitudes en forma incompleta o fuera de plazo
    - name: Grave
      level: 2
      amount: 10.000 UTM
      note: máximo
      examples:
      - Datos innecesarios o inexactos
      - Fallas de seguridad
      - Omitir registros de vulneraciones
      - Transferencias contra la ley
    - name: Gravísima
      level: 3
      amount: 20.000 UTM
      note: máximo
      examples:
      - Omitir en forma deliberada la comunicación de una vulneración
      - No hacer la evaluación de impacto obligatoria
  sources_grouped:
    groups:
    - title: Normativa chilena
      layout: list
      sources:
      - title: Ley 19.628 · texto que rige desde el 2026-12-01
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
        publisher: BCN
        why: Base de todas las citas de artículos de la ficha.
      - title: Ley 21.719 · publicada en el Diario Oficial el 2024-12-13
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=1209272
        publisher: BCN
        why: Origen de los cambios, de las definiciones del art. 2 que cita la ficha y del artículo primero transitorio (fecha de vigencia).
      - title: Boletín 18.623-07 · proyecto que posterga la vigencia
        urls:
        - https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07
        - https://tramitacion.senado.cl/appsenado/index.php?mo=tramitacion&ac=getDocto&iddocto=19307&tipodoc=mensaje_mocion
        publisher: Senado
        why: Estado del proyecto y propuesta de nueva fecha.
      - title: Decreto 662 · reglamento del modelo de prevención
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=1227971
        publisher: BCN
        why: Requisitos y certificación del modelo de prevención (arts. 49 y 51), citado en Sanciones.
    - title: Marcos de referencia del enfoque
      layout: list
      sources:
      - title: ISO/IEC 27001:2022
        urls:
        - https://www.iso.org/standard/27001
        publisher: ISO
        why: Cláusulas y controles que se citan como referencia en cada paso del enfoque.
      - title: ISO/IEC 27701
        urls:
        - https://www.iso.org/standard/27701
        publisher: ISO
        why: Extiende la gestión de ISO/IEC 27001 a la información de privacidad.
      - title: NIST Privacy Framework
        urls:
        - https://www.nist.gov/privacy-framework
        publisher: NIST
        why: Gestión de riesgos de privacidad por funciones y resultados verificables.
    - title: Legislación comparada
      layout: list
      sources:
      - title: Reglamento (UE) 2016/679 (RGPD)
        urls:
        - https://eur-lex.europa.eu/eli/reg/2016/679/oj
        publisher: EUR-Lex
        why: 'Referencia comparada, no chilena: su definición de tratamiento (art. 4.2) incluye expresamente la supresión.'
    - title: Servicios cloud
      layout: providers
      sources:
      - title: Sensitive Data Protection
        urls:
        - https://docs.cloud.google.com/sensitive-data-protection/docs/sensitive-data-protection-overview
        publisher: Google Cloud
        why: Descubrir y clasificar
        provider: GCP
      - title: BigQuery · columnas y filas
        urls:
        - https://docs.cloud.google.com/bigquery/docs/column-level-security-intro
        - https://docs.cloud.google.com/bigquery/docs/row-level-security-intro
        publisher: Google Cloud
        why: Restringir acceso a filas y columnas
        provider: GCP
      - title: Cloud Audit Logs
        urls:
        - https://docs.cloud.google.com/logging/docs/audit
        publisher: Google Cloud
        why: Auditar accesos a datos
        provider: GCP
      - title: Amazon Macie
        urls:
        - https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html
        publisher: AWS
        why: Descubrir y clasificar en S3
        provider: AWS
      - title: Lake Formation · filtros de datos
        urls:
        - https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html
        publisher: AWS
        why: Restringir acceso a filas y columnas
        provider: AWS
      - title: CloudTrail · data events
        urls:
        - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html
        publisher: AWS
        why: Auditar accesos a datos
        provider: AWS
      - title: Purview Data Map
        urls:
        - https://learn.microsoft.com/en-us/purview/data-map-classification
        publisher: Microsoft
        why: Descubrir y clasificar
        provider: Azure
      - title: Unity Catalog
        urls:
        - https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/
        publisher: Microsoft
        why: Restringir acceso a filas y columnas
        provider: Azure
      - title: Registros de diagnóstico de Azure Databricks
        urls:
        - https://learn.microsoft.com/en-us/azure/databricks/admin/account-settings/audit-log-delivery
        publisher: Microsoft
        why: Auditar accesos a datos
        provider: Azure
created_at: 2026-10-21
updated_at: 2026-11-09
last_verified: 2026-10-28
verification_status: review_required
---

## 1. Resumen

Esta ficha no es asesoría legal: explica el alcance técnico. El detalle de cada requisito está en su ficha hija.

### Objetivo

Comprender cómo la protección de datos personales influye en el diseño, desarrollo, operación, seguridad y auditoría de las plataformas de datos, conectando los principios y obligaciones de la normativa chilena con arquitecturas, herramientas y prácticas reales de Ingeniería de Datos.

El propósito es desarrollar el criterio técnico necesario para identificar riesgos, diseñar soluciones responsables, implementar controles y generar evidencia verificable, integrando la privacidad durante todo el ciclo de vida de los datos.

### Idea central

<!-- view: central_idea -->

### Contexto normativo

La Ley 21.719 reescribe la Ley 19.628. Mientras no se publique otra ley, sus modificaciones rigen desde el 1 de diciembre de 2026.

<!-- view: vigencia_timeline -->

### Qué implica para Ingeniería de Datos

<!-- view: treatment_map -->

## 2. Qué es

**[Buena práctica]** **Obligación legal frente a patrón técnico.** La ley impone obligaciones a quien corresponde (responsable o encargado). La matriz requisito → control → evidencia, las pruebas en la CI y los plazos internos de revisión son patrones técnicos propuestos aquí: **no** son obligaciones literales ni exigen una herramienta específica.

### Ocho principios del artículo 3

- **[Obligación legal · art. 3]** Licitud y lealtad.
- **[Obligación legal · art. 3]** Finalidad.
- **[Obligación legal · art. 3]** Proporcionalidad.
- **[Obligación legal · art. 3]** Calidad.
- **[Obligación legal · art. 3]** Responsabilidad.
- **[Obligación legal · art. 3]** Seguridad.
- **[Obligación legal · art. 3]** Transparencia e información.
- **[Obligación legal · art. 3]** Confidencialidad.

**[Buena práctica]** Detalle por tema y artículo en el Anexo · Catálogo legal.

### Responsabilidades: quién decide y quién implementa

- **[Buena práctica]** Legal, privacidad y negocio: definen finalidad, base de licitud y plazos aplicables.
- **[Buena práctica]** Seguridad: define y evalúa el riesgo y las medidas de protección.
- **[Buena práctica]** Ingeniería de Datos: implementa controles técnicos, automatización, trazabilidad y evidencia.
- **[Obligación legal · art. 3]** Responsable del tratamiento: conserva las responsabilidades legales que le corresponden.

### Conceptos que el ingeniero debe dominar

**[Buena práctica]** La etiqueta de cada fila corresponde a la definición (letra del art. 2 entre paréntesis); la columna «Error a evitar» es orientación técnica.

| Concepto | Explicación práctica | Error a evitar |
|---|---|---|
| **[Obligación legal · art. 2]** Dato personal (f) | Información vinculada o referida a una persona natural identificada o identificable, directa o indirectamente | Suponer que solo el nombre o el RUT son datos personales |
| **[Obligación legal · art. 2]** Dato sensible (g) | Se refiere a características físicas o morales o a hechos o circunstancias de la vida privada o intimidad, y revela origen étnico o racial, afiliación política, sindical o gremial, situación socioeconómica, convicciones ideológicas o filosóficas, creencias religiosas, salud, perfil biológico humano, datos biométricos, vida sexual, orientación sexual o identidad de género (lista cerrada; detección en `pii-identification`) | Clasificar solo por el nombre de la columna |
| **[Obligación legal · art. 2]** Tratamiento (o) | Cualquier operación, automatizada o no, para recolectar, procesar, almacenar, comunicar, transmitir o utilizar datos personales | Creer que un ETL interno no es tratamiento |
| **[Obligación legal · art. 2]** Responsable (n) | Decide los fines y medios del tratamiento, aunque lo ejecute un encargado | Atribuir las decisiones jurídicas al equipo técnico |
| **[Obligación legal · art. 2]** Encargado (x) | Trata datos personales por cuenta del responsable | Suponer que todo proveedor es encargado en toda actividad |
| **[Obligación legal · art. 2]** Seudonimización (l) | Los datos ya no se atribuyen a un titular sin información adicional, que figura por separado y está sujeta a medidas técnicas y organizativas | Considerarla anonimización |
| **[Obligación legal · art. 2]** Anonimización (k) | Procedimiento irreversible: el dato ya no puede vincularse a una persona ni permitir su identificación | Declarar anónima una tabla solo porque se quitó el RUT |
| **[Obligación legal · art. 3]** Finalidad y base de licitud (arts. 3 b), 12 y 13) | Para qué se trata el dato y qué habilita ese tratamiento | Asignar una sola base a un dataset que se reutiliza |

### Los ocho principios del art. 3 como decisiones técnicas

**[Obligación legal · art. 3]** Los ocho principios rigen el tratamiento; la pregunta y el control de cada fila son orientativos y llevan su propia etiqueta.

| Principio | Pregunta del ingeniero | Control orientativo |
|---|---|---|
| Licitud y lealtad | ¿Este tratamiento tiene una base validada para esta finalidad? | Cada actividad del catálogo con su base validada |
| Finalidad | ¿Algún consumidor usa los datos para otro propósito? | Metadatos de uso, permisos y contratos de consumo |
| Proporcionalidad | ¿Capturamos más campos de los necesarios? | Lista de columnas permitidas por producto y capa |
| Calidad | ¿Los datos son exactos y están actualizados? | Pruebas de exactitud, vigencia y rectificación |
| Responsabilidad | ¿Quién decide y quién opera cada control? | Dueños, aprobaciones y evidencia |
| Seguridad | ¿Quién puede acceder y qué pasa ante una falla? | Mínimo privilegio, cifrado, respaldo y monitoreo |
| Transparencia e información | ¿Podemos explicar qué tratamientos existen? | Catálogo conectado al inventario de actividades |
| Confidencialidad | ¿Se exponen datos a usuarios o sistemas no autorizados? | Segregación, secretos, registros y control de exportaciones |

**[Buena práctica]** Estos controles son propuestas de diseño: su suficiencia depende del contexto, del riesgo y de las obligaciones aplicables.

## 3. Problema que resuelve

<!-- view: problem_journey -->

## 4. Cómo funciona

<!-- view: design_board -->

<!-- view: control_matrix -->

## 5. Cuándo utilizarlo

<!-- view: when_to_use -->

## 9. Arquitectura

<!-- view: requirement_to_data -->

<!-- view: control_evidence -->

## 10. Código

```python
# Python 3.12+, biblioteca estándar. De punta a punta: datos ficticios → 5 controles → validación de la evidencia →
# código de salida (0 aprueba, 1 rechaza). Uso: python controles.py con-brechas | corregido | sin-revision |
# evidencia-alterada | control-faltante | evidencia-vencida. PASS / FAIL / UNKNOWN: UNKNOWN (falta el dato para
# evaluar) nunca cuenta como PASS. Didáctico: no certifica cumplimiento. Cada docstring nombra el principio o deber
# de la Ley 19.628, modificada por la Ley 21.719, que el control ayuda a evidenciar; la regla técnica es del ejemplo.
import hashlib
import json
import sys
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta, timezone

# @paso 1 Datos
REFERENCE = datetime(2026, 10, 26, 12, tzinfo=timezone.utc)   # fecha fija: resultado reproducible
MAX_AGE = timedelta(days=30)   # vigencia de la evidencia: política interna de ejemplo, NO un plazo legal
RETENTION_DAYS = 90            # plazo de la política. Alargarlo para que el control pase es un antipatrón: se purga
CUTOFF = REFERENCE.date() - timedelta(days=RETENTION_DAYS)
APPROVED_COLUMNS = frozenset({"customer_id", "email", "retention_start"})   # contrato de campos permitidos
APPROVED_PURPOSES = frozenset({"analitica_ventas", "atencion_cliente"})     # finalidades del catálogo de ejemplo
Row = dict[str, object]


@dataclass(frozen=True)
class User:
    name: str
    active: bool
    authorized: bool


@dataclass(frozen=True)
class Consumer:
    name: str
    purpose: str | None   # finalidad declarada en el catálogo de actividades


@dataclass(frozen=True)
class Platform:
    warehouse: list[Row]
    source: list[Row]
    tombstones: frozenset[object]   # supresiones de solicitudes de titulares ya atendidas
    users: list[User]
    consumers: list[Consumer]
    last_access_review: date | None = date(2026, 10, 20)
    replay_honors_tombstones: bool = True
    replay_applies_retention: bool = True


@dataclass(frozen=True)
class Result:
    control_id: str
    status: str   # PASS | FAIL | UNKNOWN
    detail: str
    executed_at: datetime = REFERENCE
    evidence_uri: str = ""
    evidence: dict[str, str] = field(default_factory=dict)

    def sha256(self) -> str:   # huella de la evidencia serializada, guardada junto a evidence_uri
        return hashlib.sha256(json.dumps(self.evidence, sort_keys=True).encode()).hexdigest()


def expired(row: Row) -> bool:
    # retention_start: inicio del plazo que fija la política; en la práctica suele ser el fin de la relación con el
    # titular o de la finalidad, no la fecha de creación del registro
    return date.fromisoformat(str(row["retention_start"])) < CUTOFF


def with_gaps() -> Platform:   # cada brecha se inyecta por separado y a la vista
    ana: Row = {"customer_id": 101, "email": "ana@example.test", "retention_start": "2026-10-01"}
    bruno: Row = {"customer_id": 102, "email": "bruno@example.test", "retention_start": "2026-10-03"}   # suprimido
    old: Row = {"customer_id": 104, "email": "diego@example.test", "retention_start": "2026-06-01"}
    return Platform(
        warehouse=[{**ana, "nota_libre": "sin aprobar"}, old],    # brecha: columna no aprobada; brecha: registro vencido
        source=[ana, bruno, old], tombstones=frozenset({102}),
        users=[User("analista", True, True), User("ex_usuario", False, True)],   # brecha: inactivo con acceso
        consumers=[Consumer("dashboard_ventas", "analitica_ventas"),
                   Consumer("export_marketing", "marketing")],                   # brecha: finalidad no aprobada
        replay_honors_tombstones=False,                                          # brecha: replay sin tombstones
        replay_applies_retention=False)   # el replay desde source vuelve a traer el registro vencido


def fix(p: Platform) -> Platform:   # corrige cada brecha; el plazo de retención no cambia
    kept = [{c: v for c, v in r.items() if c in APPROVED_COLUMNS} for r in p.warehouse if not expired(r)]
    users = [replace(u, authorized=u.authorized and u.active) for u in p.users]
    consumers = [c for c in p.consumers if c.purpose in APPROVED_PURPOSES]   # sin finalidad aprobada, sin acceso
    return replace(p, warehouse=kept, users=users, consumers=consumers,
                   replay_honors_tombstones=True, replay_applies_retention=True)


def replay(p: Platform) -> list[Row]:   # lo que vuelve a cargarse si se reconstruye el warehouse desde source
    rows = [r for r in p.source if not (p.replay_honors_tombstones and r["customer_id"] in p.tombstones)]
    if p.replay_applies_retention:
        rows = [r for r in rows if not expired(r)]
    return rows


# @paso 2 Controles
def purpose_check(p: Platform) -> tuple[str, str]:
    """Principio de finalidad (art. 3): los datos se tratan para fines específicos, explícitos y lícitos. Regla del
    ejemplo: todo consumo declara una finalidad aprobada en el catálogo. Verifica la declaración, no que el uso real
    sea compatible con ella; eso requiere revisión humana."""
    bad = [c.name for c in p.consumers if c.purpose not in APPROVED_PURPOSES]
    if bad:
        return "FAIL", f"consumos sin finalidad aprobada: {bad}"
    return "PASS", "ok"


def schema_minimization(p: Platform) -> tuple[str, str]:
    """Principio de proporcionalidad (art. 3): solo los datos necesarios, adecuados y pertinentes. Regla del ejemplo:
    el warehouse contiene solo columnas del contrato aprobado."""
    extra = sorted({c for r in p.warehouse for c in r} - APPROVED_COLUMNS)
    if extra:
        return "FAIL", f"columnas no aprobadas: {extra}"
    return "PASS", "ok"


def retention_check(p: Platform) -> tuple[str, str]:
    """Principio de proporcionalidad (art. 3): los datos se conservan el tiempo necesario y luego se suprimen o
    anonimizan. Regla del ejemplo: ningún registro vencido en el warehouse ni en la salida del replay, que puede
    volver a traer lo purgado. El plazo de cada dato es política interna."""
    stored = [r["customer_id"] for r in p.warehouse if expired(r)]
    replayed = [r["customer_id"] for r in replay(p) if expired(r)]
    if stored or replayed:
        return "FAIL", f"vencidos sin purgar: {stored}; en la salida del replay: {replayed}"
    return "PASS", "ok"


def access_review(p: Platform) -> tuple[str, str]:
    """Principio de seguridad (art. 3) y medidas de seguridad (art. 14 quinquies). Regla del ejemplo: un usuario
    inactivo no conserva acceso y existe una revisión de permisos fechada."""
    holders = [u.name for u in p.users if u.authorized and not u.active]
    if holders:
        return "FAIL", f"inactivos con acceso: {holders}"
    if p.last_access_review is None:
        return "UNKNOWN", "sin fecha de última revisión"
    return "PASS", "ok"


def erasure_replay_check(p: Platform) -> tuple[str, str]:
    """Derecho de supresión (art. 7). Regla del ejemplo: un registro suprimido no vuelve con un replay desde source;
    en producción la supresión también debe alcanzar respaldos, CDC y derivados."""
    revived = [r["customer_id"] for r in replay(p) if r["customer_id"] in p.tombstones]
    if revived:
        return "FAIL", f"reaparecen: {revived}"
    return "PASS", "ok"


CONTROLS = (purpose_check, schema_minimization, retention_check, access_review, erasure_replay_check)


def run_controls(p: Platform) -> list[Result]:
    results = []
    for control in CONTROLS:
        status, detail = control(p)
        uri = f"evidencia://ci-20261026/{control.__name__}.json"
        evidence = {"status": status, "detail": detail}
        results.append(Result(control.__name__, status, detail, evidence_uri=uri, evidence=evidence))
    return results


# @paso 3 Validación
def validate(results: list[Result], stored_sha256: dict[str, str]) -> list[str]:
    """Principio de responsabilidad (art. 3): quien trata datos responde por cumplir los principios y deberes de la
    ley. Regla del ejemplo: un estado autodeclarado no basta; la evidencia debe estar completa (cada control una vez),
    ser reciente y tener la misma huella SHA-256 que se guardó."""
    gaps: list[str] = []
    ids = [r.control_id for r in results]
    for control in CONTROLS:
        count = ids.count(control.__name__)
        if count == 0:
            gaps.append(f"{control.__name__}: falta el resultado")
        elif count > 1:
            gaps.append(f"{control.__name__}: resultado duplicado ({count})")
    for r in results:
        if r.status != "PASS":
            gaps.append(f"{r.control_id}: {r.status} ({r.detail})")
        if REFERENCE - r.executed_at > MAX_AGE:
            gaps.append(f"{r.control_id}: evidencia vencida ({(REFERENCE - r.executed_at).days} días)")
        if not r.evidence_uri:
            gaps.append(f"{r.control_id}: evidencia sin URI")
        if stored_sha256.get(r.control_id) != r.sha256():
            gaps.append(f"{r.control_id}: huella distinta a la guardada")
    return gaps


def tamper(results: list[Result], scenario: str) -> list[Result]:   # simula fallas de la evidencia, no del control
    if scenario == "evidencia-alterada":   # alguien edita la evidencia después de guardada su huella
        return [replace(r, evidence={"status": "PASS", "detail": "editado a mano"})
                if r.control_id == "retention_check" else r for r in results]
    if scenario == "control-faltante":     # el resultado de un control no llega a la validación
        return [r for r in results if r.control_id != "schema_minimization"]
    if scenario == "evidencia-vencida":    # la evidencia es más antigua que la política
        return [replace(r, executed_at=REFERENCE - timedelta(days=31))
                if r.control_id == "access_review" else r for r in results]
    return results


# @paso 4 Resultado
def main(scenario: str) -> int:
    corrected = fix(with_gaps())
    platforms = {"con-brechas": with_gaps(), "corregido": corrected,
                 "sin-revision": replace(corrected, last_access_review=None),
                 "evidencia-alterada": corrected, "control-faltante": corrected, "evidencia-vencida": corrected}
    if scenario not in platforms:
        print(f"escenario desconocido: {scenario}; opciones: {', '.join(platforms)}")
        return 2
    results = run_controls(platforms[scenario])
    stored = {r.control_id: r.sha256() for r in results}   # en la CI, la huella se guarda al ejecutar
    results = tamper(results, scenario)
    gaps = validate(results, stored)
    print(f"{scenario}: " + ", ".join(f"{r.control_id}={r.status}" for r in results))
    print("\n".join(f"BRECHA {g}" for g in gaps) or "sin brechas")
    if gaps:
        print("CI: rechazada (1)")
        return 1
    print("CI: aprobada (0)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "con-brechas"))
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`.

```text
$ python controles.py con-brechas
con-brechas: purpose_check=FAIL, schema_minimization=FAIL, retention_check=FAIL, access_review=FAIL, erasure_replay_check=FAIL
BRECHA purpose_check: FAIL (consumos sin finalidad aprobada: ['export_marketing'])
BRECHA schema_minimization: FAIL (columnas no aprobadas: ['nota_libre'])
BRECHA retention_check: FAIL (vencidos sin purgar: [104]; en la salida del replay: [104])
BRECHA access_review: FAIL (inactivos con acceso: ['ex_usuario'])
BRECHA erasure_replay_check: FAIL (reaparecen: [102])
CI: rechazada (1)
```

```text
$ python controles.py corregido
corregido: purpose_check=PASS, schema_minimization=PASS, retention_check=PASS, access_review=PASS, erasure_replay_check=PASS
sin brechas
CI: aprobada (0)
```

```text
$ python controles.py sin-revision
sin-revision: purpose_check=PASS, schema_minimization=PASS, retention_check=PASS, access_review=UNKNOWN, erasure_replay_check=PASS
BRECHA access_review: UNKNOWN (sin fecha de última revisión)
CI: rechazada (1)
```

```text
$ python controles.py evidencia-alterada
evidencia-alterada: purpose_check=PASS, schema_minimization=PASS, retention_check=PASS, access_review=PASS, erasure_replay_check=PASS
BRECHA retention_check: huella distinta a la guardada
CI: rechazada (1)
```

```text
$ python controles.py control-faltante
control-faltante: purpose_check=PASS, retention_check=PASS, access_review=PASS, erasure_replay_check=PASS
BRECHA schema_minimization: falta el resultado
CI: rechazada (1)
```

```text
$ python controles.py evidencia-vencida
evidencia-vencida: purpose_check=PASS, schema_minimization=PASS, retention_check=PASS, access_review=PASS, erasure_replay_check=PASS
BRECHA access_review: evidencia vencida (31 días)
CI: rechazada (1)
```

<!-- view: code_guide -->

## 11. GCP

<!-- view: cloud_compare -->

## 14. Buenas prácticas

**[Buena práctica]** Las prácticas se ordenan por etapa del ciclo de vida de los datos, empezando por lo de mayor riesgo.

<!-- view: practice_lanes -->

## 16. Trade-offs

**[Decisión de arquitectura]**

- **Minimización frente a flexibilidad analítica:** capturar menos reduce el riesgo y puede limitar análisis futuros; se resuelve con finalidades explícitas, aprobaciones y productos de datos definidos, no recolectando por si acaso.
- **Linaje completo frente a costo:** rastrear todas las copias cuesta; priorizar los datos y flujos de mayor riesgo y automatizar el descubrimiento de a poco.
- **Retención frente a auditoría y recuperación:** borrar demasiado pronto puede afectar obligaciones legítimas de conservación; conservar indefinidamente aumenta la exposición. La política se aprueba y debe poder ejecutarse.
- **Seguridad frente a rendimiento:** tokenización, máscaras y controles finos agregan latencia y complejidad; se diseñan con pruebas de carga y análisis de riesgo.
- **Matriz detallada frente a mantenible:** una fila por requisito, con el detalle en las fichas hijas; exigir evidencia reciente cuesta, pero es lo que demuestra que el control funciona.

No toda falla técnica es una infracción: la calificación jurídica depende del hecho y del procedimiento. Lo útil para ingeniería es prevenir las fallas que sí tienen origen técnico.

### Sanciones

<!-- view: severity_cards -->

En reincidencia, la Agencia puede aplicar hasta tres veces el monto de la infracción. Si una empresa que no es de menor tamaño reincide en infracciones graves o gravísimas, la multa puede alcanzar la más gravosa entre ese triple y el 2 % o 4 % de sus ingresos anuales (art. 35). Es atenuante haber cumplido los deberes de dirección y supervisión, verificable con el certificado del modelo de prevención (arts. 36, 49 y 51).

## 18. Preguntas técnicas abiertas

1. ¿Qué pipelines tuyos tratan datos de personas, y para qué actividades?
2. Si mañana llega una solicitud de supresión, ¿en cuántas tablas, respaldos y exportaciones está ese titular?
3. ¿Qué control tuyo tiene evidencia de los últimos 30 días?
4. ¿Cómo impedirías que un backfill restaure datos que debían quedar suprimidos?
5. ¿Qué información técnica necesitarían seguridad y privacidad para dimensionar una vulneración?

## 20. Fuentes

- Normativa chilena (BCN y Senado): Ley 19.628 con el texto que rige desde el 2026-12-01, Ley 21.719, boletín 18.623-07 (tramitación y mensaje) y Decreto 662.
- Marcos de referencia del enfoque: ISO/IEC 27001:2022, ISO/IEC 27701 y NIST Privacy Framework.
- Legislación comparada: Reglamento (UE) 2016/679 (RGPD), en EUR-Lex.
- Servicios cloud: Sensitive Data Protection, BigQuery y Cloud Audit Logs (GCP); Amazon Macie, Lake Formation y CloudTrail (AWS); Purview Data Map, Unity Catalog y los registros de diagnóstico de Azure Databricks (Azure).

El detalle de cada fuente está en `sources` del frontmatter; la agrupación, en `views.sources_grouped`.

## 21. Fecha de última verificación

2026-10-28: textos legales vueltos a consultar en BCN (sin cambios) y estado del boletín 18.623-07 en el Senado (aprobado por el Senado y despachado a la Cámara). Antes, 2026-10-25: textos legales vueltos a consultar, sin cambios, y 2026-10-22: articulado, vigencia, estado del boletín 18.623-07 y Decreto 662 consultados ese día en BCN y en el Senado. `review_required` desde el 2026-11-06: depuración de contenido pedida en la revisión; vuelve a `verified` cuando se apruebe (`owner_approved_at`). 2026-11-07: páginas de GCP, AWS y Azure vueltas a abrir (Purview cambió su título a «Data classification in Microsoft Purview Data Map»); NIST Privacy Framework verificado; ISO/IEC 27701 y BCN por verificar: no se pudieron abrir desde esta sesión. 2026-11-09: abiertas las páginas nuevas de BigQuery, Lake Formation, Azure Databricks y EUR-Lex; ISO/IEC 27001 por verificar (Felipe). Revisión mensual, y extraordinaria si se publica la ley de postergación.

## 22. Historial de cambios importantes

- 2026-10-21: creación (lote F3b-19a); absorbe `compliance-scope-for-data-engineers`.
- 2026-10-22: reestructura como ficha padre del subdominio (upgrade de 19): mapa de artículos, estado de la postergación según el Senado, Decreto 662, caso por capas, sanciones y contraste básico/senior. La matriz exige evidencia reciente y hace fallar la CI. El detalle pasa a las fichas hijas.
- 2026-10-24: las hijas se declaran con `PART_OF` (ADR-024) en vez de `RELATED_TO`; `implication` por artículo en `legal_basis` (enmienda de ADR-023). Sin cambios de contenido legal ni de código.
- 2026-10-25: revisión del upgrade (`docs/reviews/cards-f3b-19-upgrade.md`) y auditoría de las etiquetas «Obligación legal»: cada una afirma solo lo que dice su artículo; lo demás pasa a buena práctica o decisión de arquitectura. Textos de BCN y del Senado consultados el 2026-10-25, sin cambios desde el 2026-10-22.
- 2026-10-25: §9 con el estándar de diagramas (máximo 8 nodos, CLAUDE.md): dos diagramas: del requisito al dato, y control y evidencia; capas en un subgraph.
- 2026-10-26: mejora de contenido con tres niveles de lectura: §1 (cómo leerla), §2 (obligación frente a patrón técnico, conceptos del art. 2 con «Error a evitar» y principios del art. 3 con pregunta y control), §3 (pregunta central), §4 (seis preguntas enlazadas a las hijas y matriz con «Decisión aprobada por»), §5, §6, §7 (minimización de una API), §8 (caso de supresión), §10 (validador de resultados con entrada versionada y fecha como argumento), §11 y §13 (no son equivalencias exactas; Data Access audit logs), §15 (tabla), §16 (trade-offs), §17 (regla editorial) y §18. Sin cambios en `legal_basis`, etiquetas de los artículos, aviso, vigencia, boletín ni sanciones.
- 2026-10-27: revisión `docs/reviews/cdp-v2.md` aplicada: la fila del art. 2 g) recoge la lista completa de la letra, sin «entre otros», y la del art. 2 l) dice «medidas técnicas y organizativas». Sin cambios en `legal_basis` ni vigencia.
- 2026-10-28: pasa al dominio 24-privacy-engineering, tramo `fundamentos` (ADR-027), desde 19-compliance; sin cambios de contenido. La URL de la ficha (`/concepts/chile-data-protection/`) no cambia.
- 2026-10-28: vigencia actualizada con el estado de hoy del boletín 18.623-07 (aprobado por el Senado y despachado a la Cámara; la vigencia legal sigue en el 2026-12-01), consultado en el Senado; textos de BCN y mensaje vueltos a consultar, sin cambios. Un test compara la fecha y el estado con `content/legal-frameworks/cl-ley-21719.yaml`. §17: «Fichas hijas del dominio».
- 2026-10-28: §17 nombra las cuatro fichas hijas del lote P2 (`purpose-based-authorization`, `distributed-erasure-propagation`, `privacy-backup-and-recovery`, `privacy-in-ai-rag-llm`), en el orden del blueprint. Sin otros cambios.
- 2026-10-28: mismos errores que la revisión de P2: la fila del art. 14 quáter del mapa de artículos nombra sus cuatro factores.
- 2026-10-28: el resumen pasa a ser la introducción del subdominio (objetivo, idea central, contexto normativo y preguntas que debe responder la arquitectura). La vigencia citada sigue siendo la de la ley publicada; el boletín 18.623-07 sigue siendo un proyecto.
- 2026-10-30: sobre la versión en revisión (`b/ui-ajustes-1030`), solo lo que exige ADR-023 para pasar `make validate`: etiquetas en el párrafo de marco y en los ítems del §2 (principios a) a h) y responsabilidades), y columna «Etiqueta» en la matriz del §4 y en las tablas de §11–13, con los mismos valores que tenían antes. La vigencia ya estaba en sincronía con `cl-ley-21719.yaml`.
- 2026-10-30: Enmienda 3 de ADR-023: en §4, §13, la tabla con la misma etiqueta en todas sus filas pasa a la línea «Etiqueta: […]» antes de la tabla, sin columna. Sin cambios de contenido.
- 2026-10-30: se quitan del resumen «Cómo leerla» y el subtítulo «Ley 21.719: Protección de datos personales aplicada a Ingeniería de Datos»; del §2, el párrafo del marco de la Ley 19.628/21.719 y el bloque «Precisiones transversales».
- 2026-10-30: §17 nombra las fichas hijas nuevas `gdpr` y `lgpd` (lote P4, tramo 6 «Marcos regulatorios comparados»). Sin cambios de contenido.
- 2026-10-30: Enmienda 4 de ADR-023: 6 tabla(s) sin columna ni línea «Etiqueta»; la fila con origen legal lleva «Obligación legal» al inicio de su primera celda. Sin cambios de contenido.
- 2026-11-01: aprobada con lista explícita (`owner_approved_at: 2026-11-01`); pasa a `verified` (ADR-023).
- 2026-11-01: §10 reemplazado a partir de la propuesta: flujo de punta a punta (datos ficticios → cuatro controles → validación de la evidencia → código de salida 0/1 sin `assert`), estados PASS/FAIL/UNKNOWN, cuatro brechas inyectadas por separado, regla «autorizado ⇒ activo», purga del registro vencido sin cambiar el plazo, `evidence_sha256`, duplicados y evidencia vencida. Sale la entrada versionada `tests/fixtures/privacy-control-results.json`. **Por el cambio de código, la ficha vuelve a `review_required` hasta una nueva aprobación.**
- 2026-11-01: aprobada de nuevo con el §10 nuevo, condicionada a la CI en verde (run 41354325642, 786 tests): `owner_approved_at: 2026-11-01`, vuelve a `verified`.
- 2026-11-03: piloto de código guiado en el §10: una función por control con el docstring de su letra del art. 3 y sin ternarios encadenados; marcadores `# @paso 1–4`; el replay desde `source` reintroducía el registro vencido y `retention_check` ahora evalúa también su salida (`fix()` aplica la retención al replay); escenario nuevo `evidencia-alterada`, donde falla la huella SHA-256; una salida por escenario con su línea `$ python controles.py <escenario>`, igual a la de la CI. Vuelve a `review_required` hasta la aprobación.
- 2026-11-03: aprobada con el §10 nuevo (`owner_approved_at: 2026-11-03`); vuelve a `verified` (ADR-023).
- 2026-11-03: los principios del art. 3 se nombran (en negrita en el texto) en vez de por su letra. Sin cambios de fondo; el estado no cambia.
- 2026-11-04: revisión `docs/reviews/p10.md` aplicada: los docstrings del §10 citan el texto del art. 3 (confidencialidad con «la relación con el titular»; calidad «exactos, completos, actuales y pertinentes»; proporcionalidad «suprimidos o anonimizados») y dejan aparte, como control técnico, lo que la ley no fija (acceso del inactivo, replay, huella SHA-256); el párrafo del §10 nombra en negrita los principios, sin «la letra». Vuelve a `review_required`.
- 2026-11-04: aprobada con la revisión P10 y su verificación aplicadas (cita de confidencialidad con «Este», como en BCN) (`owner_approved_at: 2026-11-04`); vuelve a `verified` (ADR-023).
- 2026-11-06: depuración de contenido pedida en la revisión (ADR-029). Se eliminan las secciones 6 (Cuándo no utilizarlo), 7 (Ejemplo sencillo), 8 (Ejemplo de producción), 15 (Errores frecuentes, con la fila «Tenemos cifrado, cumplimos» y la frase sobre la infracción grave del art. 34 ter c) y d)), 17 (Conceptos relacionados) y 19 (Laboratorio relacionado). Además: en §1, el encabezado de la tabla de preguntas y «no es formar especialistas legales, sino»; en §3, el párrafo de la matriz requisito → control → evidencia ejecutada en la CI; en §4, las referencias entre paréntesis a artículos y fichas al final de cada paso; en §16, «(arts. 34 bis a 35)» del título de Sanciones y la columna básica de «Básico vs. senior», que pasa a la lista «Qué se espera de un nivel senior»; en §10, la explicación del código, que queda en una frase, una línea por escenario y una limitación. El catálogo legal agrupado por tema sale del §2 y pasa al anexo. Las dos citas del boletín 18.623-07 se rotulan «tramitación» y «mensaje». Vuelve a `review_required` hasta la aprobación.
- 2026-11-07: La matriz del §4 sigue los cinco pasos del Resumen (requisito, riesgo, control técnico, verificación, evidencia) y deja la columna «Decisión aprobada por»; el nodo de la matriz del diagrama «Control y evidencia» nombra los cinco pasos; sale «Resultado esperado» del Resumen. §10: la validación exige que cada control aparezca una vez (falta o duplicado es brecha), separa «evidencia sin URI» de «huella distinta a la guardada» y suma los escenarios `control-faltante` y `evidencia-vencida`; los docstrings nombran el principio sin letra (seguridad en `access_review`) y el derecho de supresión (art. 7) en `erasure_replay_check`, parafraseados, sin citas textuales. Sigue en `review_required`.
- 2026-11-07: maqueta de bloques 0–6, fase 1 (ADR-030): datos estructurados en `views` del frontmatter con marcas `<!-- view: … -->` en el cuerpo. Idea central en dos lados (lo que el pipeline comprueba y lo que no ve); vigencia como línea de hitos (reemplaza el párrafo «Estado al 2026-10-28…»); el enfoque sale del Resumen a un desplegable propio con descripción por paso y dos recuadros («De dónde viene», «Por qué se ajusta»); principios sin letra y enlace al anexo; buenas prácticas en cinco etapas (absorbe y elimina «Qué se espera de un nivel senior»); sanciones en tres tarjetas, sin las letras de los artículos; fuentes agrupadas (las dos del boletín en una entrada) y nuevas ISO/IEC 27701 y NIST Privacy Framework. Sigue en `review_required`.

- 2026-11-09: §10 suma el control de finalidad (`purpose_check`): cinco reglas, el filtro de consumos sin finalidad aprobada y las salidas de los seis escenarios. Sigue en `review_required`.
- 2026-11-09: diseño final con los componentes de Cursor (ADR-030, enmienda 1). Los textos que estaban fijos en los componentes pasan a `views`: mapa de tratamiento (art. 2 letra o y nota comparada del RGPD), enfoque con ejemplo y referencia ISO/IEC 27001:2022 por paso, roles del §2 («Principios y responsabilidades»), recorrido del problema, ocho preguntas en cuatro fases, matriz de 7 filas con Finalidad, disparadores de uso, arquitectura de referencia, patrón de control y evidencia, guía del código y «En la nube» (reemplaza las pestañas GCP/AWS/Azure; §12 y §13 se omiten, ADR-029). Salen del cuerpo las 8 preguntas del Resumen, el párrafo de actividades, el párrafo [arq] del §3, las seis preguntas y la tabla del §4, la lista del §5, los diagramas del §9, la explicación del §10 y las letras a)…h) de los principios. Fuentes nuevas: ISO/IEC 27001, RGPD en EUR-Lex, BigQuery, Lake Formation y registros de diagnóstico de Azure Databricks. Sigue en `review_required`.

## Anexo · Catálogo legal por tema

### Fundamentos, alcance y principios

- **[Obligación legal · art. 1 bis]** Ámbito territorial. También alcanza al encargado fuera de Chile que trata por cuenta de un responsable en Chile y a quien, desde fuera, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento. Ficha: `processors-and-international-transfers`.
- **[Obligación legal · art. 2]** Definiciones. Dato personal, sensible, anonimización, seudonimización, perfiles y encargado. Fichas: `pii-identification`, `chilean-identifier-pseudonymization`.
- **[Obligación legal · art. 3]** Principios: **licitud y lealtad**, **finalidad**, **proporcionalidad**, **calidad**, **responsabilidad**, **seguridad**, **transparencia e información** y **confidencialidad**. Cada principio necesita un control y una evidencia. Ficha: esta ficha.

### Derechos y decisiones automatizadas

- **[Obligación legal · art. 4]** Derechos del titular, desarrollados en los arts. 5 a 11. Seis tipos de solicitud con plazo y evidencia. Ficha: `data-subject-rights-pipeline`.
- **[Obligación legal · art. 8 bis]** Decisiones individuales automatizadas: explicación, intervención humana y revisión. Ficha: `dpia-and-automated-decisions`.

### Licitud, responsabilidad y transparencia

- **[Obligación legal · art. 12]** Consentimiento; el responsable prueba la licitud. Las demás bases están en el art. 13. Ficha: `processing-activities-inventory`.
- **[Obligación legal · art. 14]** Obligaciones del responsable: acreditar la licitud y suprimir o anonimizar datos precontractuales. Ficha: `processing-activities-inventory`.
- **[Obligación legal · art. 14 bis]** Secreto o confidencialidad, también de datos públicos organizados o combinados. Ficha: esta ficha.
- **[Obligación legal · art. 14 ter]** Información y transparencia: la política pública se alimenta del catálogo. Ficha: `processing-activities-inventory`.

### Privacidad desde el diseño y seguridad

- **[Obligación legal · art. 14 quáter]** Protección desde el diseño y por defecto. Por defecto, solo los datos específicos y estrictamente necesarios, según número de datos, extensión, plazo y accesibilidad. Ficha: `data-minimization-by-layer`.
- **[Obligación legal · art. 14 quinquies]** Medidas de seguridad y verificación regular. Ficha: `privacy-controls-as-code`.
- **[Obligación legal · art. 14 sexies]** Reporte de vulneraciones a la Agencia, registro de esas comunicaciones y aviso a titulares en ciertos casos. Ficha: `data-breach-response`.

### Encargados, impacto y datos sensibles

- **[Obligación legal · art. 15 bis]** Tratamiento por un encargado. Suprime o devuelve al terminar; la cesión está en el art. 15. Ficha: `processors-and-international-transfers`.
- **[Obligación legal · art. 15 ter]** Evaluación de impacto en los casos que el artículo enumera. Ficha: `dpia-and-automated-decisions`.
- **[Obligación legal · art. 16]** Datos sensibles; reglas especiales en los arts. 16 bis a 16 sexies. Ficha: `pii-identification`.

### Transferencias, sanciones y prevención

- **[Obligación legal · art. 27]** Transferencia internacional. Cada flujo al exterior necesita un mecanismo. Países adecuados y cláusulas, en el art. 28. Ficha: `processors-and-international-transfers`.
- **[Obligación legal · art. 35]** Sanciones. Varias infracciones nacen de fallas técnicas. Ficha: esta ficha (Trade-offs).
- **[Buena práctica]** Art. 49. Modelo de prevención de infracciones, voluntario. El certificado del art. 51 acredita el atenuante del art. 36 n.º 5. Reglamento en el Decreto 662. Ficha: `privacy-controls-as-code`.
