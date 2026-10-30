const BCN = "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01";

export type ChileFicha =
  | { kind: "self"; label: string; href?: string }
  | { kind: "page"; slug: string; title: string };

export type ChileArticle = {
  article: string;
  title: string;
  basis: string;
  implication: string;
  precision: string | null;
  fichas: ChileFicha[];
  url: string;
};

export type ChileGroup = {
  id: string;
  title: string;
  articles: ChileArticle[];
};

const page = (slug: string, title: string): ChileFicha => ({ kind: "page", slug, title });
const self = (label: string, href?: string): ChileFicha => ({ kind: "self", label, href });

function article(
  articleId: string,
  title: string,
  basis: string,
  implication: string,
  precision: string | null,
  fichas: ChileFicha[],
): ChileArticle {
  return { article: articleId, title, basis, implication, precision, fichas, url: BCN };
}

export const CHILE_INTRO =
  "La Ley 19.628, modificada por la Ley 21.719, establece un marco de protección de datos personales. En Ingeniería de Datos, su aplicación se traduce en identificar los datos tratados, controlar sus usos, implementar salvaguardas y conservar evidencia de los controles. La interpretación y las decisiones jurídicas corresponden a las áreas responsables.";

export const CHILE_PRINCIPLES = [
  "a) Licitud y lealtad.",
  "b) Finalidad.",
  "c) Proporcionalidad.",
  "d) Calidad.",
  "e) Responsabilidad.",
  "f) Seguridad.",
  "g) Transparencia e información.",
  "h) Confidencialidad.",
];

export const CHILE_GROUPS: ChileGroup[] = [
  {
    id: "lf-fundamentos",
    title: "Fundamentos, alcance y principios",
    articles: [
      article(
        "1 bis",
        "Ámbito territorial",
        "Ámbito territorial, también para responsables o encargados fuera de Chile en los casos que indica.",
        "También alcanza al encargado fuera de Chile que trata por cuenta de un responsable en Chile y a quien, desde fuera, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento: el inventario de flujos los incluye.",
        "También se aplica a quien, desde fuera de Chile, ofrece bienes o servicios a titulares en Chile o monitorea su comportamiento.",
        [page("processors-and-international-transfers", "Encargados y transferencias internacionales")],
      ),
      article(
        "2",
        "Definiciones",
        "Definiciones.",
        "Dato personal, sensible, anonimización, seudonimización, perfiles y encargado son las categorías con que se clasifican columnas, datasets y proveedores.",
        "Dato personal, sensible, anonimización, seudonimización, perfiles, encargado.",
        [
          page("pii-identification", "Identificación de datos personales y sensibles"),
          page("chilean-identifier-pseudonymization", "Seudonimización de identificadores chilenos"),
        ],
      ),
      article(
        "3",
        "Principios del tratamiento",
        "Principios, letras a) a h).",
        "Cada principio necesita un control y una evidencia.",
        "Cada principio (letras a a h) necesita un control y una evidencia.",
        [self("Esta ficha")],
      ),
    ],
  },
  {
    id: "lf-derechos",
    title: "Derechos y decisiones automatizadas",
    articles: [
      article(
        "4",
        "Derechos del titular",
        "Derechos del titular; desarrollados en los arts. 5 a 11.",
        "Seis tipos de solicitud que la plataforma atiende con plazo y evidencia.",
        "Acceso, rectificación, supresión, oposición, portabilidad y bloqueo; los arts. 5 a 11 los desarrollan.",
        [page("data-subject-rights-pipeline", "Pipeline de derechos del titular")],
      ),
      article(
        "8 bis",
        "Decisiones individuales automatizadas",
        "Decisiones individuales automatizadas.",
        "Explicación, intervención humana y revisión en los modelos que deciden.",
        "Explicación, intervención humana y revisión de decisiones automatizadas.",
        [page("dpia-and-automated-decisions", "Evaluación de impacto y decisiones automatizadas")],
      ),
    ],
  },
  {
    id: "lf-licitud",
    title: "Licitud, responsabilidad y transparencia",
    articles: [
      article(
        "12",
        "Consentimiento y licitud",
        "Consentimiento; el responsable prueba la licitud.",
        "Las bases de licitud se registran por actividad de tratamiento.",
        "Consentimiento; el responsable prueba que lo obtuvo y que el tratamiento fue lícito (las demás bases, en el art. 13).",
        [page("processing-activities-inventory", "Inventario de actividades de tratamiento")],
      ),
      article(
        "14",
        "Obligaciones del responsable",
        "Obligaciones del responsable.",
        "Acreditar la licitud; suprimir o anonimizar los datos precontractuales.",
        "Acreditar la licitud; suprimir o anonimizar datos precontractuales.",
        [page("processing-activities-inventory", "Inventario de actividades de tratamiento")],
      ),
      article(
        "14 bis",
        "Secreto y confidencialidad",
        "Secreto o confidencialidad, también de datos públicos organizados o combinados.",
        "El secreto alcanza a datos públicos que se organizan o combinan.",
        "El secreto alcanza datos públicos que se organizan o combinan.",
        [self("Esta ficha")],
      ),
      article(
        "14 ter",
        "Información y transparencia",
        "Información y transparencia.",
        "La política pública se alimenta del catálogo.",
        "La política pública de tratamiento se alimenta del catálogo.",
        [page("processing-activities-inventory", "Inventario de actividades de tratamiento")],
      ),
    ],
  },
  {
    id: "lf-diseno",
    title: "Privacidad desde el diseño y seguridad",
    articles: [
      article(
        "14 quáter",
        "Protección desde el diseño y por defecto",
        "Protección desde el diseño y por defecto.",
        "Minimización por defecto: número de datos, extensión del tratamiento, plazo de conservación y accesibilidad.",
        "Por defecto, solo los datos estrictamente necesarios.",
        [page("data-minimization-by-layer", "Minimización por capa")],
      ),
      article(
        "14 quinquies",
        "Medidas de seguridad",
        "Medidas de seguridad y verificación regular; ante un incidente, si hay controversia judicial o administrativa, el responsable acredita sus medidas.",
        "Cifrado, seudonimización, resiliencia, restauración y verificación periódica de las medidas.",
        "Seguridad, restauración y verificación regular de su eficacia.",
        [page("privacy-controls-as-code", "Controles de privacidad como código")],
      ),
      article(
        "14 sexies",
        "Vulneraciones de seguridad",
        "Reporte de vulneraciones a la Agencia, registro de esas comunicaciones y aviso a titulares en ciertos casos.",
        "Dimensionar la vulneración para reportarla, registrar la comunicación y decidir el aviso a los titulares.",
        "Reporte de vulneraciones a la Agencia y registro de esas comunicaciones; aviso a titulares en ciertos casos.",
        [page("data-breach-response", "Respuesta ante vulneraciones")],
      ),
    ],
  },
  {
    id: "lf-encargados",
    title: "Encargados, impacto y datos sensibles",
    articles: [
      article(
        "15 bis",
        "Tratamiento por un encargado",
        "Tratamiento por un encargado.",
        "El encargado cumple secreto y seguridad, reporta las vulneraciones y suprime o devuelve al terminar.",
        "Encargo; el encargado suprime o devuelve al terminar (la cesión, en el art. 15).",
        [page("processors-and-international-transfers", "Encargados y transferencias internacionales")],
      ),
      article(
        "15 ter",
        "Evaluación de impacto",
        "Evaluación de impacto.",
        "Evaluación de impacto obligatoria en los casos que el artículo enumera.",
        "Evaluación de impacto en casos tasados.",
        [page("dpia-and-automated-decisions", "Evaluación de impacto y decisiones automatizadas")],
      ),
      article(
        "16",
        "Datos sensibles",
        "Datos sensibles; reglas especiales en los arts. 16 bis a 16 sexies.",
        "Reglas más estrictas por categoría de dato sensible.",
        "Datos sensibles: consentimiento expreso, salvo excepciones; salud, biométricos, niños, niñas y adolescentes, investigación y geolocalización, en los arts. 16 bis a 16 sexies.",
        [page("pii-identification", "Identificación de datos personales y sensibles")],
      ),
    ],
  },
  {
    id: "lf-transferencias",
    title: "Transferencias, sanciones y prevención",
    articles: [
      article(
        "27",
        "Transferencias internacionales",
        "Transferencia internacional.",
        "Región de la nube, proveedores y APIs externas: cada flujo al exterior necesita un mecanismo.",
        "Transferencia internacional: cuándo es lícita (países adecuados y cláusulas, en el art. 28).",
        [page("processors-and-international-transfers", "Encargados y transferencias internacionales")],
      ),
      article(
        "35",
        "Sanciones",
        "Sanciones.",
        "Varias infracciones nacen de fallas técnicas.",
        "Sanciones por tipo de infracción (las infracciones, en los arts. 34 bis a 34 quáter); varias nacen de fallas técnicas.",
        [self("Esta ficha (§16)", "#s16")],
      ),
      article(
        "49",
        "Modelo de prevención de infracciones",
        "Modelo de prevención de infracciones: los responsables pueden adoptarlo voluntariamente (art. 49); el certificado del art. 51 acredita el atenuante del art. 36 n.º 5; reglamento en el Decreto 662.",
        "Mantener controles, responsables y evidencia vinculados al modelo voluntario de prevención, según corresponda.",
        null,
        [page("privacy-controls-as-code", "Controles de privacidad como código")],
      ),
    ],
  },
];

export const CHILE_ROLES = [
  "Legal, privacidad y negocio: definen finalidad, base de licitud y plazos aplicables.",
  "Seguridad: define y evalúa el riesgo y las medidas de protección.",
  "Ingeniería de Datos: implementa controles técnicos, automatización, trazabilidad y evidencia.",
  "Responsable del tratamiento: conserva las responsabilidades legales que le corresponden.",
];

export const CHILE_CHILD_TITLES: Readonly<Record<string, string>> = {
  "processors-and-international-transfers": "Encargados y transferencias internacionales",
  "pii-identification": "Identificación de datos personales y sensibles",
  "chilean-identifier-pseudonymization": "Seudonimización de identificadores chilenos",
  "data-subject-rights-pipeline": "Pipeline de derechos del titular",
  "dpia-and-automated-decisions": "Evaluación de impacto y decisiones automatizadas",
  "processing-activities-inventory": "Inventario de actividades de tratamiento",
  "data-minimization-by-layer": "Minimización por capa",
  "privacy-controls-as-code": "Controles de privacidad como código",
  "data-breach-response": "Respuesta ante vulneraciones",
  "retention-and-erasure": "Retención y supresión",
  "purpose-based-authorization": "Autorización por finalidad",
  "distributed-erasure-propagation": "Propagación de supresiones en sistemas distribuidos",
  "privacy-backup-and-recovery": "Respaldos y recuperación con privacidad",
  "privacy-in-ai-rag-llm": "Privacidad en IA, RAG y LLM",
  "data-classification": "Clasificación de datos",
};

export const CHILE_NOTES = [
  "Art. 12: la carga de probar la licitud corresponde al responsable; las demás bases de licitud se tratan en el art. 13.",
  "Art. 15 bis: el encargado trata según el encargo; si se aparta de él, puede responder como responsable.",
  "Las decisiones de arquitectura son elecciones de diseño y no deben presentarse automáticamente como exigencias legales.",
];
