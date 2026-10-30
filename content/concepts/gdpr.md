---
id: concept:gdpr
slug: gdpr
type: concept
title: GDPR
description: "Una plataforma chilena con clientes en la UE, ¿qué tiene que hacer distinto? El RGPD alcanza a quien, sin estar en la Unión, trata datos de interesados que residan en ella al ofrecerles bienes o servicios o al seguir su comportamiento allí. Comparación con la Ley 21.719 para ingeniería: bases, plazos, registro, evaluación de impacto, brechas, transferencias, delegado y decisiones automatizadas. Reglas por jurisdicción versionadas y un resolvedor en la CI. No es asesoría legal."
domain: privacy-engineering
subdomain: regulatory-frameworks
category: compliance
classification: core
level: intermediate
importance: medium
cloud: [agnostic]
technologies: [python]
tags: [compliance, privacy, gdpr, international-transfers, data-residency]
related_topics: [processors-and-international-transfers]
aliases: [rgpd, Reglamento General de Protección de Datos]
jurisdiction: [CL, EU]
legal_basis:
  - {law: eu-2016-679, article: "3", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 2: tratamiento de datos de interesados que residan en la Unión por un responsable o encargado no establecido en ella, cuando se relaciona con la oferta de bienes o servicios, pagados o no, o con el control de su comportamiento en la Unión.", implication: "Saber qué productos ofrecen servicios a personas en la UE o las perfilan."}
  - {law: eu-2016-679, article: "6", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Licitud: al menos una de las condiciones del apartado 1.", implication: "Una base por actividad, registrada con su fuente."}
  - {law: eu-2016-679, article: "12", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 3: un mes desde la recepción de la solicitud, prorrogable otros dos meses en caso necesario.", implication: "Plazo de respuesta por jurisdicción en la configuración."}
  - {law: eu-2016-679, article: "22", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: derecho a no ser objeto de una decisión basada únicamente en el tratamiento automatizado.", implication: "Ruta de intervención humana por modelo que decide."}
  - {law: eu-2016-679, article: "27", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: cuando se aplica el art. 3.2, designar por escrito un representante en la Unión.", implication: "Un dato más del inventario: quién es el representante."}
  - {law: eu-2016-679, article: "30", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Registro de las actividades de tratamiento; apartado 5: excepción para organizaciones de menos de 250 personas, con salvedades.", implication: "El inventario de actividades es la base del registro."}
  - {law: eu-2016-679, article: "33", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: notificar a la autoridad de control sin dilación indebida y, de ser posible, a más tardar 72 horas después de tener constancia, salvo que sea improbable que la violación constituya un riesgo para los derechos y libertades.", implication: "Reloj de 72 horas desde la constancia, con su marca de tiempo."}
  - {law: eu-2016-679, article: "34", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: con probable alto riesgo, comunicar al interesado sin dilación indebida.", implication: "Calcular el alcance por titular y por jurisdicción."}
  - {law: eu-2016-679, article: "35", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: evaluación de impacto cuando sea probable un alto riesgo.", implication: "Puerta antes de producción, compartida con la del art. 15 ter."}
  - {law: eu-2016-679, article: "37", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: delegado de protección de datos en los casos que enumera, entre ellos la observación habitual y sistemática a gran escala y las categorías especiales a gran escala.", implication: "El delegado como destinatario de las alertas de privacidad."}
  - {law: eu-2016-679, article: "45", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 1: transferencia a un tercer país con decisión de adecuación de la Comisión.", implication: "La lista de adecuación es configuración con fecha."}
  - {law: eu-2016-679, article: "46", url: "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807", note: "Apartado 2 c): cláusulas tipo de protección de datos adoptadas por la Comisión.", implication: "Mecanismo por flujo cuando no hay adecuación."}
  - {law: ley-19628, article: "1 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Ámbito territorial, también para quien desde fuera ofrece bienes o servicios a titulares que se encuentren en Chile o monitorea su comportamiento.", implication: "Una pregunta de alcance parecida, con otro criterio: la ley chilena mira dónde se encuentra el titular; el art. 3.2 del RGPD, a los interesados que residan en la Unión."}
  - {law: ley-19628, article: "8 bis", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Oponerse y no ser objeto de decisiones basadas en el tratamiento automatizado.", implication: "La misma ruta de revisión humana sirve a las dos normas."}
  - {law: ley-19628, article: "11", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Respuesta a más tardar dentro de treinta días corridos, prorrogable una vez hasta por igual período.", implication: "Otro plazo y otra unidad en la configuración."}
  - {law: ley-19628, article: "12", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Licitud con el consentimiento del titular.", implication: "Una base por actividad, como en el RGPD."}
  - {law: ley-19628, article: "13", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Licitud sin consentimiento en los casos que enumera.", implication: "Las bases no coinciden una a una con las del art. 6 del RGPD."}
  - {law: ley-19628, article: "14 ter", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Información y política de tratamiento disponible.", implication: "El inventario alimenta la política chilena y el registro europeo."}
  - {law: ley-19628, article: "14 sexies", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Reportar a la Agencia por los medios más expeditos y sin dilaciones indebidas las vulneraciones, cuando exista un riesgo razonable para los derechos y libertades de los titulares; comunicar a los titulares en los casos que indica.", implication: "Sin plazo en horas: el objetivo interno lo fija el área legal."}
  - {law: ley-19628, article: "15 ter", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Evaluación de impacto cuando el tratamiento pueda producir un alto riesgo.", implication: "Una sola evaluación con secciones por jurisdicción."}
  - {law: ley-19628, article: "27", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Casos en que son lícitas las transferencias internacionales.", implication: "Cada flujo al exterior necesita un mecanismo, también desde Chile."}
  - {law: ley-19628, article: "28", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Países con niveles adecuados de protección, determinados por la Agencia.", implication: "La adecuación chilena es otra lista, distinta de la europea."}
  - {law: ley-19628, article: "49", url: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01", note: "Modelo de prevención de infracciones, de adopción voluntaria; incluye la designación de un delegado de protección de datos.", implication: "En Chile el delegado depende del modelo; en la UE, de los casos del art. 37."}
sources:
  - source: boe-doue
    url: https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807
    accessed: 2026-10-30
    page_title: "Documento DOUE-L-2016-80807"
    note: "Reglamento (UE) 2016/679 (RGPD), «DOUE» núm. 119, de 4 de mayo de 2016, texto original en español reproducido por el BOE; EUR-Lex no respondió a la lectura automática el 2026-10-30. Art. 3.2: «El presente Reglamento se aplica al tratamiento de datos personales de interesados que residan en la Unión por parte de un responsable o encargado no establecido en la Unión», cuando se relaciona con «la oferta de bienes o servicios a dichos interesados en la Unión, independientemente de si a estos se les requiere su pago» o con «el control de su comportamiento, en la medida en que este tenga lugar en la Unión». Art. 6.1: «El tratamiento solo será lícito si se cumple al menos una de las siguientes condiciones». Art. 12.3: «en el plazo de un mes a partir de la recepción de la solicitud»; «Dicho plazo podrá prorrogarse otros dos meses en caso necesario». Art. 22.1: «Todo interesado tendrá derecho a no ser objeto de una decisión basada únicamente en el tratamiento automatizado». Art. 27.1: representante en la Unión, designado por escrito, cuando se aplica el art. 3.2. Art. 30.1: «Cada responsable y, en su caso, su representante llevarán un registro de las actividades de tratamiento»; 30.5: excepción para quien «emplee a menos de 250 personas», con salvedades. Art. 33.1: «sin dilación indebida y, de ser posible, a más tardar 72 horas después de que haya tenido constancia de ella, a menos que sea improbable que dicha violación de la seguridad constituya un riesgo para los derechos y las libertades de las personas físicas». Art. 27.2: excepciones para el tratamiento ocasional e improbablemente riesgoso y para autoridades u organismos públicos. Art. 34.1: «Cuando sea probable que la violación de la seguridad de los datos personales entrañe un alto riesgo». Art. 35.1: evaluación de impacto cuando sea probable un alto riesgo. Art. 37.1 b) y c): observación habitual y sistemática a gran escala; categorías especiales a gran escala. Art. 45.1: transferencia con decisión de adecuación. Art. 46.2 c): «cláusulas tipo de protección de datos adoptadas por la Comisión»."
  - source: bcn-leychile
    url: https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01
    accessed: 2026-10-30
    page_title: "Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES"
    note: "Ley 19.628 con las modificaciones de la Ley 21.719 (versión con vigencia diferida desde 2026-12-01), consultada el 2026-10-30. Art. 1 bis c): responsable o mandatario no establecido en Chile cuyas operaciones «estén destinadas a ofrecer bienes o servicios a titulares que se encuentren en Chile», o a monitorear su comportamiento. Art. 8 bis: «El titular de datos tiene derecho a oponerse y a no ser objeto de decisiones basadas en el tratamiento» automatizado. Art. 11: respuesta «a más tardar dentro de los treinta días corridos siguientes a la fecha de ingreso de la solicitud», prorrogable por una vez hasta por igual período. Art. 12: licitud con consentimiento. Art. 13: «Es lícito el tratamiento de datos personales, sin el consentimiento del titular, en los siguientes casos». Art. 14 ter a): la política de tratamiento, su fecha y versión. Art. 14 sexies: «El responsable deberá reportar a la Agencia, por los medios más expeditos posibles y sin dilaciones indebidas» las vulneraciones a las medidas de seguridad, «cuando exista un riesgo razonable para los derechos y libertades de los titulares»; en los casos que indica, «deberá también efectuar esta comunicación a los titulares». Art. 15 ter: evaluación de impacto cuando el tratamiento «pueda producir un alto riesgo». Arts. 27 y 28: transferencias internacionales lícitas y países con niveles adecuados. Art. 49: «Los responsables de datos podrán voluntariamente adoptar un modelo de prevención de infracciones», con «La designación de un delegado de protección de datos personales»."
  - source: camara-legin
    url: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html
    accessed: 2026-10-30
    page_title: "LEI Nº 13.709, DE 14 DE AGOSTO DE 2018"
    note: "Lei 13.709/2018 (LGPD), texto actualizado de la Câmara dos Deputados, consultado el 2026-10-30, para la columna LGPD de la comparación: art. 19, II, «no prazo de até 15 (quinze) dias, contado da data do requerimento do titular»; art. 48, comunicar «à autoridade nacional e ao titular»; § 1º, «em prazo razoável, conforme definido pela autoridade nacional». El detalle está en la ficha `lgpd`."
  - source: anpd-docs
    url: https://www.gov.br/anpd/pt-br/assuntos/incidente-de-seguranca
    accessed: 2026-10-30
    page_title: "Comunicação de Incidente de Segurança"
    note: "ANPD, *Comunicação de Incidente de Segurança*, para la columna LGPD: según los arts. 6 y 9 de la Resolución CD/ANPD nº 15/2024, «a comunicação à ANPD e ao(s) titular(es) deverá ser realizada pelo controlador no prazo de três (3) dias úteis» (la comunicación a la ANPD y a los titulares se hace en tres días hábiles), salvo plazo de legislación específica. La página no dice desde cuándo se cuenta."
  - source: mj-biblioteca-digital
    url: https://bibliotecadigital.mj.gov.br/bitstream/1/12879/2/RES_ANPD_2024_15.html
    accessed: 2026-10-30
    page_title: "resolução CD/ANPD Nº 15, de 24 de abril de 2024"
    note: "Resolución CD/ANPD nº 15/2024 (Regulamento de Comunicação de Incidente de Segurança), copia del acto en la Biblioteca Digital del Ministerio de Justicia (SEI/MJ); el Diário Oficial da União (in.gov.br) no respondió el 2026-10-30. Art. 6º: «A comunicação de incidente de segurança à ANPD deverá ser realizada pelo controlador no prazo de três dias úteis»; § 1º: «O prazo a que se refere o caput será contado do conhecimento pelo controlador de que o incidente afetou dados pessoais» (se cuenta desde que el controlador sabe que el incidente afectó datos personales); § 3º: complementación «no prazo de vinte dias úteis»; § 8º: plazos «contados em dobro para os agentes de pequeno porte» (el doble para agentes de pequeño porte). Art. 9º: al titular, «no prazo de três dias úteis, contados do conhecimento pelo controlador de que o incidente afetou dados pessoais»."
  - source: ec-data-protection
    url: https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en
    accessed: 2026-10-30
    page_title: "Adequacy decisions"
    note: "Comisión Europea, *Adequacy decisions* (título de la página: «Data protection adequacy for non-EU countries»): con una decisión de adecuación, «personal data can flow from the EU (and Norway, Liechtenstein and Iceland) to that third country without any further safeguard being necessary» (los datos pueden salir de la UE, y de Noruega, Liechtenstein e Islandia, hacia ese tercer país sin otra garantía). La lista incluye a Brasil y no incluye a Chile al 2026-10-30."
  - source: gcp-organization-policy-docs
    url: https://docs.cloud.google.com/organization-policy/restrict-locations
    accessed: 2026-10-30
    page_title: "Restrict resource locations"
    note: "Restrict resource locations: grupos de valores curados por Google; `in:eu-locations` es «All locations within European Union»; `in:southamerica-locations` incluye `br-locations` y `cl-locations`. La restricción se aplica a recursos nuevos."
  - source: gcp-assured-workloads-docs
    url: https://docs.cloud.google.com/assured-workloads/docs/data-residency
    accessed: 2026-10-30
    page_title: "Data residency"
    note: "Data residency (Assured Workloads): «Google Cloud gives you the ability to control where that data is stored»; «Customer Data does not include resource identifiers, attributes, or other data labels»; los compromisos cubren Customer Data en reposo de los servicios que permiten configurar su ubicación; si la región es de la UE, el Customer Data en uso se procesa dentro de la UE."
  - source: aws-global-infrastructure-docs
    url: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html
    accessed: 2026-10-30
    page_title: "AWS Regions"
    note: "AWS Regions: la geografía de una región es la ubicación física de su infraestructura. Regiones con geografía en la UE: eu-central-1 (Germany), eu-west-1 (Ireland), eu-south-1 (Italy, opt-in), eu-west-3 (France), eu-south-2 (Spain, opt-in), eu-north-1 (Sweden). eu-west-2 es United Kingdom y eu-central-2 es Switzerland. Las regiones posteriores al 20 de marzo de 2019 se habilitan antes de usarlas."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html
    accessed: 2026-10-21
    page_title: "AWS global condition context keys"
    note: "AWS global condition context keys: aws:RequestedRegion controla qué endpoint regional se invoca, no el impacto de la operación; algunos servicios tienen efectos entre regiones, como la replicación de Amazon S3. «Some global services, such as IAM, have a single endpoint»: «IAM calls are always made to the us-east-1 Region» (las llamadas a IAM van siempre a us-east-1)."
  - source: microsoft-eu-data-boundary-docs
    url: https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-learn
    accessed: 2026-10-30
    page_title: "What is the EU Data Boundary?"
    note: "What is the EU Data Boundary?: límite geográfico (países de la UE y de la EFTA) en el que Microsoft se compromete a almacenar y procesar Customer Data y datos personales de sus servicios empresariales, incluido Azure, «subject to limited circumstances» en que siguen transfiriéndose fuera; en Azure, los servicios regionales desplegados en una región del EU Data Boundary quedan dentro, y los no regionales requieren su configuración."
  - source: azure-policy-docs
    url: https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-policies
    accessed: 2026-10-21
    page_title: "List of built-in policy definitions"
    note: "List of built-in policy definitions (Azure Policy): «Allowed locations» restringe las ubicaciones de despliegue; excluye resource groups, Microsoft.AzureActiveDirectory/b2cDirectories y los recursos de la región «global»."
relations:
  - {type: PART_OF, target: chile-data-protection, note: "Ficha padre del dominio."}
  - {type: RELATED_TO, target: lgpd, note: "El otro marco comparado del tramo."}
  - {type: RELATED_TO, target: processors-and-international-transfers, note: "Mecanismo por flujo y regiones."}
  - {type: RELATED_TO, target: data-breach-response, note: "El reloj de 72 horas junto al reporte chileno."}
  - {type: RELATED_TO, target: data-subject-rights-pipeline, note: "Plazos de respuesta por jurisdicción."}
  - {type: RELATED_TO, target: processing-activities-inventory, note: "Base del registro del art. 30."}
  - {type: RELATED_TO, target: dpia-and-automated-decisions, note: "Evaluación de impacto y decisiones automatizadas."}
created_at: 2026-10-30
updated_at: 2026-10-30
last_verified: 2026-10-30
verification_status: review_required
---

## 1. Resumen

Esta ficha no es asesoría legal: explica qué cambia en una plataforma de datos cuando también trata datos de personas en la Unión Europea. Si el RGPD aplica, qué base corresponde o qué mecanismo usar lo decide el área legal.

**Pregunta guía:** una plataforma chilena que trata datos de residentes de la UE, ¿qué tiene que hacer distinto? Ingeniería no necesita otra plataforma: necesita saber qué datos, productos y flujos quedan bajo el RGPD, tener sus plazos y destinatarios como **configuración versionada por jurisdicción** y producir evidencia que sirva a las dos normas.

**Cómo leerla.** *Comprender* (§1–6): cuándo alcanza el RGPD a una empresa chilena y en qué difiere de la Ley 21.719. *Aplicar* (§7–13): reglas por jurisdicción y residencia en las tres nubes. *Demostrar*: la evidencia del §8, el resolvedor del §10 y los criterios del §18.

Las citas del RGPD vienen de su versión oficial en español (BOE, reproducción del DOUE); no necesitan traducción.

## 2. Qué es

- **[Obligación legal · GDPR art. 3]** El Reglamento (UE) 2016/679 «se aplica al tratamiento de datos personales de interesados que residan en la Unión por parte de un responsable o encargado no establecido en la Unión», cuando el tratamiento se relaciona con «la oferta de bienes o servicios a dichos interesados en la Unión, independientemente de si a estos se les requiere su pago», o con «el control de su comportamiento, en la medida en que este tenga lugar en la Unión».
- **[Obligación legal · GDPR art. 27]** En ese caso, el responsable o encargado designa por escrito un representante en la Unión, con las excepciones del propio artículo.
- **[Obligación legal · Ley 19.628, art. 1 bis]** La ley chilena alcanza a quien, desde fuera de Chile, ofrece bienes o servicios a titulares «que se encuentren en Chile» o monitorea su comportamiento. **[Buena práctica]** Es otro criterio: Chile mira dónde se encuentra el titular; el art. 3.2 del RGPD, a los interesados que residan en la Unión.
- **[Buena práctica]** Que un dato esté guardado en Chile no saca el tratamiento del RGPD, y que esté en una región europea no lo pone bajo él: decide la relación con las personas (oferta o seguimiento), no la ubicación del servidor.
- **[Buena práctica]** Comparación en lo que impacta a ingeniería. Cada fila lleva la etiqueta del RGPD; la columna chilena se etiqueta en el §4 y la brasileña en la ficha `lgpd`.

| Tema | Ley 21.719 (Chile) | RGPD (UE) | LGPD (Brasil) |
|---|---|---|---|
| **[Obligación legal · GDPR art. 6]** Bases de licitud | Consentimiento (art. 12) y casos sin consentimiento (art. 13) | «al menos una de las siguientes condiciones» del art. 6.1 | Hipótesis del art. 7 |
| **[Obligación legal · GDPR art. 12]** Plazo de respuesta a una solicitud | 30 días corridos, prorrogable una vez por igual período (art. 11) | Un mes, prorrogable otros dos meses (art. 12.3) | 15 días para la declaración completa (art. 19, II) |
| **[Obligación legal · GDPR art. 30]** Registro de actividades | Política de tratamiento disponible (art. 14 ter) | Registro de actividades, con excepción para menos de 250 personas y salvedades (art. 30) | Registro de las operaciones (art. 37) |
| **[Obligación legal · GDPR art. 35]** Evaluación de impacto | Si puede producir un alto riesgo (art. 15 ter) | Si es probable un alto riesgo (art. 35) | Relatório de impacto, si lo determina la ANPD (art. 38) |
| **[Obligación legal · GDPR art. 33]** Brecha: autoridad | Agencia, «sin dilaciones indebidas», sin plazo en horas, «cuando exista un riesgo razonable para los derechos y libertades de los titulares» (art. 14 sexies) | Autoridad de control, «sin dilación indebida y, de ser posible, a más tardar 72 horas» desde la constancia, salvo que el riesgo sea improbable (art. 33.1) | ANPD, plazo que define la autoridad (art. 48): 3 días hábiles desde que el controlador sabe que el incidente afectó datos personales, el doble para agentes de pequeño porte (Res. CD/ANPD 15/2024) |
| **[Obligación legal · GDPR art. 34]** Brecha: personas | Titulares, en los casos que indica (art. 14 sexies) | Interesados, con probable alto riesgo, sin dilación indebida (art. 34.1) | Titulares, con risco ou dano relevante (art. 48) |
| **[Obligación legal · GDPR art. 45]** Transferencias | País adecuado según la Agencia, cláusulas u otros instrumentos (arts. 27 y 28) | Decisión de adecuación (art. 45) o cláusulas tipo de la Comisión (art. 46.2 c)) | País adecuado o cláusulas-padrão (art. 33) |
| **[Obligación legal · GDPR art. 37]** Delegado | En el modelo de prevención voluntario (art. 49) | Obligatorio en los casos del art. 37.1 | Encarregado (art. 41) |
| **[Obligación legal · GDPR art. 22]** Decisiones automatizadas | Oponerse y no ser objeto de ellas (art. 8 bis) | No ser objeto de una decisión basada únicamente en el tratamiento automatizado (art. 22.1) | Pedir su revisión (art. 20) |

- **[Obligación legal · GDPR art. 46]** Sin decisión de adecuación, una vía son las «cláusulas tipo de protección de datos adoptadas por la Comisión».
- **[Buena práctica]** Las filas no son equivalencias: el mismo tema tiene otra unidad (horas, meses, días corridos o hábiles), otro destinatario u otra condición. Por eso cada regla va con su jurisdicción, su base y su fecha de revisión.

## 3. Problema que resuelve

**[Buena práctica]** Una agencia de viajes chilena vende paquetes en euros a clientes en España y Alemania y les envía ofertas según su historial. Un incidente expone reservas de clientes de los dos lados: el equipo de datos tiene que decir, en horas, cuántos titulares hay por jurisdicción, a quién se avisa y hasta cuándo. Si los plazos están escritos como `if pais == ...` en cinco servicios, cada cambio de norma obliga a buscarlos, y nadie puede mostrar qué regla se aplicó en cada fecha.

**[Obligación legal · GDPR art. 33]** El reloj europeo pide notificar sin dilación indebida y, de ser posible, en 72 horas desde la constancia, salvo que sea improbable que la violación constituya un riesgo. **[Obligación legal · Ley 19.628, art. 14 sexies]** El chileno no fija horas: pide reportar sin dilaciones indebidas cuando exista un riesgo razonable para los titulares. **[Decisión de arquitectura]** Las dos reglas viven en la misma configuración y el mismo incidente las resuelve a la vez.

## 4. Cómo funciona

1. **[Obligación legal · GDPR art. 3]** Determinar el alcance: qué productos ofrecen bienes o servicios a personas en la UE o siguen su comportamiento. **[Decisión de arquitectura]** Marcar esos productos y datasets con la jurisdicción en el catálogo.
2. **[Obligación legal · GDPR art. 30]** Llevar el registro de actividades. **[Obligación legal · Ley 19.628, art. 14 ter]** Del mismo inventario sale la política chilena. **[Decisión de arquitectura]** Un inventario con columnas por jurisdicción, no dos.
3. **[Obligación legal · GDPR art. 6]** Registrar la base de cada actividad bajo el RGPD. **[Obligación legal · Ley 19.628, art. 12]** Y bajo la ley chilena, con consentimiento o **[Obligación legal · Ley 19.628, art. 13]** en los casos sin consentimiento: las bases no coinciden una a una.
4. **[Obligación legal · GDPR art. 12]** Calcular el plazo de respuesta a cada solicitud según la jurisdicción del titular: un mes en la UE; **[Obligación legal · Ley 19.628, art. 11]** treinta días corridos en Chile.
5. **[Obligación legal · GDPR art. 35]** Evaluación de impacto antes de un tratamiento probablemente de alto riesgo. **[Obligación legal · Ley 19.628, art. 15 ter]** La ley chilena la pide en un supuesto parecido. **[Decisión de arquitectura]** Una sola evaluación con secciones por jurisdicción.
6. **[Obligación legal · GDPR art. 34]** Ante una brecha, calcular el alcance por jurisdicción y por titular para decidir las comunicaciones.
7. **[Obligación legal · GDPR art. 45]** Cada flujo que sale de la UE necesita adecuación o una garantía. **[Obligación legal · Ley 19.628, art. 27]** Cada flujo que sale de Chile, uno de los casos de la ley chilena, **[Obligación legal · Ley 19.628, art. 28]** con la adecuación que determine la Agencia.
8. **[Obligación legal · GDPR art. 22]** Los modelos que deciden sobre personas en la UE tienen una ruta de intervención humana. **[Obligación legal · Ley 19.628, art. 8 bis]** La misma ruta sirve a la ley chilena.
9. **[Obligación legal · GDPR art. 37]** Si el caso lo exige, el delegado de protección de datos recibe las alertas. **[Obligación legal · Ley 19.628, art. 49]** En Chile, el delegado forma parte del modelo de prevención de infracciones, que es voluntario.
10. **[Decisión de arquitectura]** Las reglas (plazo, unidad, prórroga, destinatario, condición, base) son un archivo versionado que revisa el área legal; el código solo lo interpreta.

## 5. Cuándo utilizarlo

- Al vender, ofrecer o enviar comunicaciones a personas en la UE, o al analizar su comportamiento en la Unión.
- Al recibir datos de una filial, un socio o un proveedor europeo.
- Al diseñar el runbook de incidentes, el pipeline de derechos o el inventario de una plataforma con clientes en varias jurisdicciones.

## 6. Cuándo no utilizarlo

- Para decidir si el RGPD aplica a un producto, qué base corresponde o si hay que designar representante o delegado: el área legal.
- Para resumir el RGPD completo: esta ficha cubre lo que impacta a ingeniería; sus capítulos sobre autoridades, sanciones y cooperación quedan fuera.
- Para tratar como iguales la Ley 21.719 y el RGPD: tienen plazos, unidades y destinatarios distintos.

## 7. Ejemplo sencillo

Una solicitud de acceso que llega el viernes 4 de diciembre de 2026, con fechas calculadas por el §10:

| Titular | Regla | Vence | Prórroga máxima |
|---|---|---|---|
| Cliente en Chile | 30 días corridos (art. 11) | 2027-01-03 | 2027-02-02 |
| Cliente en España | Un mes (art. 12.3) | 2027-01-04 | 2027-03-04 |
| Cliente en Brasil | 15 días (art. 19, II), días corridos como interpretación ilustrativa | 2026-12-19 | — |

## 8. Ejemplo de producción

Escenario genérico: la plataforma de datos de una agencia de viajes con clientes en Chile, la UE y Brasil.

| Control | Implementación posible | Qué demuestra y qué no |
|---|---|---|
| Jurisdicción en el catálogo | Etiqueta `jurisdiction` en productos y datasets, derivada del país de oferta o seguimiento | Qué datos se declararon bajo cada norma; no que la etiqueta sea correcta |
| Reglas versionadas | `rules/privacy-deadlines.yaml` revisado por el área legal, con versión y fecha | Qué regla estaba vigente en cada fecha; no que la interpretación sea la correcta |
| Reloj de incidentes | El runbook guarda la marca de tiempo de la constancia y llama al resolvedor | Qué vencimientos se calcularon; no que se haya notificado a tiempo |
| Residencia | Políticas de ubicación por proyecto o cuenta para los datos de la UE | Dónde se crean los recursos; no desde dónde accede el soporte |
| Flujos al exterior | Inventario de flujos con el mecanismo de cada origen | Qué mecanismo se declaró; no que el contrato esté firmado |

### Evidencia de cumplimiento

| Evidencia | Dónde queda | Quién la produce | Qué demuestra | Qué no demuestra |
|---|---|---|---|---|
| Archivo de reglas con historial | Repositorio | Área legal e ingeniería | Plazo, unidad y destinatario de cada jurisdicción en cada versión | Que la norma no haya cambiado después |
| Salida del resolvedor por incidente | Expediente del incidente | Runbook | Los vencimientos y destinatarios calculados con la versión usada | Que se haya notificado ni que el análisis de riesgo sea correcto |
| Inventario con jurisdicción y base | Catálogo | Ingeniería y área legal | Qué actividades están bajo cada norma y con qué base | Tratamientos no declarados |
| Políticas de ubicación | Configuración como código | Plataforma | Dónde se permiten recursos nuevos | Recursos anteriores, metadatos ni accesos remotos |

## 9. Arquitectura

```mermaid
flowchart TB
  E["Incidente o solicitud<br/>(marca de tiempo)"] --> J["Jurisdicciones afectadas<br/>(catálogo)"]
  R["Reglas versionadas<br/>(revisadas por legal)"] --> V["Resolvedor"]
  J --> V
  V --> O["Vencimientos y<br/>destinatarios"]
  O --> X["Expediente con la<br/>versión de las reglas"]
  O --> L["Área legal decide<br/>y comunica"]
```

El resolvedor calcula fechas; no decide si hay riesgo ni si la comunicación procede.

## 10. Código

```python
# Python 3.12+, biblioteca estándar. Resolvedor de plazos y destinatarios por jurisdicción (CL, UE, BR) para un
# incidente o una solicitud de acceso. Las reglas son configuración versionada: un cambio de norma o de reglamento es
# un cambio de datos revisado por el área legal, no un `if` nuevo en el código. Ilustrativo: no es asesoría legal.
from __future__ import annotations

import calendar
import datetime as dt
from dataclasses import dataclass
from typing import Literal

Event = Literal["breach", "access_request"]
Unit = Literal["hours", "days", "business_days", "months", "undue_delay"]


@dataclass(frozen=True)
class Rule:
    jurisdiction: str
    event: Event
    recipient: str
    amount: int
    unit: Unit
    basis: str
    literal: bool                # True: el plazo es literal de la norma; False: interpretación ilustrativa
    extension: int = 0           # prórroga máxima, en la misma unidad
    condition: str = ""          # cuándo aplica (lo decide el área legal, no el código)


RULES_VERSION = "2026-10-30"     # revisada contra BCN, BOE (DOUE), Câmara y ANPD ese día
RULES: tuple[Rule, ...] = (
    Rule("CL", "breach", "Agencia de Protección de Datos Personales", 0, "undue_delay", "Ley 19.628, art. 14 sexies", True,
         condition="hay riesgo razonable para los titulares"),
    Rule("CL", "breach", "titulares", 0, "undue_delay", "Ley 19.628, art. 14 sexies", True,
         condition="hay datos sensibles, de menores de 14 o de obligaciones económicas"),
    Rule("EU", "breach", "autoridad de control", 72, "hours", "GDPR art. 33.1", True,
         condition="hay riesgo para los derechos (salvo que sea improbable)"),
    Rule("EU", "breach", "interesados", 0, "undue_delay", "GDPR art. 34.1", True, condition="hay alto riesgo"),
    Rule("BR", "breach", "ANPD", 3, "business_days", "LGPD art. 48; Res. CD/ANPD 15/2024, arts. 6 y 9", False,
         condition="hay risco ou dano relevante (días hábiles sin feriados)"),
    Rule("BR", "breach", "titulares", 3, "business_days", "LGPD art. 48; Res. CD/ANPD 15/2024, arts. 6 y 9", False,
         condition="hay risco ou dano relevante (días hábiles sin feriados)"),
    Rule("CL", "access_request", "titular", 30, "days", "Ley 19.628, art. 11", True, extension=30),
    Rule("EU", "access_request", "interesado", 1, "months", "GDPR art. 12.3", True, extension=2),
    Rule("BR", "access_request", "titular", 15, "days", "LGPD art. 19, II", False,
         condition="se pide la declaración completa (días corridos)"),
)


def add_months(start: dt.datetime, months: int) -> dt.datetime:
    month = start.month - 1 + months
    year, month = start.year + month // 12, month % 12 + 1
    return start.replace(year=year, month=month, day=min(start.day, calendar.monthrange(year, month)[1]))


def add_business_days(start: dt.datetime, days: int) -> dt.datetime:
    current = start
    while days:
        current += dt.timedelta(days=1)
        if current.weekday() < 5:   # sin feriados: un calendario real es otra configuración por jurisdicción
            days -= 1
    return current


def due(start: dt.datetime, amount: int, unit: Unit) -> dt.datetime | None:
    match unit:
        case "hours":
            return start + dt.timedelta(hours=amount)
        case "days":
            return start + dt.timedelta(days=amount)
        case "business_days":
            return add_business_days(start, amount)
        case "months":
            return add_months(start, amount)
        case "undue_delay":
            return None   # sin plazo fijo: «sin dilación indebida»; se fija un objetivo interno aparte


def resolve(event: Event, jurisdictions: set[str], start: dt.datetime) -> list[str]:
    lines = []
    for code in sorted(jurisdictions):
        rules = [r for r in RULES if r.jurisdiction == code and r.event == event]
        if not rules:
            lines.append(f"{code}: sin regla configurada → revisar con el área legal antes de operar")
        for r in rules:
            when = due(start, r.amount, r.unit)
            text = when.isoformat(timespec="minutes") if when else "sin dilación indebida (sin plazo fijo)"
            if r.extension and when:
                extended = due(when, r.extension, r.unit)
                assert extended is not None
                text += f" (prórroga hasta {extended.date().isoformat()})"
            mark = "" if r.literal else " [ilustrativo]"
            cond = f" si {r.condition}" if r.condition else ""
            lines.append(f"{code} → {r.recipient}: {text}{cond} · {r.basis}{mark}")
    return lines


known = dt.datetime(2026, 12, 4, 10, 0, tzinfo=dt.UTC)   # viernes: constancia del incidente
print(f"reglas versión {RULES_VERSION}")
for line in resolve("breach", {"CL", "EU", "BR"}, known):
    print(line)
received = dt.datetime(2026, 12, 4, 10, 0, tzinfo=dt.UTC)
for line in resolve("access_request", {"CL", "EU", "BR", "AR"}, received):
    print(line)
```

Salida:

```text
reglas versión 2026-10-30
BR → ANPD: 2026-12-09T10:00+00:00 si hay risco ou dano relevante (días hábiles sin feriados) · LGPD art. 48; Res. CD/ANPD 15/2024, arts. 6 y 9 [ilustrativo]
BR → titulares: 2026-12-09T10:00+00:00 si hay risco ou dano relevante (días hábiles sin feriados) · LGPD art. 48; Res. CD/ANPD 15/2024, arts. 6 y 9 [ilustrativo]
CL → Agencia de Protección de Datos Personales: sin dilación indebida (sin plazo fijo) si hay riesgo razonable para los titulares · Ley 19.628, art. 14 sexies
CL → titulares: sin dilación indebida (sin plazo fijo) si hay datos sensibles, de menores de 14 o de obligaciones económicas · Ley 19.628, art. 14 sexies
EU → autoridad de control: 2026-12-07T10:00+00:00 si hay riesgo para los derechos (salvo que sea improbable) · GDPR art. 33.1
EU → interesados: sin dilación indebida (sin plazo fijo) si hay alto riesgo · GDPR art. 34.1
AR: sin regla configurada → revisar con el área legal antes de operar
BR → titular: 2026-12-19T10:00+00:00 si se pide la declaración completa (días corridos) · LGPD art. 19, II [ilustrativo]
CL → titular: 2027-01-03T10:00+00:00 (prórroga hasta 2027-02-02) · Ley 19.628, art. 11
EU → interesado: 2027-01-04T10:00+00:00 (prórroga hasta 2027-03-04) · GDPR art. 12.3
```

Limitaciones: los días hábiles no descuentan feriados; los 3 días hábiles brasileños corren desde que el controlador sabe que el incidente afectó datos personales (Res. CD/ANPD 15/2024, art. 6 § 1º y art. 9), y el ejemplo usa esa misma marca de tiempo; «un mes» se suma como mes calendario; el plazo brasileño de solicitudes se toma en días corridos y su inicio, como la fecha del requerimiento. Las reglas marcadas `[ilustrativo]` no son literales de la norma en su unidad o su conteo. Una jurisdicción sin regla no se resuelve por defecto: se informa.

## 11. GCP

| Necesidad | Servicio y alcance | Lo que no cubre |
|---|---|---|
| Recursos de datos de la UE solo en la UE | Organization Policy con el grupo `in:eu-locations` («All locations within European Union») | Recursos creados antes de la política |
| Compromiso de residencia | Assured Workloads, *Data residency*: si la región es de la UE, el Customer Data en uso se procesa dentro de la UE | «Customer Data does not include resource identifiers, attributes, or other data labels»: nombres de recursos y etiquetas no van con datos personales |

## 12. AWS

| Necesidad | Servicio y alcance | Lo que no cubre |
|---|---|---|
| Regiones con geografía en la UE | eu-central-1 (Germany), eu-west-1 (Ireland), eu-west-3 (France), eu-north-1 (Sweden); eu-south-1 (Italy) y eu-south-2 (Spain) requieren habilitarse | `eu-west-2` es United Kingdom y `eu-central-2` es Switzerland: el prefijo `eu-` no equivale a la UE |
| Limitar regiones | Condición `aws:RequestedRegion` en políticas | Controla el endpoint invocado, no los efectos entre regiones, como la replicación de S3; las llamadas a IAM van siempre a `us-east-1`, así que negar toda región fuera de la UE bloquea IAM |

## 13. Azure

| Necesidad | Servicio y alcance | Lo que no cubre |
|---|---|---|
| Compromiso de almacenar y procesar en la UE y la EFTA | EU Data Boundary: los servicios regionales de Azure en una región de la frontera quedan dentro | «subject to limited circumstances» en que siguen transfiriéndose datos fuera; los servicios no regionales requieren su configuración |
| Limitar ubicaciones | Azure Policy «Allowed locations» | Resource groups, `Microsoft.AzureActiveDirectory/b2cDirectories` y recursos de la región «global» |

## 14. Buenas prácticas

- **[Decisión de arquitectura]** Una regla por jurisdicción y evento, en datos versionados; nunca un `if` con el país en el código de los servicios.
- **[Buena práctica]** Guardar con cada cálculo la versión de las reglas usada, para reconstruir después qué se sabía.
- **[Buena práctica]** Separar la marca de tiempo de la constancia de la del incidente: el RGPD cuenta desde la constancia.
- **[Buena práctica]** Una jurisdicción sin regla bloquea y avisa; no hereda la regla de otra.
- **[Obligación legal · GDPR art. 37]** Si hay delegado, recibe las alertas del resolvedor. **[Buena práctica]** Registrar a quién se envió cada alerta.
- **[Buena práctica]** **Seguridad:** solo el área legal y los dueños de la plataforma aprueban cambios en el archivo de reglas, con revisión obligatoria en el repositorio.
- **[Buena práctica]** **Observabilidad:** alertar cuando un dataset con jurisdicción `EU` aparece en una región fuera de la política o cuando un incidente supera la mitad de su plazo sin cierre.
- **[Buena práctica]** **Costo:** residir en la UE solo los datos que lo necesitan; duplicar toda la plataforma por jurisdicción multiplica la infraestructura.

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Suponer que una región europea pone el tratamiento bajo el RGPD, o que una región chilena lo saca | Alcance mal calculado en el inventario y en los incidentes |
| Usar `eu-` como sinónimo de UE en AWS | Datos en Reino Unido o Suiza tratados como si estuvieran en la UE |
| Copiar el plazo de una norma a otra | Vencimientos en otra unidad (horas, meses, días corridos o hábiles) |
| Contar las 72 horas desde el incidente y no desde la constancia, o al revés sin registrar ambas | No se puede mostrar cuándo empezó el reloj |
| Plazos escritos en el código de cada servicio | Un cambio de norma exige buscar y desplegar en todos |

## 16. Trade-offs

| Opción | Gana | Cuesta |
|---|---|---|
| Reglas como configuración versionada | Cambios auditables y sin despliegue de código | Un proceso de revisión del archivo con el área legal |
| Residencia en la UE para todo dato europeo | Menos flujos que justificar | Duplicar infraestructura y latencia para el resto |
| Un inventario con columnas por jurisdicción | Una sola fuente para registro y política | Más campos obligatorios por actividad |

## 17. Conceptos relacionados

- `chile-data-protection`: ficha padre.
- `lgpd`: el otro marco comparado del tramo.
- `processors-and-international-transfers`: mecanismo por flujo y políticas de región.
- `data-breach-response`: el reporte chileno junto al reloj europeo.
- `data-subject-rights-pipeline`: plazos de respuesta por jurisdicción.
- `processing-activities-inventory`: base del registro de actividades.
- `dpia-and-automated-decisions`: evaluación de impacto y decisiones automatizadas.

## 18. Preguntas técnicas abiertas

1. ¿Qué productos de tu plataforma ofrecen bienes o servicios a personas en la UE o siguen su comportamiento?
2. ¿Dónde están hoy los plazos de respuesta y de incidentes: en datos o en código?
3. ¿Qué regiones de tu nube tienen datos de la UE, y cuáles tienen prefijo europeo sin estar en la UE?
4. ¿Qué flujos salen de la UE, y con qué mecanismo?

**Criterio de dominio:** dominas esta ficha si, ante un incidente o una solicitud, puedes decir qué jurisdicciones aplican y por qué, qué regla de qué versión se usó, cuándo vence cada plazo y quién es el destinatario, y qué parte de esa respuesta es cálculo y qué parte es decisión del área legal.

## 19. Laboratorio relacionado

Propuesta para F4: el archivo de reglas del §10 como YAML, cargado por el resolvedor; simular un incidente con titulares de Chile, la UE y Brasil, cambiar una regla en una rama y comprobar que la CI muestra la diferencia de vencimientos. Sin datos personales reales.

## 20. Fuentes

- BOE: *Documento DOUE-L-2016-80807* (Reglamento (UE) 2016/679, texto original en español).
- BCN Ley Chile: *Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES* (versión con vigencia diferida desde 2026-12-01).
- Câmara dos Deputados: *LEI Nº 13.709, DE 14 DE AGOSTO DE 2018* (texto actualizado).
- Comisión Europea: *Adequacy decisions*.
- Google Cloud: *Restrict resource locations*; *Data residency*.
- AWS: *AWS Regions*; *AWS global condition context keys*.
- Microsoft Learn: *What is the EU Data Boundary?*; *List of built-in policy definitions*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-30: RGPD (BOE, reproducción del DOUE; EUR-Lex no respondió a la lectura automática), Ley 19.628 en BCN, LGPD en la Câmara, lista de adecuación de la Comisión y páginas de GCP, AWS y Microsoft consultadas ese día. `review_required`: pasa a `verified` solo con la aprobación explícita de Felipe (`owner_approved_at`). Revisión mensual.

## 22. Historial de cambios importantes

- 2026-10-30: creación (lote P4), en el tramo 6 «Marcos regulatorios comparados», después de la Enmienda 5 de ADR-023 (jurisdicción EU y etiquetas «GDPR art. N»).
- 2026-10-30: la Enmienda de jurisdicciones pasa a ser la Enmienda 5 de ADR-023; cita de la Res. CD/ANPD 15/2024 (art. 6 § 1º y art. 9) sobre el inicio del plazo brasileño.
- 2026-10-30: Enmienda 4 de ADR-023: 4 tabla(s) sin columna ni línea «Etiqueta»; la fila con origen legal lleva «Obligación legal» al inicio de su primera celda. Sin cambios de contenido.
- 2026-10-30: revisión `docs/reviews/p4.md` aplicada (hallazgos legales tratados como altos): art. 3.2 con «interesados que residan en la Unión» y la frase del pago; art. 1 bis como presencia en Chile, en frase aparte; art. 33.1 con «sin dilación indebida», «de ser posible» y la salvedad del riesgo improbable; art. 14 sexies con el riesgo razonable; inicio y doble plazo de la ANPD; Comisión con Noruega, Liechtenstein e Islandia; IAM siempre en us-east-1; `page_title` de Azure Policy con su H1 y exclusión de b2cDirectories.
