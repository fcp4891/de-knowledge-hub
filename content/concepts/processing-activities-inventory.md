---
id: pattern:processing-activities-inventory
slug: processing-activities-inventory
type: pattern
title: Inventario de actividades de tratamiento
description: 'El inventario registra para qué se tratan los datos personales, con qué base y hasta cuándo, y lo vincula con los activos y consumidores
  que los usan: la base vive en la actividad, no en la tabla. Una puerta en la CI bloquea lo nuevo sin actividad vigente y una conciliación alerta
  lo que ya corre, sin presumir infracciones. Ejemplo ejecutado en la CI. No es asesoría legal.'
domain: privacy-engineering
subdomain: fundamentos
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
- inventory
- lawful-basis
- lineage
related_topics:
- data-catalog
- data-lineage
jurisdiction:
- CL
legal_basis:
- law: ley-19628
  article: '3'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Licitud y lealtad (a): el responsable acredita la licitud. Finalidad (b): fines específicos, explícitos y lícitos, con sus excepciones.
    Proporcionalidad (c): solo los datos necesarios, adecuados y pertinentes, y solo mientras se necesiten.'
  implication: Registro de actividades consultable, alerta ante usos que no calzan con una actividad y campos necesarios por finalidad.
- law: ley-19628
  article: '12'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: Consentimiento libre, informado, específico, previo e inequívoco; revocable; el responsable lo prueba.
  implication: Registro de consentimientos vinculado a la actividad, con versión del texto y fecha.
- law: ley-19628
  article: '13'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Otras bases: obligaciones económicas, obligación legal, contrato, interés legítimo y defensa de un derecho.'
  implication: Una base por actividad; el interés legítimo, con su justificación.
- law: ley-19628
  article: 14 ter
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Información pública: categorías de datos, titulares, destinatarios, finalidades y base (d), transferencias (h), plazo (i), fuente (j)
    y decisiones automatizadas (l).'
  implication: El registro genera el insumo de la política, que privacidad revisa antes de publicar.
- law: ley-19628
  article: '16'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Datos sensibles: consentimiento expreso, salvo las excepciones del artículo.'
  implication: Un dato sensible con otra base se deriva a revisión.
- law: ley-19628
  article: 34 ter
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: 'Infracciones graves: tratar sin base o con una finalidad distinta (a) y tratar datos innecesarios (c).'
  implication: Un uso no registrado es una alerta que se revisa, no una infracción que se presume.
- law: ley-19628
  article: '49'
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  note: Modelo de prevención de infracciones, voluntario; la letra c pide identificar el tipo de información, el ámbito territorial, las bases
    de datos y los titulares.
  implication: Quien adopta el modelo desarrolla su registro con los contenidos del Decreto 662, art. 3 letra d).
sources:
- source: diario-oficial-cl
  url: https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf
  accessed: '2026-11-15'
  label: Diario Oficial
  page_title: LEY NÚM. 21.719 REGULA LA PROTECCIÓN Y EL TRATAMIENTO DE LOS DATOS PERSONALES Y CREA LA AGENCIA DE PROTECCIÓN DE DATOS PERSONALES
  note: 'Ley 21.719 publicada en el Diario Oficial núm. 44.023, viernes 13 de diciembre de 2024 (CVE 2583630). Páginas que citan los enlaces de
    la ficha, verificadas el 2026-11-15 contra el texto del PDF (34 páginas): art. 3 letras a, b y c (pág. 3), art. 12 (pág. 7), art. 13 letra
    d (pág. 8), art. 14 ter (pág. 9), art. 16 (pág. 12), art. 34 ter letras a y c (pág. 24) y art. 49 letra c (pág. 30). Rigen desde el 2026-12-01.'
- source: bcn-leychile
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
  accessed: '2026-11-15'
  label: versión desde el 2026-12-01
  page_title: Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES · Con Vigencia Diferida por Fecha - 01-DIC-2026
  note: 'Ley 19.628 en la versión «Con Vigencia Diferida por Fecha - 01-DIC-2026» (última modificación: Ley 21.719), consultada el 2026-11-15.
    Arts. 1 bis, 3 letras a, b y c, 12, 13 letras a a e, 14 letra a, 14 ter letras d, h, i, j y l, 16, 27 y 34 ter letras a y c, verificados contra
    lo que dice la ficha. Fuera del modelo de prevención (arts. 49 a 53), el texto no impone llevar un registro de actividades de tratamiento:
    los deberes cercanos son acreditar la licitud (arts. 3 a, 12, 13 y 14 a) y publicar la información del art. 14 ter.'
- source: bcn-leychile
  url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idParte=10528059&idVersion=2026-12-01
  accessed: '2026-11-17'
  label: art. 14 ter
  page_title: Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES · Artículo 14 ter
  note: 'Enlace directo al art. 14 ter («Deber de información y transparencia») en la versión con vigencia desde el 2026-12-01: el idParte se
    tomó del árbol de la norma en BCN y se comprobó en un navegador el 2026-11-17. Si BCN cambia el identificador, el enlace cae en la norma completa.'
- source: bcn-leychile
  url: https://www.bcn.cl/leychile/navegar?idNorma=1227971
  accessed: '2026-11-15'
  label: Decreto 662
  page_title: Decreto 662 APRUEBA REGLAMENTO QUE REGULA LOS REQUISITOS, MODALIDADES Y PROCEDIMIENTOS PARA LA IMPLEMENTACIÓN, CERTIFICACIÓN, REGISTRO
    Y SUPERVISIÓN DE LOS MODELOS DE PREVENCIÓN DE INFRACCIONES A QUE SE REFIERE EL ARTÍCULO 49 QUE INCORPORA LA LEY N° 21.719 A LA LEY N° 19.628
  note: 'Decreto 662 del Ministerio de Hacienda, promulgado el 2025-06-13 y publicado el 2026-09-09, consultado el 2026-11-15. Art. 1: el modelo
    de prevención es voluntario y no obsta al deber general de cumplir la ley. Art. 3 letra d): la caracterización de actividades de tratamiento
    con once contenidos (i a xi), transcritos en la ficha.'
- source: bcn-leychile
  url: https://www.bcn.cl/leychile/navegar?idNorma=1227971&idParte=10609555
  accessed: '2026-11-17'
  label: art. 3
  page_title: Decreto 662 · Artículo 3
  note: 'Enlace directo al art. 3 del Decreto 662 («Requisitos del programa de cumplimiento»): el idParte se tomó del árbol de la norma en BCN
    y se comprobó en un navegador el 2026-11-17.'
- source: gcp-knowledge-catalog-docs
  url: https://docs.cloud.google.com/knowledge-catalog/docs/about-data-lineage
  accessed: '2026-11-17'
  page_title: About data lineage
  note: 'About data lineage (Knowledge Catalog), consultada el 2026-11-17: BigQuery, Dataflow y otros servicios informan linaje automáticamente;
    «All lineage information is retained in the system for only 30 days»; el linaje de columnas solo cubre columnas de primer nivel de tablas
    de BigQuery.'
- source: gcp-bigquery-docs
  url: https://docs.cloud.google.com/bigquery/docs/information-schema-jobs-by-organization
  accessed: '2026-11-17'
  page_title: JOBS_BY_ORGANIZATION view
  note: 'JOBS_BY_ORGANIZATION view, consultada el 2026-11-17: por trabajo, user_email (correo o cuenta de servicio) y referenced_tables, que «Only
    populated for query jobs that are not cache hits».'
- source: aws-datazone-docs
  url: https://docs.aws.amazon.com/datazone/latest/userguide/datazone-data-lineage.html
  accessed: '2026-11-17'
  page_title: Data lineage in Amazon DataZone
  note: 'Data lineage in Amazon DataZone, consultada el 2026-11-17: captura automática desde AWS Glue y Amazon Redshift, compatible con eventos
    OpenLineage. La página no indica la retención.'
- source: aws-lake-formation-docs
  url: https://docs.aws.amazon.com/lake-formation/latest/dg/logging-using-cloudtrail.html
  accessed: '2026-11-17'
  page_title: Logging AWS Lake Formation API calls using AWS CloudTrail
  note: 'Logging AWS Lake Formation API calls using AWS CloudTrail, consultada el 2026-11-17: GetDataAccess se registra cuando un principal o
    un servicio integrado pide credenciales temporales; cada s3:GetObject se corresponde con un GetDataAccess, y para verlo hay que activar los
    eventos de datos de S3 en CloudTrail, con costo adicional. Los catálogos federados de Amazon Redshift no generan GetDataAccess.'
- source: azure-databricks-docs
  url: https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/data-lineage
  accessed: '2026-11-17'
  page_title: Lineage in Unity Catalog
  note: 'Lineage in Unity Catalog (Azure Databricks), consultada el 2026-11-17: linaje hasta el nivel de columna; las tablas de sistema de linaje
    (system.access.table_lineage y system.access.column_lineage) guardan una ventana móvil de 395 días.'
- source: azure-databricks-docs
  url: https://learn.microsoft.com/en-us/azure/databricks/admin/system-tables/audit-logs
  accessed: '2026-11-17'
  page_title: Audit log system table reference
  note: 'Audit log system table reference (Azure Databricks), consultada el 2026-11-17: system.access.audit registra user_identity y action_name
    (por ejemplo getTable).'
relations:
- type: PART_OF
  target: chile-data-protection
  note: Ficha padre del dominio.
- type: RELATED_TO
  target: data-catalog
  note: Donde viven las actividades y sus tags.
- type: RELATED_TO
  target: data-lineage
  note: Usos observados de cada activo.
- type: RELATED_TO
  target: pii-identification
  note: Qué activos tienen datos personales.
- type: RELATED_TO
  target: data-subject-rights-pipeline
  note: El acceso se responde por actividad.
- type: RELATED_TO
  target: retention-and-erasure
  note: El plazo viene de la actividad.
- type: RELATED_TO
  target: dpia-and-automated-decisions
  note: Las actividades con perfiles o gran escala piden evaluación.
- type: RELATED_TO
  target: processors-and-international-transfers
  note: Destinatarios y transferencias de cada actividad.
- type: RELATED_TO
  target: privacy-controls-as-code
  note: La conciliación como control automatizado.
views:
  reading:
    legal_basis_panel: false
    break_identifiers: true
  section_splits:
  - section: 1
    key: ley
    title: Qué exige la ley
  section_titles:
  - section: 1
    title: Propósito
  - section: 2
    title: Qué es
  - section: 3
    title: Problema que resuelve
  - section: 4
    title: Cómo funciona
  - section: 5
    title: Cuándo usarlo
  - section: 9
    title: Arquitectura
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
  notes:
    idea-central:
      lead: Idea central
      tone: key
      text: La finalidad y su fundamento pertenecen al tratamiento concreto, no a la tabla. Una tabla puede participar en varias actividades,
        y compartirla no autoriza todos sus usos.
    sin-formato:
      lead: La ley no exige este formato.
      text: El registro es evidencia de apoyo para acreditar la licitud, la finalidad y el plazo, no prueba suficiente por sí solo. El modelo
        de prevención de infracciones es voluntario y no sustituye el deber general de cumplir la ley (art. 49 de la Ley 19.628, texto modificado
        por la Ley 21.719, y art. 1 del [Decreto 662](https://www.bcn.cl/leychile/navegar?idNorma=1227971)).
    muchos-a-muchos:
      lead: Muchos a muchos.
      text: 'Una actividad usa varios activos y un activo sirve a varias actividades; lo mismo con los consumidores. Por eso un único `legal_basis`
        pegado a la tabla no alcanza: `silver.pasajeros` sirve aquí a tres actividades: una con base contrato, otra con consentimiento y otra
        aún sin evaluar.'
    alerta:
      lead: Una alerta no es una infracción.
      text: 'Tratar datos sin base, con una finalidad distinta o datos innecesarios es infracción grave [(art. 34 ter letras a y c)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=24).
        Pero la falta de un registro no demuestra por sí sola ese supuesto: obliga a revisar los hechos con el área competente. Por eso el control
        la muestra como brecha y la deriva a revisión, sin calificarla.'
    equivalencias:
      lead: No son equivalencias exactas.
      text: Ningún servicio certifica cumplimiento por sí solo. Documentación consultada el 2026-11-12; las filas de linaje y auditoría se volvieron
        a verificar el 2026-11-17.
    dominio:
      lead: Criterio de dominio.
      text: Dominas esta ficha si puedes explicar por qué una tabla no tiene una única base de licitud, cómo asociarías un DAG a una actividad
        aprobada, qué demuestran los logs y el linaje y qué no, y cómo actuarías ante un consumidor no registrado.
  chips:
    ficha-madre:
      label: 'En la ficha madre:'
      items:
      - kind: Cómo funciona
        label: ¿Para qué los necesito?
        href: /concepts/chile-data-protection/#como-funciona-02
      - kind: Matriz
        label: Finalidad
        href: /concepts/chile-data-protection/#matriz-finalidad
  build_cards:
    title: Lo que construyes con esta ficha
    items:
    - title: Registro de actividades
      text: Cada actividad con su finalidad, base, plazo, datos, destinatarios y aprobación, versionada y consultable.
    - title: Vínculo con la plataforma
      text: 'Cada actividad enlazada a sus activos, a los campos que necesita y a los consumidores que la usan: jobs, dashboards, modelos o APIs.'
    - title: Dos controles automáticos
      text: Una puerta en la CI que bloquea despliegues sin actividad vigente, y una conciliación que alerta cuando lo que corre no calza con
        el registro.
  law_ladder:
    headers:
    - Pregunta
    - Lo que se espera
    - El registro
    rows:
    - question: ¿Para qué?
      principle: Finalidad
      cites:
      - '[(art. 3 letra b)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=3)'
      expected: Fines específicos, explícitos y lícitos. Otro fin solo si es compatible con el original, si lo justifica una relación contractual
        o precontractual, si el titular vuelve a consentir o si lo dispone la ley.
      record: Se anota en **Finalidad** y en **Activos y consumidores**. Un uso que no calza con ninguna actividad aparece como alerta.
    - question: ¿Con qué fundamento?
      principle: Licitud y base
      cites:
      - '[(art. 3 letra a)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=3)'
      - '[(art. 12)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=7)'
      - '[(art. 13)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=8)'
      - '[(art. 16)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=12)'
      expected: 'Solo de manera lícita y leal, y el responsable debe poder acreditarlo. La base es el consentimiento (libre, informado, específico
        por finalidad, previo, inequívoco y revocable) u otra fuente: obligaciones económicas, obligación legal, contrato, interés legítimo o
        defensa de un derecho. Los datos sensibles requieren consentimiento expreso, salvo las excepciones que establece la ley.'
      record: Se anota en **Base de licitud** y en **Aprobación y versión**. Así se sabe qué base regía en cada fecha y dónde está el registro
        de consentimientos por finalidad y versión del texto.
    - question: ¿Qué datos y hasta cuándo?
      principle: Proporcionalidad
      cites:
      - '[(art. 3 letra c)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=3)'
      expected: 'Solo los datos necesarios, adecuados y pertinentes para los fines, y solo mientras se necesiten para cumplirlos; después se suprimen
        o anonimizan. La ley no fija un plazo general: lo define el responsable según la finalidad, salvo que otra ley fije uno, y conservar por
        más tiempo requiere autorización legal o consentimiento del titular.'
      record: Se anota en **Activos y consumidores** y en **Plazo o condición de supresión**. Cada finalidad declara los campos que necesita y
        un plazo declarado.
    - question: ¿Qué se publica?
      principle: Información pública
      cites:
      - '[(art. 14 ter)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=9)'
      expected: Categorías de datos, titulares, destinatarios, finalidades y base (letra d); transferencias (h); plazo (i); fuente (j); decisiones
        automatizadas (l).
      record: Se anota en **Tipo de datos**, **Titulares**, **Destinatarios**, **Finalidad**, **Base de licitud**, **Transferencias internacionales**,
        **Plazo o condición de supresión**, **Fuente** y **Decisiones automatizadas**. Con eso se genera el insumo para la política, que privacidad
        revisa antes de publicar.
    - question: ¿Y si un uso no calza?
      principle: Infracción grave
      cites:
      - '[(art. 34 ter)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=24)'
      expected: Tratar datos sin base o con una finalidad distinta (letra a), o tratar datos innecesarios para los fines (letra c).
      record: Un uso sin actividad registrada es una alerta que se revisa, no una infracción que se presume.
      risk: true
  register_fields:
    title: Campos del registro y de dónde viene cada uno
    intro: '**Lo que se propone**: la ley no define un formato de registro. Estos campos ordenan lo que pide el [art. 14 ter](https://www.bcn.cl/leychile/navegar?idNorma=141599&idParte=10528059&idVersion=2026-12-01)
      y, para quien adopta el modelo de prevención voluntario, el [Decreto 662](https://www.bcn.cl/leychile/navegar?idNorma=1227971&idParte=10609555).
      Con **Documento propuesto** ves la ficha completa del caso elegido.'
    legend:
      norm:
        title: Fuente en la norma
        text: Art. 14 ter (información que se publica) y Decreto 662 (modelo voluntario), en un mismo modal.
      proposal:
        title: Lo propuesto
        text: Campos o interpretaciones que no vienen de la norma.
      document:
        title: Documento propuesto
        action: Exportar actividad de tratamiento
    case_label: Casos de ejemplo
    state_label: Estado del caso
    counters:
      complete: Campos completos
      pending: Sin evaluar
      review: Para revisión
    headers:
    - Campo
    - Caso de ejemplo
    - Fuente
    literal:
      law_source: Ley 19.628, texto modificado por la Ley 21.719, art. 14 ter, letra {letter} · texto literal
      law_intro: 'Deber de información y transparencia. El responsable de datos debe facilitar y mantener permanentemente a disposición del público,
        en su sitio web o en cualquier otro medio de información equivalente, al menos, la siguiente información:'
      law:
        d: Las categorías, clases o tipos de datos que trata; la descripción genérica del universo de personas que comprenden sus bases de datos;
          los destinatarios a los que se prevé comunicar o ceder los datos; las finalidades de los tratamientos que realiza; la base de legitimidad
          del tratamiento; y en caso de tratamientos que se basan en la satisfacción de intereses legítimos, cuáles serían éstos.
        h: En su caso, la transferencia de datos personales a un tercer país u organización internacional y si éstos ofrecen o no un nivel adecuado
          de protección. En caso de que no cuenten con un nivel adecuado de protección, se deberá informar si existen garantías que justifiquen
          tal transferencia.
        i: El periodo durante el que se conservarán los datos personales.
        j: La fuente de la cual provienen los datos personales y, en su caso, si proceden de fuentes de acceso público.
        l: La existencia de decisiones automatizadas, incluida la elaboración de perfiles. En tales casos, información significativa sobre la
          lógica aplicada, así como las consecuencias previstas de dicho tratamiento para el titular.
      decree_source: Decreto 662, de 2025 (Ministerio de Hacienda), art. 3 letra d), contenido {roman} · texto literal
      decree_intro: 'La caracterización de actividades de tratamiento deberá contener, a lo menos, la siguiente información:'
      decree:
        i: El tipo de datos personales que el responsable trata, indicando si incluye datos personales sensibles o datos que se encuentren dentro
          de las categorías especiales de datos que establece la ley.
        ii: El ámbito territorial en que el responsable realiza el tratamiento de datos personales, de conformidad con lo establecido en el artículo
          1° bis de la ley N° 19.628.
        iii: Las categorías, clases o tipos de bases de datos que administra.
        iv: La caracterización de las categorías de titulares de los datos personales que la entidad trata.
        v: Los fines de las operaciones de tratamiento que realiza.
        vi: La fuente de la cual provienen los datos personales y, en su caso, si proceden de fuentes de acceso público.
        vii: La base de licitud del tratamiento, y el interés legítimo cuando el tratamiento se base en lo dispuesto en el literal d) del artículo
          13 de la ley N° 19.628.
        viii: Las categorías de terceros a quienes se prevé comunicar o ceder los datos personales, incluidos los destinatarios en terceros países
          u organizaciones internacionales.
        ix: La existencia de operaciones de transferencia internacional de datos, la identificación de dicho tercer país u organización internacional,
          y los medios a través de los que se da cumplimiento a lo dispuesto en el artículo 27 de la ley N° 19.628.
        x: Los plazos o condiciones previstos para la supresión de las diferentes categorías de datos.
        xi: La existencia de decisiones automatizadas, incluida la elaboración de perfiles. Si el responsable realizare estas operaciones, deberá
          incluir información significativa sobre la lógica aplicada, así como las consecuencias previstas de dicho tratamiento para el titular.
      decree_note: El modelo de prevención es voluntario y no sustituye el deber general de cumplir la ley.
      art_49c: La identificación del tipo de información que la entidad trata, el ámbito territorial en que opera, la categoría, clase o tipos
        de datos o bases de datos que administra, y la caracterización de los titulares de datos.
      art_49c_link: 'En la ley, el art. 49 letra c de la Ley 19.628, texto modificado por la Ley 21.719, pide (texto literal): «{quote}» [(art.
        49 letra c)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=30)'
    fields:
    - id: tipo-de-datos
      key: tipo
      name: Tipo de datos
      why: Qué datos se tratan y si entre ellos hay sensibles.
      code: Actividad.categorias · Actividad.categorias_sensibles
      check: que un dato sensible declarado con una base distinta del consentimiento pase a revisión (art. 16)
      limit: que haya categorías declaradas ni que la lista de sensibles esté completa; eso lo aporta la ficha de identificación de datos personales
      sheet_section: Datos
      law_letter: d
      decree: i
      art_49c: del tipo de información que la entidad trata
    - id: ambito-territorial
      key: ambito
      name: Ámbito territorial
      why: Dónde opera el tratamiento. Se declara una vez por registro.
      code: Registro.ambito_territorial
      check: que el registro lo declare; si falta, **registro sin ámbito territorial**
      limit: que el ámbito declarado sea el correcto
      sheet_section: Encabezado
      decree: ii
      art_49c: el ámbito territorial en que opera
    - id: categorias-de-bases-de-datos
      key: bases
      name: Categorías de bases de datos
      why: Qué bases participan; aquí se modelan como activos (tablas).
      code: Actividad.activos
      check: que cada tabla con datos personales esté cubierta por alguna actividad (**tabla con PII sin actividad**) y que cada uso observado
        lea un activo que su actividad declara
      limit: que los activos equivalgan a categorías de bases de datos
      sheet_section: Datos
      decree: iii
      art_49c: la categoría, clase o tipos de datos o bases de datos que administra
      proposal: 'El Decreto pide categorías de bases de datos. Aquí se modelan con los activos (tablas): es una aproximación de esta plataforma,
        no una definición de la norma.'
      proposal_label: Lo propuesto
    - id: titulares
      key: titulares
      name: Titulares
      why: A quiénes se refieren los datos.
      code: Actividad.titulares
      check: que estén declarados; si no, **sin categorías de titulares**
      limit: que sean todas las categorías reales
      sheet_section: Datos
      law_letter: d
      decree: iv
      art_49c: la caracterización de los titulares de datos
    - id: finalidad
      key: finalidad
      name: Finalidad
      why: Para qué se tratan. Es la clave del registro.
      code: Actividad.finalidad
      check: 'que exista: es obligatoria en el tipo Actividad. La conciliación cruza consumidor y activo, no el texto de la finalidad'
      limit: 'que la finalidad sea lícita o compatible con la original: lo decide privacidad'
      sheet_section: Actividad
      law_letter: d
      decree: v
    - id: fuente
      key: fuente
      name: Fuente
      why: De dónde vienen los datos y si son de acceso público.
      code: Actividad.fuente · Actividad.acceso_publico
      check: que estén declaradas la fuente y si es de acceso público; si no, **fuente de los datos sin evaluar**
      limit: que la fuente declarada sea cierta
      sheet_section: Datos
      law_letter: j
      decree: vi
    - id: base-de-licitud
      key: base
      name: Base de licitud
      why: Con qué fundamento; si es interés legítimo, con su justificación.
      code: Actividad.base · Actividad.justificacion_interes_legitimo
      check: que una actividad aprobada tenga base, que el interés legítimo tenga justificación, que la base consentimiento tenga registro de
        consentimientos y que un dato sensible con otra base pase a revisión
      limit: que la base elegida sea la correcta ni que el consentimiento haya sido expreso
      sheet_section: Actividad
      law_letter: d
      decree: vii
    - id: destinatarios
      key: destinatarios
      name: Destinatarios
      why: Quién más recibe los datos, incluidos terceros países.
      code: Actividad.destinatarios
      check: 'nada: una lista vacía se publica como **ninguno**'
      limit: que la lista esté completa ni que exista un contrato con cada destinatario
      sheet_section: Comunicación de los datos
      law_letter: d
      decree: viii
    - id: transferencias-internacionales
      key: transf
      name: Transferencias internacionales
      why: 'Si salen del país: a dónde y con qué mecanismo.'
      code: Actividad.transferencias
      check: 'que esté evaluado: vacío es **ninguna**; sin evaluar es brecha'
      limit: el país ni que el mecanismo cumpla el art. 27
      sheet_section: Comunicación de los datos
      law_letter: h
      decree: ix
    - id: plazo-o-condicion-de-supresion
      key: plazo
      name: Plazo o condición de supresión
      why: Hasta cuándo, en meses o con una condición.
      code: Actividad.plazo_meses · Actividad.plazo_condicion
      check: que haya meses o una condición; si no, **sin plazo de conservación**
      limit: que el plazo esté justificado
      sheet_section: Conservación
      law_letter: i
      decree: x
    - id: decisiones-automatizadas
      key: decisiones
      name: Decisiones automatizadas
      why: Si hay decisiones automatizadas o perfilamiento.
      code: Actividad.decisiones_automatizadas
      check: 'que esté evaluado: vacío es **ninguna**; sin evaluar es brecha'
      limit: que la lógica y las consecuencias descritas sean suficientes
      sheet_section: Decisiones automatizadas
      law_letter: l
      decree: xi
    - id: activos-y-consumidores
      key: activos
      name: Activos y consumidores
      why: Qué jobs, dashboards o servicios usan la actividad y qué campos necesitan. Permite conciliar con lo que corre.
      code: Actividad.consumidores · Actividad.campos
      check: que cada consumo observado venga de un consumidor declarado en una actividad vigente y lea solo los campos declarados, y que la puerta
        de la CI exija un consumidor declarado
      limit: usos que no dejan huella en el linaje ni en los logs
      sheet_section: Activos y consumidores
      proposal: La norma no pide vincular la actividad con lo que corre. Lo agregamos porque sin ese vínculo el registro no se puede comparar
        con la realidad.
      proposal_label: Lo propuesto
    - id: aprobacion-y-version
      key: aprob
      name: Aprobación y versión
      why: Quién aprobó, hasta cuándo y con qué registro de consentimientos.
      code: Actividad.aprobacion · Actividad.consentimientos
      check: que la aprobación no esté vencida, que solo las actividades vigentes entren al insumo y pasen la puerta de la CI, y que la base consentimiento
        tenga registro de consentimientos
      limit: 'que quien aprobó tuviera la facultad, ni el historial de versiones: el código no guarda versiones'
      sheet_section: Aprobación y versión
      proposal: La norma no pide versionar aprobaciones. Lo agregamos para saber qué regía en cada fecha y para que una aprobación vencida no
        pase inadvertida.
      proposal_label: Lo propuesto
    platform:
      title: En esta plataforma
      code: 'Campo en código:'
      check: 'El código verifica:'
      limit: 'No valida:'
      example: 'Caso de ejemplo ({case}, {state}):'
    labels:
      unevaluated: '[sin evaluar]'
      sheet_pending: Pendiente de evaluación
      live: Mostrando {n} de {total} campos
      empty: Ningún campo con este filtro.
      close: Cerrar
      norm_button: Ver la norma de {name}
      proposal_button: Ver lo propuesto de {name}
      proposal_suffix: no viene de la norma
      law_tab: Art. 14 ter · letra {letter}
      decree_tab: Decreto 662 · {roman}
    sheet:
      kicker: Registro de actividades de tratamiento
      sections:
      - Actividad
      - Datos
      - Comunicación de los datos
      - Conservación
      - Decisiones automatizadas
      - Activos y consumidores
      - Aprobación y versión
      responsible:
        label: Responsable
        value: Aerolínea de ejemplo S.A.
      delegate:
        label: Delegado
        value: por designar
      print: Imprimir o guardar PDF
      preview: Extracción PDF · vista previa
      footer: Documento interno. Generado desde el registro de actividades · {code} · {version} · generado el {date} · página 1 de 1. Caso de
        ejemplo · {case}.
    # inicio del bloque generado por scripts/generators/inventory_views.py: no editar a mano
    cases:
    - key: venta_pasajes
      name: Emitir y gestionar pasajes
      states:
        actual:
          values:
            tipo: 'Identificación, contacto, itinerario · sensibles: ninguno'
            ambito: null
            bases: silver.pasajeros, silver.reservas
            titulares: Pasajeros, compradores
            finalidad: Emitir y gestionar pasajes
            fuente: 'El propio comprador, al reservar · acceso público: no'
            base: Contrato (art. 13 letra c)
            destinatarios: Aerolíneas socias
            transf: Argentina · cláusulas contractuales con garantías adecuadas
            plazo: 60 meses
            decisiones: Ninguna
            activos: 'dag_reservas · campos: correo, fecha, nombre, pasajero_id, vuelo'
            aprob: Aprobada 2026-01-15 · vence 2027-01-15
          status:
            tipo: ok
            ambito: pending
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: ok
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: venta_pasajes
            version: v1
            state: Vigente
            title: Emitir y gestionar pasajes
            territory: null
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Emitir y gestionar pasajes
                field: finalidad
              - label: Base de licitud
                value: Contrato
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Identificación, contacto, itinerario
                field: tipo-de-datos
              - label: Datos sensibles
                value: 'No'
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.pasajeros, silver.reservas (tablas)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros, compradores
                field: titulares
              - label: Fuente
                value: El propio comprador, al reservar
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Aerolíneas socias
                field: destinatarios
              - label: Transferencias internacionales · país
                value: Argentina
                field: transferencias-internacionales
              - label: Transferencias internacionales · mecanismo
                value: cláusulas contractuales con garantías adecuadas
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 60 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.pasajeros, silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_reservas
                field: activos-y-consumidores
              - label: Campos necesarios
                value: correo, fecha, nombre, pasajero_id, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-01-15'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-01-15'
                field: aprobacion-y-version
              - label: Versión
                value: v1
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
        corregido:
          values:
            tipo: 'Identificación, contacto, itinerario · sensibles: ninguno'
            ambito: 'Chile: pasajeros que compran en Chile, también desde el extranjero'
            bases: silver.pasajeros, silver.reservas
            titulares: Pasajeros, compradores
            finalidad: Emitir y gestionar pasajes
            fuente: 'El propio comprador, al reservar · acceso público: no'
            base: Contrato (art. 13 letra c)
            destinatarios: Aerolíneas socias
            transf: Argentina · cláusulas contractuales con garantías adecuadas
            plazo: 60 meses
            decisiones: Ninguna
            activos: 'dag_reservas, dashboard_externo, job_conciliacion · campos: correo, fecha, nombre, pasajero_id, vuelo'
            aprob: Aprobada 2026-01-15 · vence 2027-01-15
          status:
            tipo: ok
            ambito: ok
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: ok
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: venta_pasajes
            version: v2
            state: Vigente
            title: Emitir y gestionar pasajes
            territory: Chile
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Emitir y gestionar pasajes
                field: finalidad
              - label: Base de licitud
                value: Contrato
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Identificación, contacto, itinerario
                field: tipo-de-datos
              - label: Datos sensibles
                value: 'No'
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.pasajeros, silver.reservas (tablas)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros, compradores
                field: titulares
              - label: Fuente
                value: El propio comprador, al reservar
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Aerolíneas socias
                field: destinatarios
              - label: Transferencias internacionales · país
                value: Argentina
                field: transferencias-internacionales
              - label: Transferencias internacionales · mecanismo
                value: cláusulas contractuales con garantías adecuadas
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 60 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.pasajeros, silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_reservas, dashboard_externo, job_conciliacion
                field: activos-y-consumidores
              - label: Campos necesarios
                value: correo, fecha, nombre, pasajero_id, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-01-15'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-01-15'
                field: aprobacion-y-version
              - label: Versión
                value: v2
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
    - key: asistencia_especial
      name: Asistencia en aeropuerto
      states:
        actual:
          values:
            tipo: 'Identificación, salud · sensibles: salud'
            ambito: null
            bases: silver.reservas
            titulares: Pasajeros
            finalidad: Asistencia en aeropuerto a pasajeros con movilidad reducida
            fuente: 'El propio pasajero, al pedir la asistencia · acceso público: no'
            base: Contrato (art. 13 letra c)
            destinatarios: Operador de aeropuerto
            transf: Ninguna
            plazo: 12 meses
            decisiones: Ninguna
            activos: 'dag_asistencia · campos: pasajero_id, tipo_asistencia, vuelo'
            aprob: Aprobada 2026-03-01 · vence 2027-03-01
          status:
            tipo: ok
            ambito: pending
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: review
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: asistencia_especial
            version: v1
            state: En revisión
            title: Asistencia en aeropuerto a pasajeros con movilidad reducida
            territory: null
            note: 'Pendiente de revisión por privacidad: Base de licitud.'
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Asistencia en aeropuerto a pasajeros con movilidad reducida
                field: finalidad
              - label: Base de licitud
                value: Contrato
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Identificación, salud
                field: tipo-de-datos
              - label: Datos sensibles
                value: Sí · salud
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.reservas (tabla)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros
                field: titulares
              - label: Fuente
                value: El propio pasajero, al pedir la asistencia
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Operador de aeropuerto
                field: destinatarios
              - label: Transferencias internacionales
                value: Ninguna
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 12 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_asistencia
                field: activos-y-consumidores
              - label: Campos necesarios
                value: pasajero_id, tipo_asistencia, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-03-01'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-03-01'
                field: aprobacion-y-version
              - label: Versión
                value: v1
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
        corregido:
          values:
            tipo: 'Identificación, salud · sensibles: salud'
            ambito: 'Chile: pasajeros que compran en Chile, también desde el extranjero'
            bases: silver.reservas
            titulares: Pasajeros
            finalidad: Asistencia en aeropuerto a pasajeros con movilidad reducida
            fuente: 'El propio pasajero, al pedir la asistencia · acceso público: no'
            base: Consentimiento (art. 12; art. 16, expreso)
            destinatarios: Operador de aeropuerto
            transf: Ninguna
            plazo: 12 meses
            decisiones: Ninguna
            activos: 'dag_asistencia · campos: pasajero_id, tipo_asistencia, vuelo'
            aprob: Aprobada 2026-03-01 · vence 2027-03-01 · consentimientos salud-v1 desde 2026-10-15
          status:
            tipo: ok
            ambito: ok
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: ok
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: asistencia_especial
            version: v2
            state: Vigente
            title: Asistencia en aeropuerto a pasajeros con movilidad reducida
            territory: Chile
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Asistencia en aeropuerto a pasajeros con movilidad reducida
                field: finalidad
              - label: Base de licitud
                value: Consentimiento (consentimiento expreso)
                field: base-de-licitud
              - label: Registro de consentimientos
                value: salud-v1, desde 2026-10-15
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Identificación, salud
                field: tipo-de-datos
              - label: Datos sensibles
                value: Sí · salud
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.reservas (tabla)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros
                field: titulares
              - label: Fuente
                value: El propio pasajero, al pedir la asistencia
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Operador de aeropuerto
                field: destinatarios
              - label: Transferencias internacionales
                value: Ninguna
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 12 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_asistencia
                field: activos-y-consumidores
              - label: Campos necesarios
                value: pasajero_id, tipo_asistencia, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-03-01'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-03-01'
                field: aprobacion-y-version
              - label: Versión
                value: v2
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
    - key: encuesta_post_vuelo
      name: Medir la satisfacción
      states:
        actual:
          values:
            tipo: 'Contacto, itinerario · sensibles: ninguno'
            ambito: null
            bases: silver.reservas
            titulares: Pasajeros
            finalidad: Medir la satisfacción después del vuelo
            fuente: 'La reserva · acceso público: no'
            base: 'Interés legítimo (art. 13 letra d) · justificación: [sin evaluar]'
            destinatarios: Ninguno
            transf: Ninguna
            plazo: 12 meses
            decisiones: Ninguna
            activos: 'dag_encuestas · campos: correo, pasajero_id, vuelo'
            aprob: Aprobada 2026-05-01 · vence 2027-05-01
          status:
            tipo: ok
            ambito: pending
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: pending
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: encuesta_post_vuelo
            version: v1
            state: En revisión
            title: Medir la satisfacción después del vuelo
            territory: null
            note: 'Pendiente de revisión por privacidad: Base de licitud.'
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Medir la satisfacción después del vuelo
                field: finalidad
              - label: Base de licitud
                value: Interés legítimo
                field: base-de-licitud
              - label: Justificación del interés legítimo
                value: null
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Contacto, itinerario
                field: tipo-de-datos
              - label: Datos sensibles
                value: 'No'
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.reservas (tabla)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros
                field: titulares
              - label: Fuente
                value: La reserva
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Ninguno
                field: destinatarios
              - label: Transferencias internacionales
                value: Ninguna
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 12 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_encuestas
                field: activos-y-consumidores
              - label: Campos necesarios
                value: correo, pasajero_id, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-05-01'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-05-01'
                field: aprobacion-y-version
              - label: Versión
                value: v1
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
        corregido:
          values:
            tipo: 'Contacto, itinerario · sensibles: ninguno'
            ambito: 'Chile: pasajeros que compran en Chile, también desde el extranjero'
            bases: silver.reservas
            titulares: Pasajeros
            finalidad: Medir la satisfacción después del vuelo
            fuente: 'La reserva · acceso público: no'
            base: 'Interés legítimo (art. 13 letra d) · justificación: mejorar el servicio; el pasajero puede oponerse en cada encuesta'
            destinatarios: Ninguno
            transf: Ninguna
            plazo: 12 meses
            decisiones: Ninguna
            activos: 'dag_encuestas · campos: correo, pasajero_id, vuelo'
            aprob: Aprobada 2026-05-01 · vence 2027-05-01
          status:
            tipo: ok
            ambito: ok
            bases: ok
            titulares: ok
            finalidad: ok
            fuente: ok
            base: ok
            destinatarios: ok
            transf: ok
            plazo: ok
            decisiones: ok
            activos: ok
            aprob: ok
          sheet:
            code: encuesta_post_vuelo
            version: v2
            state: Vigente
            title: Medir la satisfacción después del vuelo
            territory: Chile
            sections:
            - title: Actividad
              rows:
              - label: Finalidad
                value: Medir la satisfacción después del vuelo
                field: finalidad
              - label: Base de licitud
                value: Interés legítimo
                field: base-de-licitud
              - label: Justificación del interés legítimo
                value: mejorar el servicio; el pasajero puede oponerse en cada encuesta
                field: base-de-licitud
            - title: Datos
              rows:
              - label: Tipo de datos
                value: Contacto, itinerario
                field: tipo-de-datos
              - label: Datos sensibles
                value: 'No'
                field: tipo-de-datos
              - label: Categorías de bases de datos
                value: silver.reservas (tabla)
                field: categorias-de-bases-de-datos
              - label: Titulares
                value: Pasajeros
                field: titulares
              - label: Fuente
                value: La reserva
                field: fuente
              - label: Fuente de acceso público
                value: 'No'
                field: fuente
            - title: Comunicación de los datos
              rows:
              - label: Destinatarios
                value: Ninguno
                field: destinatarios
              - label: Transferencias internacionales
                value: Ninguna
                field: transferencias-internacionales
            - title: Conservación
              rows:
              - label: Plazo o condición de supresión
                value: 12 meses
                field: plazo-o-condicion-de-supresion
            - title: Decisiones automatizadas
              rows:
              - label: Decisiones automatizadas
                value: 'No'
                field: decisiones-automatizadas
            - title: Activos y consumidores
              rows:
              - label: Activos
                value: silver.reservas
                field: activos-y-consumidores
              - label: Consumidores
                value: dag_encuestas
                field: activos-y-consumidores
              - label: Campos necesarios
                value: correo, pasajero_id, vuelo
                field: activos-y-consumidores
            - title: Aprobación y versión
              rows:
              - label: Fecha de aprobación
                value: '2026-05-01'
                field: aprobacion-y-version
              - label: Vence
                value: '2027-05-01'
                field: aprobacion-y-version
              - label: Versión
                value: v2
                field: aprobacion-y-version
              - label: Aprobado por
                blank: true
                field: aprobacion-y-version
              - label: Firma
                blank: true
                field: aprobacion-y-version
    # fin del bloque generado
  activity_explorer:
    lead: 'El registro de actividades de tratamiento guarda, versionado, cada uso de datos personales: para qué se usan, con qué base, qué datos,
      quién los recibe y hasta cuándo. Cada uso queda vinculado a las tablas, jobs y servicios que lo ejecutan, para comparar lo declarado con
      lo que realmente corre.'
    kinds:
    - kicker: Catálogo de datos
      question: ¿Qué datos hay y dónde?
      text: No dice para qué se usan.
    - kicker: Linaje
      question: ¿De dónde viene y a dónde va cada dato?
      text: No dice con qué base ni con qué fin.
    - kicker: Registro de actividades de tratamiento
      question: ¿Para qué, con qué base y hasta cuándo?
      text: Se apoya en los dos anteriores para vincular cada uso con lo que corre.
      highlight: true
    intro: 'Lo forman cuatro piezas que no conviene mezclar en un solo campo: actividad, activo, consumidor y evidencia. La conciliación es lo
      que el código obtiene al cruzarlas. Elige una actividad sobre `silver.pasajeros` para verlas con los datos del código de la ficha (escenario
      `actual`).'
    asset: silver.pasajeros
    rows:
      activity:
        title: Actividad
        detail: Por qué se usan los datos
      asset:
        title: Activo
        detail: Dónde están y qué columnas necesita la finalidad
      consumer:
        title: Consumidor
        detail: Quién los usa y qué leyó, según los logs
      evidence:
        title: Evidencia
        detail: Cómo se demuestra la aprobación
      result:
        title: Conciliación
        detail: Lo que reporta el código
    labels:
      pending: Sin evaluar
      needs: necesita
      read: leyó
      account: cuenta
      no_fields: Campos aún no evaluados
      gaps_one: '{n} brecha'
      gaps_many: '{n} brechas'
    # inicio del bloque generado por scripts/generators/inventory_views.py: no editar a mano
    activities:
    - key: venta_pasajes
      name: Emitir y gestionar pasajes
      purpose: Emitir y gestionar pasajes
      facts:
      - label: Base (ilustrativa)
        value: Contrato (art. 13 letra c)
      - label: Plazo
        value: 60 meses
      - label: Titulares
        value: Pasajeros, compradores
      - label: Fuente
        value: El propio comprador, al reservar; no es de acceso público
      - label: Transferencias
        value: Argentina · cláusulas contractuales con garantías adecuadas
      - label: Decisiones automatizadas
        value: Ninguna
      fields:
      - correo
      - fecha
      - nombre
      - pasajero_id
      - vuelo
      consumer: dag_reservas
      account: sa-reservas
      read:
      - column: nombre
        state: needed
      - column: pasajero_id
        state: needed
      - column: vuelo
        state: needed
      evidence: Aprobada el 2026-01-15; vence el 2027-01-15
      evidence_ok: true
      gaps: []
      ok: 'Sin hallazgos: dag_reservas lee solo columnas que su finalidad necesita.'
    - key: marketing
      name: Ofertas personalizadas
      purpose: Ofertas personalizadas
      facts:
      - label: Base (ilustrativa)
        value: Consentimiento (art. 12)
      - label: Plazo
        value: null
      - label: Titulares
        value: Pasajeros suscritos
      - label: Fuente
        value: Formulario de suscripción; no es de acceso público
      - label: Transferencias
        value: null
      - label: Decisiones automatizadas
        value: null
      fields:
      - correo
      - pasajero_id
      - preferencias
      consumer: dag_campanas
      account: sa-campanas
      read:
      - column: correo
        state: needed
      - column: rut
        state: extra
      evidence: Aprobación vencida el 2026-10-01; sin registro de consentimientos
      evidence_ok: false
      gaps:
      - 'marketing: sin plazo de conservación'
      - 'marketing: aprobación vencida el 2026-10-01'
      - 'marketing: base consentimiento sin registro de consentimientos'
      - 'marketing: transferencias internacionales sin evaluar'
      - 'marketing: decisiones automatizadas sin evaluar'
      - 'sin aprobación vigente: dag_campanas → silver.pasajeros (marketing)'
      - 'proporcionalidad: dag_campanas lee rut, no necesario para marketing'
      ok: 'Sin hallazgos: dag_campanas lee solo columnas que su finalidad necesita.'
    - key: modelo_fraude
      name: Detectar operaciones sospechosas
      purpose: Detectar operaciones sospechosas
      facts:
      - label: Base (ilustrativa)
        value: null
      - label: Plazo
        value: null
      - label: Titulares
        value: null
      - label: Fuente
        value: null
      - label: Transferencias
        value: null
      - label: Decisiones automatizadas
        value: null
      fields: []
      consumer: job_fraude
      account: sa-fraude
      read:
      - column: monto
        state: unevaluated
      - column: pasajero_id
        state: unevaluated
      - column: rut
        state: unevaluated
      evidence: 'Sin aprobación: no habilitar hasta la revisión'
      evidence_ok: false
      gaps:
      - 'sin aprobación vigente: job_fraude → silver.pasajeros (modelo_fraude)'
      ok: 'Sin hallazgos: job_fraude lee solo columnas que su finalidad necesita.'
    # fin del bloque generado
  case_compare:
    lead: 'Una tabla de pasajeros sirve para gestionar reservas. Otro equipo quiere usarla para detectar fraude y asume que, como ya está disponible,
      puede hacerlo. La disponibilidad técnica no demuestra que el nuevo fin sea compatible con el original ni que tenga una base de licitud [(art.
      3 letra b)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=3): eso hay que evaluarlo antes.'
    request:
      kicker: El pedido
      text: Usar `silver.pasajeros` en un modelo de fraude (`job_fraude`)
    headers:
    - Base asignada a la tabla
    - Con inventario
    rows:
    - label: Acceso
      without: Se le da un permiso de IAM sobre la tabla completa.
      with: 'Tiene que citar una actividad: `activity_id = modelo_fraude`.'
    - label: Despliegue
      without: Se despliega; nada lo detiene.
      with: 'La CI lo bloquea: `job_fraude → modelo_fraude: actividad no vigente`.'
    - label: Evaluación
      without: Nadie revisa si el nuevo fin es compatible con el original ni con qué base se trata.
      with: 'Privacidad evalúa compatibilidad y base (en el ejemplo, interés legítimo, que el Decreto 662 pide documentar con su justificación:
        `justificacion_interes_legitimo`) y fija campos y plazo.'
    - label: Más adelante
      without: Llega una solicitud de acceso o una vulneración, y nadie sabe que el modelo usa esos datos.
      with: El registro dice qué actividades y consumidores usan los datos, y desde cuándo.
  cycle_lanes:
    intro: 'Seis pasos, cada uno con la evidencia que deja y lo que esa evidencia no alcanza a demostrar. El caso del modelo de fraude recorre
      todos: `job_fraude` quiere leer `silver.pasajeros`.'
    labels:
      case: Caso
      evidence: Evidencia
      limit: No demuestra
    lanes:
    - title: Antes de usar
      lead: El uso se decide y se autoriza antes de que exista.
      steps:
      - number: '01'
        title: Definir
        text: 'Negocio y privacidad registran la actividad: finalidad, base, campos necesarios, plazo y destinatarios.'
        case: '`modelo_fraude` entra sin base ni plazo: queda en evaluación.'
        evidence: Versión del registro, con autor y fecha
        limit: 'Que la base elegida sea la correcta: eso lo decide privacidad.'
      - number: '02'
        title: Vincular
        text: Ingeniería asocia la actividad a activos, campos, jobs y consumidores, y propaga finalidad y plazo como etiquetas.
        case: '`job_fraude → modelo_fraude`, sobre `silver.pasajeros`.'
        evidence: Vínculo actividad–activo–consumidor
        limit: 'Que el job lea solo lo vinculado: eso se ve en 04.'
      - number: '03'
        title: Autorizar
        text: Antes de dar acceso o desplegar, la CI verifica que la actividad exista, esté vigente y declare al consumidor.
        case: '`despliegue bloqueado: job_fraude → modelo_fraude: actividad no vigente`'
        evidence: Resultado de la puerta en la CI
        limit: Los accesos que no pasan por la CI, como una consulta ad hoc.
    - title: Mientras corre
      lead: Lo que corre se compara con lo registrado.
      steps:
      - number: '04'
        title: Observar
        text: El linaje y los logs de acceso muestran qué identidad leyó qué activo y, según la plataforma, qué columnas. El alcance de cada nube
          se compara en **En la nube**.
        case: '`sa-fraude` lee `pasajero_id`, `rut` y `monto` de `silver.pasajeros`.'
        evidence: Ejecuciones y accesos en logs protegidos
        limit: 'Por qué se leyó: la finalidad se declara y se asocia a identidades, servicios o procesos; no se deduce del SQL.'
      - number: '05'
        title: Conciliar
        text: Un consumo sin actividad, de una actividad no vigente o de columnas no aprobadas genera una brecha que se deriva a revisión.
        case: 'Si ya corría: `sin aprobación vigente: job_fraude → silver.pasajeros`.'
        evidence: Resultado de la conciliación y cierre de cada brecha
        limit: Usos fuera de la cobertura del linaje, como exportaciones o copias locales.
      - number: '06'
        title: Mantener
        text: Cada cambio de finalidad, datos, destinatarios, plazo o proceso crea una versión nueva, sin sobrescribir la anterior.
        case: 'Privacidad aprueba interés legítimo y 24 meses: nueva versión vigente; la conciliación queda sin hallazgos.'
        evidence: Historial de versiones del registro
        limit: Que el registro esté al día si un cambio no pasa por aquí.
    loop: 'Mantener vuelve a Definir: cada versión nueva pasa otra vez por vincular y autorizar.'
  use_avoid:
    use:
      title: Usarlo
      items:
      - 'Antes de habilitar un pipeline, dashboard, modelo, API o transferencia nuevos que usen datos personales: es la puerta de habilitación
        del código.'
      - 'Al modificar un tratamiento existente: finalidad, datos, destinatarios o plazo.'
      - 'Cuando vence una aprobación o se revoca un consentimiento: los consumidores de esa actividad tienen que revisarse.'
      - Como fuente para derechos del titular, retención, vulneraciones, evaluación de impacto y auditoría.
    avoid:
      title: No usarlo para
      items:
      - 'Decidir si una finalidad es lícita, si una base aplica o cuánto se conserva un dato: es una decisión jurídica, no técnica.'
      - 'Reemplazar el sistema de consentimientos, los controles de acceso, el catálogo técnico o una evaluación de impacto: es el vínculo entre
        ellos.'
      - 'Probar cumplimiento: el registro es evidencia de apoyo para acreditar licitud, finalidad y plazo, no prueba suficiente por sí solo, y
        una conciliación limpia muestra coherencia técnica, no licitud.'
  requirement_to_data:
    title: Del requisito al dato
    lead: 'Arquitectura de referencia ilustrativa: dónde vive el registro de actividades de tratamiento en una plataforma por capas.'
    governance:
      kicker:
        title: Gobierno
        detail: qué se permite
      items:
      - title: Legal y negocio
        detail: finalidad, base de licitud, plazo
      - title: Registro de actividades de tratamiento
        detail: metadatos por actividad
        highlight: true
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
        highlight: true
      banners:
      - Retención y supresión en todas las capas, respaldos y reprocesos
      - 'Puerta de la CI: bloquea lo nuevo sin actividad vigente · Conciliación: alerta lo que ya corre contra el registro'
  control_evidence:
    id: control-evidencia
    title: Control y evidencia
    lead: 'Patrón general: lo nuevo se bloquea antes de entrar; lo que ya corre se concilia y alerta.'
    steps:
    - number: '1'
      title: Declarar
      items:
      - Base, plazo y finalidad por actividad
      - Aprobación vigente y campos permitidos
    - number: '2'
      title: Observar
      items:
      - pill: Lo nuevo
        text: Despliegue con `activity_id`
      - pill: Lo que ya corre
        text: 'Linaje y logs: identidad, activo, columnas'
    - number: '3'
      title: Contrastar
      items:
      - pill: Lo nuevo
        text: 'CI: ¿actividad vigente y consumidor declarado?'
      - pill: Lo que ya corre
        text: Conciliación contra el registro; sin evaluar no cuenta como OK
    decide:
      number: '4'
      title: Decidir y registrar
      outcomes:
      - tone: pass
        text: Declarado y vigente · pasa
      - tone: fail
        text: Lo nuevo sin actividad vigente · se bloquea
      - tone: warn
        text: Lo que ya corre con brecha · alerta y revisión
      - tone: keep
        text: La puerta bloquea solo lo nuevo; la conciliación no detiene producción.
    note: Consentimientos y retención se integran desde sus fichas, sin replicarlos.
  code_guide:
    exit_codes_label: Códigos de salida
    lead:
      title: Qué hace.
      text: Recorre el registro de actividades, los usos observados y dos controles. La conciliación (escenarios `actual` y `corregido`) revisa
        lo que ya corre y, con hallazgos, sale 1 como alerta. La puerta de la CI (`despliegue-nuevo`) evalúa lo que se quiere desplegar y bloquea.
        El insumo del art. 14 ter solo incluye actividades con aprobación vigente y emite todas las letras que declara **Qué exige la ley**; lo
        que falta sale como `[sin evaluar]`, nunca se omite.
    lead_more:
    - 'La base de licitud se registra sin artículo: el artículo sale de un mapa aparte (`ARTICULO`). El consumidor sale de la identidad, la cuenta
      de servicio, no del texto de la consulta (`consumidor_de`). `None` es **sin evaluar** y, como UNKNOWN (falta el dato para decidir), nunca
      cuenta como OK.'
    rules:
      title: Controles del código y qué encuentra en actual
      summary: '{rows} controles · {total} hallazgos'
      disclosure: open
      headers:
      - Control
      - Función
      - Qué encuentra en actual
      - Hallazgos
      items:
      - rule: Tablas con PII sin actividad
        fn: tablas_sin_actividad
        requirement: '`gold.score_fraude`'
        count: 1
      - rule: Registro sin ámbito territorial
        fn: actividades_incompletas
        requirement: el registro no declara su ámbito territorial
        count: 1
      - rule: Actividad aprobada incompleta
        fn: actividades_incompletas
        requirement: '`marketing`: sin plazo, aprobación vencida el 2026-10-01, base consentimiento sin registro de consentimientos, y transferencias
          internacionales y decisiones automatizadas sin evaluar'
        count: 5
      - rule: Datos sensibles con base distinta del consentimiento (revisión) [(art. 16)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=12)
        fn: actividades_incompletas
        requirement: '`asistencia_especial` declara datos de salud con base contrato: se deriva a revisión, sin concluir una infracción'
        count: 1
      - rule: Interés legítimo sin justificación [(art. 13 letra d)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=8)
        fn: actividades_incompletas
        requirement: '`encuesta_post_vuelo` no documenta cuál es su interés legítimo'
        count: 1
      - rule: Uso sin aprobación vigente
        fn: conciliar
        requirement: '`dag_campanas` (`marketing`) y `job_fraude` (`modelo_fraude`, pendiente de evaluación)'
        count: 2
      - rule: Uso sin vínculo
        fn: conciliar
        requirement: '`dashboard_externo` lee `silver.pasajeros` sin actividad que lo declare'
        count: 1
      - rule: Proporcionalidad [(art. 3 letra c)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=3)
        fn: conciliar
        requirement: '`dag_campanas` lee `rut`, que `marketing` no necesita'
        count: 1
      - rule: Consumidor no identificado
        fn: consumidor_de
        requirement: 'la cuenta `sa-7f3c` no está mapeada: UNKNOWN'
        count: 1
    not_covered:
      title: Qué no cubre
      items:
      - title: 'Consentimiento por titular:'
        text: verifica que la actividad tenga un registro de consentimientos vinculado, con versión del texto y fecha; no que cada titular haya
          consentido ni que la revocación funcione.
      - title: 'Finalidad real:'
        text: los campos permitidos se declaran a mano, y el control ve las columnas que se leen, no para qué se usan.
      - title: 'Calidad de cada campo:'
        text: 'verifica que cada contenido esté declarado o evaluado, no que sea correcto: no valida el país ni el mecanismo de una transferencia,
          la lógica de una decisión automatizada ni que el consentimiento para datos sensibles haya sido expreso.'
      - title: 'Usos sin huella:'
        text: solo ve lo que el linaje y los logs registran; un uso que no deja huella en ellos no aparece.
      table:
        lead:
          title: Lo que el formulario muestra y el código no guarda.
          text: El formulario es una propuesta; el código de ejemplo cubre solo lo que la puerta de la CI y la conciliación necesitan verificar.
        headers:
        - Elemento
        - Por qué está en el formulario
        - Por qué no está en el código
        rows:
        - item: Aprobado por (y firma)
          form: 'Deja constancia de quién respondió por la aprobación. Es propuesta: el Decreto 662 no lo pide por actividad.'
          code: El ejemplo solo verifica que exista una aprobación vigente (fecha y vencimiento). Quién la dio sería un campo propio nuevo (por
            ejemplo `aprobado_por`), pendiente.
        - item: Responsable y Delegado
          form: Individualizan al responsable y al delegado del modelo (Decreto 662, art. 3 letras a y b).
          code: 'El código modela el registro de actividades, no la entidad ni su delegado: son datos del programa de cumplimiento.'
        - item: Versión (v1, v2)
          form: Permite saber qué regía en cada fecha.
          code: El código no guarda historial de versiones; el generador de la ficha la calcula comparando `actual` con `corregido`.
        - item: Código de la actividad
          form: Identifica la hoja.
          code: Se usa el id de la actividad.
        - item: Estado (Vigente, En revisión, Borrador)
          form: Por confirmar.
          code: 'El código no guarda un estado. El generador de la ficha lo deriva al armar la hoja: sin aprobación, Borrador; con brechas propias
            en `actividades_incompletas` o sin aprobación vigente (`vigente`), En revisión; si no, Vigente.'
        - item: Nota «Pendiente de revisión por privacidad»
          form: Por confirmar.
          code: El código emite cada brecha como una línea `BRECHA`; el generador de la ficha las agrupa por campo para la nota de la hoja.
        - item: Fecha de generación
          form: Fecha del documento.
          code: El código evalúa con una fecha fija (`REFERENCIA`) para que el resultado sea reproducible y no genera documentos; la hoja toma
            la fecha al mostrarse.
        - item: La hoja misma (secciones, una página por actividad)
          form: Por confirmar.
          code: '`inventario.py` no tiene una función de exportación: la ficha arma la hoja desde los mismos datos del registro.'
    scenarios:
      title: Escenarios
      disclosure: closed
      items:
      - name: actual
        text: 'catorce hallazgos en el registro y en lo que ya corre: alerta'
        exit_code: 1
      - name: corregido
        text: 'Los catorce hallazgos de `actual` se resuelven en el registro; el insumo pasa a cinco actividades:'
        exit_code: 0
        fixes:
        - finding: 'tabla con PII sin actividad: gold.score_fraude'
          fix: '`modelo_fraude` declara `gold.score_fraude` como activo'
        - finding: registro sin ámbito territorial
          fix: el registro declara su ámbito territorial
        - finding: 'marketing: sin plazo de conservación'
          fix: '`marketing` fija 24 meses'
        - finding: 'marketing: aprobación vencida el 2026-10-01'
          fix: aprobación renovada hasta el 2027-10-30
        - finding: 'marketing: base consentimiento sin registro de consentimientos'
          fix: registro de consentimientos vinculado (versión v3)
        - finding: 'marketing: transferencias internacionales sin evaluar'
          fix: 'transferencia declarada: Estados Unidos · cláusulas contractuales con garantías adecuadas'
        - finding: 'marketing: decisiones automatizadas sin evaluar'
          fix: perfilamiento declarado, con su lógica y consecuencias
        - finding: 'revisión: datos sensibles con base contrato en asistencia_especial'
          fix: '`asistencia_especial` pasa a consentimiento expreso, con registro de consentimientos'
        - finding: 'encuesta_post_vuelo: interés legítimo sin justificación'
          fix: '`encuesta_post_vuelo` documenta su interés legítimo'
        - finding: 'sin aprobación vigente: dag_campanas → silver.pasajeros (marketing)'
          fix: '`marketing` vuelve a estar vigente'
        - finding: 'proporcionalidad: dag_campanas lee rut, no necesario para marketing'
          fix: '`dag_campanas` deja de leer `rut`'
        - finding: 'sin aprobación vigente: job_fraude → silver.pasajeros (modelo_fraude)'
          fix: '`modelo_fraude` evaluada y aprobada: interés legítimo con justificación y 24 meses'
        - finding: 'sin vínculo: dashboard_externo → silver.pasajeros'
          fix: '`dashboard_externo` queda declarado en `venta_pasajes`'
        - finding: 'consumidor no identificado: sa-7f3c → silver.reservas'
          fix: '`sa-7f3c` se mapea a `job_conciliacion`, declarado en `venta_pasajes`'
      - name: despliegue-nuevo
        text: '4 despliegues contra el registro actual: pasa `dag_reservas`; se bloquean `dag_recomendaciones` (sin `activity_id`), `dag_segmentos`
          (no declarado) y `job_fraude` (actividad no vigente)'
        exit_code: 1
    simplifies:
      title: Qué simplifica
      items:
      - title: 'Cuentas sin mapear:'
        text: 'en la conciliación quedan en UNKNOWN y mantienen la alerta. La puerta no mira cuentas: exige un `activity_id` válido.'
      - title: 'Momento:'
        text: solo la puerta bloquea, y solo despliegues nuevos. Quién revisa la alerta y en qué plazo queda fuera del ejemplo.
      - title: 'Política:'
        text: el insumo del art. 14 ter es un borrador para que privacidad lo revise, no la política publicada.
    limit:
      title: Límite.
      text: Es un ejemplo didáctico con datos ficticios. Una brecha es una alerta técnica para revisar, no la conclusión de que hubo una infracción,
        y una salida 0 no demuestra que el tratamiento sea lícito.
  cloud_compare:
    title: En la nube
    intro: Lo que necesita la conciliación, comparado con lo que ofrece cada nube.
    alert:
      title: Ojo
      text: 'Ningún linaje registra para qué se ejecutó una consulta. El registro de actividades es propio en las tres nubes, y la conciliación
        depende de cuánto tiempo retenga cada servicio el linaje y los logs: en GCP, 30 días.'
    headers:
    - Necesidad
    - Este ejemplo
    - GCP
    - AWS
    - Azure Databricks
    rows:
    - need: Linaje
      meta: Usos observados
      own:
        text: Activo leído por cada consumidor
      gcp:
        name: '[Knowledge Catalog](https://docs.cloud.google.com/knowledge-catalog/docs/about-data-lineage) · linaje'
        text: Lo informan BigQuery, Dataflow y otros servicios. Se retiene 30 días; a nivel de columna, solo columnas de primer nivel de BigQuery.
      aws:
        name: '[Amazon DataZone](https://docs.aws.amazon.com/datazone/latest/userguide/datazone-data-lineage.html) · linaje'
        text: Automático desde AWS Glue y Amazon Redshift; acepta eventos OpenLineage. La página no indica la retención.
      azure:
        name: '[Unity Catalog](https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/data-lineage) · linaje'
        text: Hasta nivel de columna. Las tablas de sistema guardan una ventana móvil de 395 días.
    - need: Identidad que accedió
      meta: Usos observados
      own:
        text: Cuenta de servicio → consumidor declarado
      gcp:
        name: '[INFORMATION_SCHEMA.JOBS](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs-by-organization)'
        text: 'Por consulta: `user_email` y `referenced_tables`. No incluye consultas servidas desde la caché.'
      aws:
        name: '[CloudTrail](https://docs.aws.amazon.com/lake-formation/latest/dg/logging-using-cloudtrail.html) · Lake Formation'
        text: '`GetDataAccess` registra el principal cuando un servicio pide credenciales; para ver los accesos a objetos hay que activar los
          eventos de datos de S3 (costo adicional), y la tabla se obtiene correlacionando con esos accesos.'
      azure:
        name: '[system.access.audit](https://learn.microsoft.com/en-us/azure/databricks/admin/system-tables/audit-logs)'
        text: '`user_identity` y la acción, por ejemplo `getTable`.'
    - need: Finalidad
      meta: Registro de actividades
      own:
        text: Actividad con base, plazo y campos
      span:
        title: Sin servicio nativo en las tres nubes
        text: 'El linaje registra el movimiento, no la finalidad: el registro es propio y se enlaza a las ejecuciones. En GCP, las etiquetas del
          catálogo pueden ayudar a anotarla.'
    - need: Puerta de despliegue
      tone: where
      own:
        text: Valida `activity_id` en la CI
      span:
        title: Igual en las tres nubes
        text: Se programa en la CI de la plataforma, no en un servicio de la nube.
  practice_pairs:
    start:
      title: Por dónde empezar
      text: 'Actividades con datos sensibles, decisiones automatizadas o terceros; y las identidades y activos de mayor riesgo. Mide consumos
        sin vínculo, actividades incompletas y aprobaciones vencidas: deben tender a cero.'
    labels:
      do: Hacer
      avoid: Evitar
    items:
    - do: Registrar la base de licitud en la actividad; el dataset solo la referencia.
      avoid: 'Asignar la base al dataset: todos sus consumidores quedan «cubiertos» y un uso nuevo pasa inadvertido.'
    - do: Exigir `activity_id` antes de dar acceso a un consumidor nuevo de datos personales.
      avoid: 'Tratar un permiso de IAM como autorización: no dice para qué finalidad.'
    - do: Declarar los campos que cada finalidad necesita y conciliarlos con las columnas leídas.
      avoid: Dar acceso a la tabla completa cuando la finalidad usa tres columnas.
    - do: Mantener separadas la aprobación jurídica, la configuración técnica y la evidencia de ejecución.
      avoid: 'Creer que el linaje revela por qué se ejecutó una consulta: muestra dependencias, no intención.'
    - do: Versionar las actividades y definir qué pasa con las descontinuadas y las aprobaciones vencidas.
      avoid: Mantener el inventario en una planilla aislada que no cambia cuando cambian los pipelines.
    - do: Pedir consentimiento específico por finalidad y guardar versión del texto y fecha.
      avoid: 'Usar un consentimiento genérico para «mejorar nuestros servicios»: no es específico.'
    - do: Dejar en UNKNOWN y revisar una cuenta de servicio sin mapear.
      avoid: Tratar un consumidor sin identificar como aprobado.
    - do: Revisar el insumo del art. 14 ter antes de publicar la política.
      avoid: 'Publicar la política generada sin revisión: puede estar incompleta o desactualizada.'
  trade_offs:
    resolution_label: Se resuelve con
    items:
    - a: Una actividad por consulta
      a_text: inmanejable
      b: Una por sistema
      b_text: oculta finalidades distintas
      resolution: una actividad por finalidad coherente, con consumidores y activos trazables.
    - a: Inspeccionar cada consulta
      a_text: caro
      b: Solo lo declarado
      b_text: no ve usos nuevos
      resolution: priorizar identidades, servicios y activos de mayor riesgo, sin suponer cobertura completa.
    - a: Bloquear todo cambio no aprobado
      a_text: frena a los equipos
      b: Solo alertar
      b_text: el uso ya ocurrió
      resolution: bloquear lo nuevo y conciliar lo que corre, con un alta de actividades ágil.
    - a: Registro propio ligado a la CI y al linaje
      a_text: control total, más mantención
      b: Herramienta de terceros de gestión de privacidad
      b_text: más rápida de arrancar; el vínculo con lo que corre depende de cómo se integre
      resolution: un registro consultable desde la CI, sin importar quién lo aloje.
  open_questions:
    intro: Si no sabes responder una, repasa la parte de la ficha que trata ese tema.
    items:
    - question: ¿Puedes listar las actividades que usan una tabla dada, y con qué base cada una?
    - question: ¿Cuántos consumidores de datos personales no declaran actividad hoy?
    - question: ¿Qué pasa con los consumidores de una actividad cuando vence su aprobación o se revoca el consentimiento?
    - question: ¿Dónde se guarda hoy la prueba del consentimiento, por finalidad y versión del texto?
    - question: ¿Qué parte de los consumos reales cubre tu linaje y por cuánto tiempo lo retienes?
    - question: ¿Cómo actuarías ante un consumidor no registrado, sin presumir una infracción?
  sources_grouped:
    heading: Fuentes
    link_titles: true
    legend: 'Nivel de la fuente: 1 = documentación oficial o texto legal oficial (BCN, Diario Oficial); 2 = notas de versión oficiales; 3 = blogs
      técnicos oficiales; 4 = papers y organizaciones técnicas.'
    groups:
    - title: Normativa chilena
      layout: list
      sources:
      - title: Ley 21.719 · Diario Oficial, 2024-12-13
        urls:
        - https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf
        publisher: Diario Oficial
        why: Art. 3 letras a, b y c; arts. 12, 13, 14 letra a, 14 ter, 16, 27, 34 ter letras a y c, y 49 letra c de la Ley 19.628, texto modificado
          por la Ley 21.719.
      - title: Ley 19.628 · texto que rige desde el 2026-12-01
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
        - https://www.bcn.cl/leychile/navegar?idNorma=141599&idParte=10528059&idVersion=2026-12-01
        publisher: BCN
        why: Texto consolidado, versión con vigencia diferida, y el art. 14 ter.
      - title: Decreto 662, de 2025 · Ministerio de Hacienda, publicado el 2026-09-09
        urls:
        - https://www.bcn.cl/leychile/navegar?idNorma=1227971
        - https://www.bcn.cl/leychile/navegar?idNorma=1227971&idParte=10609555
        publisher: BCN
        why: Art. 1 (modelo voluntario; no obsta al deber general) y art. 3 letra d).
    - title: Servicios cloud · verificados el 2026-11-17
      layout: list
      sources:
      - title: About data lineage
        urls:
        - https://docs.cloud.google.com/knowledge-catalog/docs/about-data-lineage
        publisher: Google Cloud
        why: Knowledge Catalog (antes Dataplex Universal Catalog); retención de 30 días y alcance del linaje de columnas.
      - title: JOBS_BY_ORGANIZATION view
        urls:
        - https://docs.cloud.google.com/bigquery/docs/information-schema-jobs-by-organization
        publisher: Google Cloud
        why: '`user_email` y `referenced_tables` por consulta; sin las consultas servidas desde la caché.'
      - title: Data lineage in Amazon DataZone
        urls:
        - https://docs.aws.amazon.com/datazone/latest/userguide/datazone-data-lineage.html
        publisher: AWS
        why: Glue, Redshift y OpenLineage.
      - title: Logging Lake Formation API calls using CloudTrail
        urls:
        - https://docs.aws.amazon.com/lake-formation/latest/dg/logging-using-cloudtrail.html
        publisher: AWS
        why: '`GetDataAccess` con el principal que accede, y los eventos de datos de S3.'
      - title: Lineage in Unity Catalog
        urls:
        - https://learn.microsoft.com/en-us/azure/databricks/data-governance/unity-catalog/data-lineage
        publisher: Microsoft · Azure Databricks
        why: Linaje hasta nivel de columna; tablas de sistema con una ventana de 395 días.
      - title: Audit log system table reference
        urls:
        - https://learn.microsoft.com/en-us/azure/databricks/admin/system-tables/audit-logs
        publisher: Microsoft · Azure Databricks
        why: '`system.access.audit` con `user_identity`.'
    - title: En esta plataforma
      layout: list
      sources:
      - title: Ley 21.719 para ingenieros de datos
        page: chile-data-protection
        label: Ficha madre
        why: Principios, matriz de control y sanciones.
      - title: Identificación de datos personales y sensibles
        page: pii-identification
        label: Ficha
        why: Qué activos contienen datos personales y sensibles; alimenta el campo **Tipo de datos** del registro.
      - title: Retención y supresión
        page: retention-and-erasure
        label: Ficha
        why: Aplicar el plazo de cada actividad.
      - title: Pipeline de derechos del titular
        page: data-subject-rights-pipeline
        label: Ficha
        why: Localizar los tratamientos ante una solicitud.
      - title: Evaluación de impacto y decisiones automatizadas
        page: dpia-and-automated-decisions
        label: Ficha
        why: Evaluar las actividades de mayor riesgo.
      - title: Encargados y transferencias internacionales
        page: processors-and-international-transfers
        label: Ficha
        why: Destinatarios, encargados y transferencias.
      - title: Controles de privacidad como código
        page: privacy-controls-as-code
        label: Ficha
        why: Automatizar las verificaciones.
created_at: '2026-10-21'
updated_at: '2026-11-17'
last_verified: '2026-11-15'
verification_status: review_required
availability: available
---

## 1. Resumen

Esta ficha no es asesoría legal: finalidad, base de licitud y plazo los definen el responsable, el negocio y el área legal; aquí se explica cómo modelarlos, vincularlos a la plataforma y controlarlos. Los ejemplos de bases y plazos son ilustrativos, no determinaciones legales.

### Saber para qué se tratan los datos personales, con qué fundamento y quién los usa

El inventario registra cada actividad de tratamiento: para qué se tratan datos personales, con qué base de licitud y por cuánto tiempo, y la vincula con los activos, procesos y consumidores que los usan. No es una lista de tablas ni un catálogo técnico duplicado: conecta decisiones de negocio y privacidad con operaciones observables.

<!-- view: note idea-central -->

<!-- view: build_cards -->

Es la base de los demás controles. Sin saber qué actividad usa qué datos, con qué base y por cuánto tiempo, no se puede responder una solicitud de acceso, aplicar un plazo de retención, dimensionar una vulneración ni detectar un uso indebido.

<!-- view: chips ficha-madre -->

<!-- split: ley -->

### Cinco preguntas que la ley obliga a poder responder

<!-- view: law_ladder -->

<!-- view: register_fields -->

<!-- view: note sin-formato -->

## 2. Qué es

### Un registro de usos, no de tablas

<!-- view: activity_explorer -->

<!-- view: note muchos-a-muchos -->

## 3. Problema que resuelve

### Que una tabla esté disponible no autoriza una finalidad nueva

<!-- view: case_compare -->

<!-- view: note alerta -->

## 4. Cómo funciona

### Un ciclo en dos tiempos: antes de usar y mientras corre

<!-- view: cycle_lanes -->

## 5. Cuándo utilizarlo

### Cada vez que aparece o cambia un uso de datos personales

<!-- view: use_avoid -->

## 9. Arquitectura

<!-- view: requirement_to_data -->

<!-- view: control_evidence -->

## 10. Código

```python
# Python 3.12+, biblioteca estándar. De punta a punta: registro de actividades → usos observados → conciliación
# operacional (lo que ya corre) e insumo de la política (art. 14 ter), o puerta de despliegue de la CI (lo nuevo) →
# código de salida (0 sin hallazgos, 1 alerta o bloqueo). Uso: python inventario.py actual | corregido |
# despliegue-nuevo. La base de licitud vive en la actividad, no en la tabla. Las funciones reciben el
# registro como parámetro. Una brecha es una alerta técnica para revisar, no la conclusión de que hubo una infracción;
# UNKNOWN o «sin evaluar» (falta el dato para decidir) nunca cuenta como OK. Datos ficticios.
import sys
from dataclasses import dataclass, field, replace
from datetime import date
from typing import Literal

# @paso 1 Registro
Base = Literal["consentimiento", "obligación legal", "contrato", "interés legítimo", "defensa de derechos",
               "obligaciones económicas"]
ARTICULO: dict[Base, str] = {"consentimiento": "art. 12", "obligaciones económicas": "art. 13 letra a",
                             "obligación legal": "art. 13 letra b", "contrato": "art. 13 letra c",
                             "interés legítimo": "art. 13 letra d", "defensa de derechos": "art. 13 letra e"}
REFERENCIA = date(2026, 11, 3)   # fecha fija: resultado reproducible


@dataclass(frozen=True)
class Aprobacion:
    fecha: date
    vence: date


@dataclass(frozen=True)
class RegistroConsentimientos:   # por titular, finalidad, versión del texto y fecha (aquí, solo el vínculo)
    version_texto: str
    desde: date


@dataclass(frozen=True)
class Actividad:   # None = sin evaluar; () o "" = se evaluó y se declaró «ninguna»
    id: str
    finalidad: str
    base: Base | None              # None: pendiente de evaluación
    plazo_meses: int | None
    aprobacion: Aprobacion | None
    categorias: tuple[str, ...]
    destinatarios: tuple[str, ...]
    activos: frozenset[str]
    consumidores: frozenset[str]
    campos: frozenset[str]         # columnas que la finalidad necesita
    consentimientos: RegistroConsentimientos | None = None
    titulares: tuple[str, ...] = ()
    fuente: str | None = None
    acceso_publico: bool | None = None
    transferencias: tuple[str, ...] | None = None    # cada una «país · mecanismo del art. 27»
    decisiones_automatizadas: str | None = None      # lógica y consecuencias
    categorias_sensibles: tuple[str, ...] = ()       # subconjunto declarado de categorias
    justificacion_interes_legitimo: str | None = None
    plazo_condicion: str | None = None               # «plazos o condiciones»: basta uno de los dos


@dataclass(frozen=True)
class Registro:
    actividades: tuple[Actividad, ...]
    tablas_con_pii: frozenset[str]
    identidades: dict[str, str] = field(default_factory=dict)   # cuenta de servicio -> consumidor declarado
    ambito_territorial: str | None = None                       # una vez por registro, no por actividad


@dataclass(frozen=True)
class Uso:   # desde logs de acceso y linaje: quién leyó qué activo y qué columnas
    cuenta: str
    activo: str
    columnas: frozenset[str]


@dataclass(frozen=True)
class Despliegue:   # un consumidor nuevo que se quiere desplegar
    consumidor: str
    activity_id: str | None


def vigente(a: Actividad, hoy: date) -> bool:
    return a.aprobacion is not None and a.aprobacion.vence >= hoy


# @paso 2 Usos observados
def consumidor_de(registro: Registro, uso: Uso) -> str | None:
    """El consumidor sale de una identidad confiable (cuenta de servicio), no del texto de la consulta."""
    return registro.identidades.get(uso.cuenta)


# @paso 3 Conciliación
@dataclass(frozen=True)
class Hallazgo:
    estado: Literal["BRECHA", "UNKNOWN"]
    detalle: str


def tablas_sin_actividad(registro: Registro) -> list[Hallazgo]:
    cubiertas = {t for a in registro.actividades for t in a.activos}
    sin_actividad = sorted(registro.tablas_con_pii - cubiertas)
    return [Hallazgo("BRECHA", f"tabla con PII sin actividad: {t}") for t in sin_actividad]


def actividades_incompletas(registro: Registro, hoy: date) -> list[Hallazgo]:
    """Una actividad aprobada necesita cada contenido declarado o evaluado; la aprobación vence y el consentimiento
    se registra. Lo que falta es una brecha para revisar, nunca un OK."""
    hallazgos = []
    if registro.ambito_territorial is None:
        hallazgos.append(Hallazgo("BRECHA", "registro sin ámbito territorial"))
    for a in registro.actividades:
        if a.aprobacion is None:
            continue
        if a.base is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: aprobada sin base de licitud"))
        if a.plazo_meses is None and a.plazo_condicion is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: sin plazo de conservación"))
        if a.aprobacion.vence < hoy:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: aprobación vencida el {a.aprobacion.vence}"))
        if a.base == "consentimiento" and a.consentimientos is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: base consentimiento sin registro de consentimientos"))
        if not a.titulares:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: sin categorías de titulares"))
        if a.fuente is None or a.acceso_publico is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: fuente de los datos sin evaluar"))
        if a.transferencias is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: transferencias internacionales sin evaluar"))
        if a.decisiones_automatizadas is None:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: decisiones automatizadas sin evaluar"))
        if a.base == "interés legítimo" and not a.justificacion_interes_legitimo:
            hallazgos.append(Hallazgo("BRECHA", f"{a.id}: interés legítimo sin justificación"))
        if a.categorias_sensibles and a.base is not None and a.base != "consentimiento":
            hallazgos.append(Hallazgo("BRECHA", f"revisión: datos sensibles con base {a.base} en {a.id} "
                                                "(art. 16: consentimiento expreso, salvo excepciones)"))
    return hallazgos


def conciliar(registro: Registro, usos: list[Uso], hoy: date) -> list[Hallazgo]:
    """Cada uso observado tiene que caer en una actividad vigente y leer solo los campos de su finalidad."""
    hallazgos = []
    for uso in usos:
        consumidor = consumidor_de(registro, uso)
        if consumidor is None:
            hallazgos.append(Hallazgo("UNKNOWN", f"consumidor no identificado: {uso.cuenta} → {uso.activo}"))
            continue
        vinculos = [a for a in registro.actividades if consumidor in a.consumidores and uso.activo in a.activos]
        if not vinculos:
            hallazgos.append(Hallazgo("BRECHA", f"sin vínculo: {consumidor} → {uso.activo}"))
            continue
        if not any(vigente(a, hoy) for a in vinculos):
            hallazgos.append(Hallazgo("BRECHA", f"sin aprobación vigente: {consumidor} → {uso.activo} "
                                                f"({', '.join(a.id for a in vinculos)})"))
        for a in vinculos:
            sobran = sorted(uso.columnas - a.campos)
            if a.campos and sobran:   # campos vacíos: la actividad todavía no se evalúa
                hallazgos.append(Hallazgo("BRECHA", f"proporcionalidad: {consumidor} lee {', '.join(sobran)}, "
                                                    f"no necesario para {a.id}"))
    return hallazgos


def verificar_despliegues(registro: Registro, despliegues: list[Despliegue], hoy: date) -> list[Hallazgo]:
    """Puerta de la CI: bloquea un despliegue sin activity_id, con una actividad que no declara al consumidor o con una
    actividad sin aprobación vigente; cada caso con su propio motivo."""
    hallazgos = []
    por_id = {a.id: a for a in registro.actividades}
    for d in despliegues:
        actividad = por_id.get(d.activity_id or "")
        if actividad is None:
            hallazgos.append(Hallazgo("BRECHA", f"despliegue bloqueado: {d.consumidor} sin activity_id válido"))
        elif d.consumidor not in actividad.consumidores:
            hallazgos.append(Hallazgo("BRECHA", f"despliegue bloqueado: {d.consumidor} no declarado en {actividad.id}"))
        elif not vigente(actividad, hoy):
            hallazgos.append(Hallazgo("BRECHA", f"despliegue bloqueado: {d.consumidor} → {actividad.id}: "
                                                "actividad no vigente"))
    return hallazgos


# @paso 4 Insumo y salida
SIN_EVALUAR = "[sin evaluar]"


def lista(valores: tuple[str, ...] | None, vacio: str) -> str:
    return SIN_EVALUAR if valores is None else ", ".join(valores) or vacio


def insumo_14_ter(registro: Registro, hoy: date) -> list[str]:
    """Insumo para la política pública (art. 14 ter): solo actividades con aprobación vigente. Emite cada letra;
    lo que falta sale como [sin evaluar], nunca se omite."""
    filas = []
    for a in registro.actividades:
        if not vigente(a, hoy) or a.base is None:
            continue
        plazo = " o ".join(p for p in (f"{a.plazo_meses} meses" if a.plazo_meses is not None else "",
                                       a.plazo_condicion or "") if p) or SIN_EVALUAR
        publico = SIN_EVALUAR if a.acceso_publico is None else ("sí" if a.acceso_publico else "no")
        decisiones = SIN_EVALUAR if a.decisiones_automatizadas is None else a.decisiones_automatizadas or "ninguna"
        interes = (f" · interés legítimo: {a.justificacion_interes_legitimo or SIN_EVALUAR}"
                   if a.base == "interés legítimo" else "")
        articulo = ARTICULO[a.base] + ("; art. 16, expreso" if a.categorias_sensibles and a.base == "consentimiento"
                                       else "")
        filas += [f"- {a.finalidad} · base: {a.base} ({articulo}){interes}",
                  f"  d) datos: {', '.join(a.categorias)} · sensibles: {lista(a.categorias_sensibles, 'ninguno')}",
                  f"  d) titulares: {lista(a.titulares, SIN_EVALUAR)} "
                  f"· destinatarios: {lista(a.destinatarios, 'ninguno')}",
                  f"  h) transferencias: {lista(a.transferencias, 'ninguna')}",
                  f"  i) plazo: {plazo}",
                  f"  j) fuente: {a.fuente or SIN_EVALUAR} · acceso público: {publico}",
                  f"  l) decisiones automatizadas: {decisiones}"]
    return filas


def escenario(nombre: str) -> tuple[Registro, list[Uso], list[Despliegue]]:
    venta = Actividad("venta_pasajes", "emitir y gestionar pasajes", "contrato", 60,
                      Aprobacion(date(2026, 1, 15), date(2027, 1, 15)), ("identificación", "contacto", "itinerario"),
                      ("aerolíneas socias",), frozenset({"silver.pasajeros", "silver.reservas"}),
                      frozenset({"dag_reservas"}), frozenset({"pasajero_id", "nombre", "correo", "vuelo", "fecha"}),
                      titulares=("pasajeros", "compradores"), fuente="el propio comprador, al reservar",
                      acceso_publico=False, decisiones_automatizadas="",
                      transferencias=("Argentina · cláusulas contractuales con garantías adecuadas",))
    marketing = Actividad("marketing", "ofertas personalizadas", "consentimiento", None,
                          Aprobacion(date(2025, 10, 1), date(2026, 10, 1)), ("contacto", "preferencias"),
                          ("plataforma de email",), frozenset({"silver.pasajeros"}), frozenset({"dag_campanas"}),
                          frozenset({"pasajero_id", "correo", "preferencias"}),
                          titulares=("pasajeros suscritos",), fuente="formulario de suscripción", acceso_publico=False)
    fraude = Actividad("modelo_fraude", "detectar operaciones sospechosas", None, None, None,
                       ("identificación", "pagos"), (), frozenset({"silver.pasajeros"}), frozenset({"job_fraude"}),
                       frozenset())
    asistencia = Actividad("asistencia_especial", "asistencia en aeropuerto a pasajeros con movilidad reducida",
                           "contrato", 12, Aprobacion(date(2026, 3, 1), date(2027, 3, 1)),
                           ("identificación", "salud"), ("operador de aeropuerto",), frozenset({"silver.reservas"}),
                           frozenset({"dag_asistencia"}), frozenset({"pasajero_id", "vuelo", "tipo_asistencia"}),
                           titulares=("pasajeros",), fuente="el propio pasajero, al pedir la asistencia",
                           acceso_publico=False, transferencias=(), decisiones_automatizadas="",
                           categorias_sensibles=("salud",))
    encuesta = Actividad("encuesta_post_vuelo", "medir la satisfacción después del vuelo", "interés legítimo", 12,
                         Aprobacion(date(2026, 5, 1), date(2027, 5, 1)), ("contacto", "itinerario"), (),
                         frozenset({"silver.reservas"}), frozenset({"dag_encuestas"}),
                         frozenset({"pasajero_id", "correo", "vuelo"}), titulares=("pasajeros",),
                         fuente="la reserva", acceso_publico=False, transferencias=(), decisiones_automatizadas="")
    pii = frozenset({"silver.pasajeros", "silver.reservas", "gold.score_fraude"})
    registro = Registro((venta, marketing, fraude, asistencia, encuesta), pii,
                        {"sa-reservas": "dag_reservas", "sa-campanas": "dag_campanas", "sa-fraude": "job_fraude",
                         "sa-bi": "dashboard_externo"})
    usos = [Uso("sa-reservas", "silver.pasajeros", frozenset({"pasajero_id", "nombre", "vuelo"})),
            Uso("sa-campanas", "silver.pasajeros", frozenset({"correo", "rut"})),
            Uso("sa-fraude", "silver.pasajeros", frozenset({"pasajero_id", "rut", "monto"})),
            Uso("sa-bi", "silver.pasajeros", frozenset({"vuelo", "fecha"})),
            Uso("sa-7f3c", "silver.reservas", frozenset({"pasajero_id"}))]
    if nombre == "actual":
        return registro, usos, []
    if nombre == "despliegue-nuevo":   # la puerta de la CI evalúa lo que se quiere desplegar contra el registro de hoy
        return registro, usos, [Despliegue("dag_reservas", "venta_pasajes"), Despliegue("dag_recomendaciones", None),
                                Despliegue("dag_segmentos", "venta_pasajes"), Despliegue("job_fraude", "modelo_fraude")]
    hoy_aprobada = Aprobacion(date(2026, 10, 30), date(2027, 10, 30))
    corregido = Registro((
        replace(venta, consumidores=venta.consumidores | {"dashboard_externo", "job_conciliacion"}),
        replace(marketing, plazo_meses=24, aprobacion=hoy_aprobada,
                consentimientos=RegistroConsentimientos("v3", date(2026, 9, 1)),
                transferencias=("Estados Unidos · cláusulas contractuales con garantías adecuadas",),
                decisiones_automatizadas="perfilamiento por preferencias para elegir la oferta de cada pasajero; "
                                         "no cambia precios ni condiciones"),
        replace(fraude, base="interés legítimo", plazo_meses=24, aprobacion=hoy_aprobada,
                activos=frozenset({"silver.pasajeros", "gold.score_fraude"}),
                campos=frozenset({"pasajero_id", "rut", "monto"}), titulares=("pasajeros", "compradores"),
                fuente="pagos registrados en la venta", acceso_publico=False, transferencias=(),
                decisiones_automatizadas="puntaje de riesgo por operación; sobre el umbral, la operación se "
                                         "retiene para revisión humana",
                justificacion_interes_legitimo="prevenir fraude en los pagos; ponderado frente a las expectativas "
                                               "del pasajero el 2026-10-30"),
        replace(asistencia, base="consentimiento",
                consentimientos=RegistroConsentimientos("salud-v1", date(2026, 10, 15))),
        replace(encuesta, justificacion_interes_legitimo="mejorar el servicio; el pasajero puede oponerse en "
                                                         "cada encuesta")),
        registro.tablas_con_pii, {**registro.identidades, "sa-7f3c": "job_conciliacion"},
        ambito_territorial="Chile: pasajeros que compran en Chile, también desde el extranjero")
    usos_corregidos = [replace(u, columnas=frozenset({"correo"})) if u.cuenta == "sa-campanas" else u for u in usos]
    return corregido, usos_corregidos, []


def puerta_ci(registro: Registro, despliegues: list[Despliegue]) -> int:
    """Lo nuevo: cada despliegue se evalúa antes de entrar a producción, y uno bloqueado no se despliega."""
    hallazgos = verificar_despliegues(registro, despliegues, REFERENCIA)
    for h in hallazgos:
        print(f"{h.estado} {h.detalle}")
    if hallazgos:
        print(f"puerta de la CI: rechazada (1): {len(hallazgos)} de {len(despliegues)} despliegues bloqueados")
        return 1
    print(f"puerta de la CI: aprobada (0): {len(despliegues)} despliegues declarados y vigentes")
    return 0


def conciliacion(registro: Registro, usos: list[Uso]) -> int:
    """Lo que ya corre: la conciliación no bloquea nada, levanta una alerta operacional para revisar."""
    print("insumo para la política (art. 14 ter), a revisar por privacidad antes de publicar:")
    print("\n".join(insumo_14_ter(registro, REFERENCIA)))
    hallazgos = (tablas_sin_actividad(registro) + actividades_incompletas(registro, REFERENCIA)
                 + conciliar(registro, usos, REFERENCIA))
    for h in hallazgos:
        print(f"{h.estado} {h.detalle}")
    if hallazgos:
        print(f"conciliación: alerta (1): {len(hallazgos)} hallazgo(s) en lo que ya corre")
        return 1
    print("conciliación: sin hallazgos (0)")
    return 0


def main(nombre: str) -> int:
    registro, usos, despliegues = escenario(nombre)
    return puerta_ci(registro, despliegues) if despliegues else conciliacion(registro, usos)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "actual"))
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`.

```text
$ python inventario.py actual
insumo para la política (art. 14 ter), a revisar por privacidad antes de publicar:
- emitir y gestionar pasajes · base: contrato (art. 13 letra c)
  d) datos: identificación, contacto, itinerario · sensibles: ninguno
  d) titulares: pasajeros, compradores · destinatarios: aerolíneas socias
  h) transferencias: Argentina · cláusulas contractuales con garantías adecuadas
  i) plazo: 60 meses
  j) fuente: el propio comprador, al reservar · acceso público: no
  l) decisiones automatizadas: ninguna
- asistencia en aeropuerto a pasajeros con movilidad reducida · base: contrato (art. 13 letra c)
  d) datos: identificación, salud · sensibles: salud
  d) titulares: pasajeros · destinatarios: operador de aeropuerto
  h) transferencias: ninguna
  i) plazo: 12 meses
  j) fuente: el propio pasajero, al pedir la asistencia · acceso público: no
  l) decisiones automatizadas: ninguna
- medir la satisfacción después del vuelo · base: interés legítimo (art. 13 letra d) · interés legítimo: [sin evaluar]
  d) datos: contacto, itinerario · sensibles: ninguno
  d) titulares: pasajeros · destinatarios: ninguno
  h) transferencias: ninguna
  i) plazo: 12 meses
  j) fuente: la reserva · acceso público: no
  l) decisiones automatizadas: ninguna
BRECHA tabla con PII sin actividad: gold.score_fraude
BRECHA registro sin ámbito territorial
BRECHA marketing: sin plazo de conservación
BRECHA marketing: aprobación vencida el 2026-10-01
BRECHA marketing: base consentimiento sin registro de consentimientos
BRECHA marketing: transferencias internacionales sin evaluar
BRECHA marketing: decisiones automatizadas sin evaluar
BRECHA revisión: datos sensibles con base contrato en asistencia_especial (art. 16: consentimiento expreso, salvo excepciones)
BRECHA encuesta_post_vuelo: interés legítimo sin justificación
BRECHA sin aprobación vigente: dag_campanas → silver.pasajeros (marketing)
BRECHA proporcionalidad: dag_campanas lee rut, no necesario para marketing
BRECHA sin aprobación vigente: job_fraude → silver.pasajeros (modelo_fraude)
BRECHA sin vínculo: dashboard_externo → silver.pasajeros
UNKNOWN consumidor no identificado: sa-7f3c → silver.reservas
conciliación: alerta (1): 14 hallazgo(s) en lo que ya corre
```

```text
$ python inventario.py corregido
insumo para la política (art. 14 ter), a revisar por privacidad antes de publicar:
- emitir y gestionar pasajes · base: contrato (art. 13 letra c)
  d) datos: identificación, contacto, itinerario · sensibles: ninguno
  d) titulares: pasajeros, compradores · destinatarios: aerolíneas socias
  h) transferencias: Argentina · cláusulas contractuales con garantías adecuadas
  i) plazo: 60 meses
  j) fuente: el propio comprador, al reservar · acceso público: no
  l) decisiones automatizadas: ninguna
- ofertas personalizadas · base: consentimiento (art. 12)
  d) datos: contacto, preferencias · sensibles: ninguno
  d) titulares: pasajeros suscritos · destinatarios: plataforma de email
  h) transferencias: Estados Unidos · cláusulas contractuales con garantías adecuadas
  i) plazo: 24 meses
  j) fuente: formulario de suscripción · acceso público: no
  l) decisiones automatizadas: perfilamiento por preferencias para elegir la oferta de cada pasajero; no cambia precios ni condiciones
- detectar operaciones sospechosas · base: interés legítimo (art. 13 letra d) · interés legítimo: prevenir fraude en los pagos; ponderado frente a las expectativas del pasajero el 2026-10-30
  d) datos: identificación, pagos · sensibles: ninguno
  d) titulares: pasajeros, compradores · destinatarios: ninguno
  h) transferencias: ninguna
  i) plazo: 24 meses
  j) fuente: pagos registrados en la venta · acceso público: no
  l) decisiones automatizadas: puntaje de riesgo por operación; sobre el umbral, la operación se retiene para revisión humana
- asistencia en aeropuerto a pasajeros con movilidad reducida · base: consentimiento (art. 12; art. 16, expreso)
  d) datos: identificación, salud · sensibles: salud
  d) titulares: pasajeros · destinatarios: operador de aeropuerto
  h) transferencias: ninguna
  i) plazo: 12 meses
  j) fuente: el propio pasajero, al pedir la asistencia · acceso público: no
  l) decisiones automatizadas: ninguna
- medir la satisfacción después del vuelo · base: interés legítimo (art. 13 letra d) · interés legítimo: mejorar el servicio; el pasajero puede oponerse en cada encuesta
  d) datos: contacto, itinerario · sensibles: ninguno
  d) titulares: pasajeros · destinatarios: ninguno
  h) transferencias: ninguna
  i) plazo: 12 meses
  j) fuente: la reserva · acceso público: no
  l) decisiones automatizadas: ninguna
conciliación: sin hallazgos (0)
```

```text
$ python inventario.py despliegue-nuevo
BRECHA despliegue bloqueado: dag_recomendaciones sin activity_id válido
BRECHA despliegue bloqueado: dag_segmentos no declarado en venta_pasajes
BRECHA despliegue bloqueado: job_fraude → modelo_fraude: actividad no vigente
puerta de la CI: rechazada (1): 3 de 4 despliegues bloqueados
```

<!-- view: code_guide -->

## 11. GCP

### Los servicios ven el movimiento; la finalidad la registras tú

<!-- view: cloud_compare -->

<!-- view: note equivalencias -->

## 14. Buenas prácticas

### Ocho decisiones que separan un inventario útil de una planilla

<!-- view: practice_pairs -->

## 16. Trade-offs

### Cuatro equilibrios al diseñar el inventario

<!-- view: trade_offs -->

## 18. Preguntas técnicas abiertas

### Respóndelas para tu plataforma

<!-- view: open_questions -->

<!-- view: note dominio -->

## 20. Fuentes

### Fuentes

## 22. Historial de cambios importantes

- 2026-10-21: creación (lote F3b-19a).
- 2026-10-22: upgrade de 19: la base de licitud pasa a la actividad de tratamiento, con usos observados contra registrados y resumen del art. 14 ter.
- 2026-10-24: `PART_OF` hacia `chile-data-protection` (ADR-024) e `implication` por artículo en `legal_basis` (enmienda de ADR-023). Sin cambios de contenido legal ni de código.
- 2026-10-25: revisión del upgrade (`docs/reviews/cards-f3b-19-upgrade.md`) y auditoría de las etiquetas «Obligación legal»: cada una afirma solo lo que dice su artículo; lo demás pasa a buena práctica o decisión de arquitectura. Textos de BCN y del Senado consultados el 2026-10-25, sin cambios desde el 2026-10-22.
- 2026-10-25: §9 con el estándar de diagramas (máximo 8 nodos): tags y pipelines en un nodo; linaje y logs dentro de «usos observados».
- 2026-10-28: mejora de contenido (lote P1) con tres niveles de lectura: §1 (idea central), §2 (art. 3 c) verificado en BCN y agregado a `legal_basis`; actividad, activo, consumidor y evidencia como entidades distintas), §3 (caso del modelo nuevo sobre una tabla disponible; la falta de registro no prueba la infracción), §4 (ocho pasos con autorizar y gestionar desviaciones; el linaje no muestra intención), §6, §7 (tres actividades sobre el mismo activo), §8 (escenario con evidencia «qué demuestra y qué no»), §9 (consumidores declarados y conciliación), §10 (consumidores por actividad: brechas «sin vínculo» y «sin aprobación», insumo del art. 14 ter solo con actividades aprobadas), §11–13 (columna de limitaciones; retención de 30 días del linaje en GCP), §14–16, §17 (relaciones con `pii-identification` y `privacy-controls-as-code`), §18 (criterio de dominio) y §19 (laboratorio para F4). Sin cambios en las etiquetas existentes, aviso ni vigencia.
- 2026-10-28: pasa al dominio 24-privacy-engineering, tramo `fundamentos` (ADR-027), desde 19-compliance; sin cambios de contenido. La URL de la ficha (`/concepts/processing-activities-inventory/`) no cambia.
- 2026-10-30: Enmienda 3 de ADR-023: en §13, la tabla con la misma etiqueta en todas sus filas pasa a la línea «Etiqueta: […]» antes de la tabla, sin columna. Sin cambios de contenido.
- 2026-10-30: Enmienda 4 de ADR-023: 4 tabla(s) sin columna ni línea «Etiqueta»; la fila con origen legal lleva «Obligación legal» al inicio de su primera celda. Sin cambios de contenido.
- 2026-11-01: revisión `docs/reviews/p1.md` aplicada: el bloque `text` del §10 trae la salida completa que imprime el script, con todas las líneas que exige la CI.
- 2026-11-01: aprobada con lista explícita (`owner_approved_at: 2026-11-01`); pasa a `verified` (ADR-023).
- 2026-11-03: se quita del §1 el párrafo «Cómo leerla» (guía de lectura por tramos de secciones). Sin cambios de fondo; el estado no cambia.
- 2026-11-03: los principios del art. 3 se nombran (en negrita en el texto) en vez de por su letra, y se quita «(Título III)» de las otras bases del art. 13. Sin cambios de fondo; el estado no cambia.
- 2026-11-03: §10 reescrito de punta a punta: registro → usos observados (cuenta, activo, columnas) → conciliación → insumo del art. 14 ter → código de salida 0/1, con funciones que reciben el registro como parámetro; `Base` como `Literal` con el artículo en un mapa aparte, plazo en meses, aprobación con vencimiento y campos permitidos; brechas nuevas de **proporcionalidad**, consentimiento sin registro, aprobación vencida y consumidor no identificado (`UNKNOWN`); marcadores `# @paso 1–4` y tres escenarios (`actual`, `corregido`, `despliegue-nuevo`) con su línea `$ python inventario.py <escenario>`, iguales a la salida de la CI. §8 suma la evidencia de la conciliación y §15 el consumidor sin identificar. Vuelve a `review_required` hasta la aprobación.
- 2026-11-04: aprobada con el §10 nuevo (`owner_approved_at: 2026-11-04`); vuelve a `verified` (ADR-023).
- 2026-11-04: revisión `docs/reviews/p10.md` aplicada: el §10 separa la conciliación operacional (`actual` y `corregido`: alerta sobre consumos que ya corren, 1 con hallazgos) de la puerta de la CI (`despliegue-nuevo`: cuatro despliegues contra el registro de hoy, tres bloqueados); un despliegue con su actividad sin aprobación vigente se informa como «actividad no vigente», no como «no declarado». Limitación «Momento», §8 y §9 ajustados. Vuelve a `review_required`.
- 2026-11-04: aprobada con la revisión P10 y su verificación aplicadas (limitación «Cobertura»: `UNKNOWN` es alerta en la conciliación y bloqueo en la puerta de despliegue) (`owner_approved_at: 2026-11-04`); vuelve a `verified` (ADR-023).
- 2026-11-17: la ficha pasa al formato de vistas (ADR-030, enmienda 9) desde la maqueta: 13 secciones, con «Qué exige la ley», «Arquitectura» y el código nuevo (`inventario.py`, 308 líneas, tres escenarios). Queda disponible y `review_required`: los textos legales nuevos esperan la aprobación del dueño (ADR-023).
