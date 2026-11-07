import type { PipelineChain } from "@/lib/pipeline";

export const centralIdeaFixture = {
  checksTitle: "Puede, a la vez",
  checks: [
    "Ejecutarse sin errores",
    "Cumplir sus controles de calidad",
    "Entregar información confiable",
  ],
  status: "Eso no alcanza para decir que el tratamiento cumple.",
  risksTitle: "Y aun así",
  risks: [
    { text: "Utilizar datos para una finalidad no autorizada", tag: "Finalidad" },
    { text: "Recopilar o conservar información que no resulta necesaria", tag: "Proporcionalidad" },
    { text: "Exponer datos personales en accesos o transferencias", tag: "Seguridad" },
    { text: "Mantener copias que dificultan la rectificación o supresión", tag: "Derechos" },
    { text: "Carecer de trazabilidad para demostrar los controles", tag: "Evidencia" },
  ],
  closing:
    "La Ingeniería de Datos incorpora la privacidad como criterio de diseño y operación, no como una revisión posterior.",
};

export const vigenciaFixture = {
  asOf: "Estado al 2026-10-28",
  items: [
    {
      date: "2024-12-13",
      title: "Publicación",
      detail: "La Ley 21.719 se publica en el Diario Oficial.",
      state: "past" as const,
      links: [{ label: "Ley 21.719", href: "https://www.bcn.cl/leychile/navegar?idNorma=1209272" }],
    },
    {
      date: "2026-12-01",
      title: "Vigencia legal",
      detail: "Mientras no se publique otra ley, las modificaciones rigen desde esta fecha.",
      state: "current" as const,
      links: [
        {
          label: "Ley 19.628",
          href: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01",
        },
      ],
    },
    {
      date: "2027-12-01",
      title: "Fecha propuesta",
      detail: "El boletín 18.623-07 propone postergar la vigencia. Es un proyecto, no una ley.",
      state: "proposed" as const,
      links: [
        {
          label: "Boletín 18.623-07",
          href: "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07",
        },
      ],
    },
  ],
};

export const practiceLanesFixture = {
  start: {
    title: "Enfoque",
    text: "Conecta la obligación con una decisión de arquitectura que se puede verificar.",
  },
  lanes: [
    {
      title: "Requisito normativo",
      items: [{ title: "Qué exige la norma", text: "La obligación del responsable o del encargado, citada." }],
    },
    {
      title: "Riesgo identificado",
      items: [{ title: "Qué puede fallar", text: "La falla técnica que impediría cumplir ese requisito." }],
    },
    {
      title: "Control técnico",
      items: [
        {
          title: "Qué se decide",
          text: "La medida de arquitectura, desarrollo u operación que reduce el riesgo.",
          arq: true,
        },
      ],
    },
    {
      title: "Verificación",
      items: [{ title: "Qué se prueba", text: "La comprobación de que el control opera, no solo que está escrito." }],
    },
    {
      title: "Evidencia",
      items: [
        {
          title: "Qué queda registrado",
          text: "El resultado reciente que permite demostrar el control.",
          arq: true,
        },
      ],
    },
  ],
};

export const severityFixture = {
  levels: [
    {
      name: "Leve",
      level: 1 as const,
      amount: "5.000 UTM",
      note: "o amonestación escrita",
      examples: ["Responder solicitudes en forma incompleta o fuera de plazo (34 bis c))"],
    },
    {
      name: "Grave",
      level: 2 as const,
      amount: "10.000 UTM",
      examples: [
        "Datos innecesarios o inexactos (34 ter c) y d))",
        "Fallas de seguridad (j))",
        "Transferencias contra la ley (m))",
      ],
    },
    {
      name: "Gravísima",
      level: 3 as const,
      amount: "20.000 UTM",
      examples: [
        "Omitir en forma deliberada la comunicación de una vulneración (34 quáter f))",
        "No hacer la evaluación de impacto obligatoria (k))",
      ],
    },
  ],
};

export const sourcesFixture = {
  groups: [
    {
      title: "Norma y tramitación",
      layout: "list" as const,
      sources: [
        {
          title: "Ley 19.628, vigencia diferida",
          publisher: "BCN",
          level: "Nivel 1",
          why: "Texto con las modificaciones de la Ley 21.719 desde el 2026-12-01.",
          links: [
            {
              label: "Ley Chile",
              href: "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01",
            },
          ],
        },
        {
          title: "Boletín 18.623-07",
          publisher: "Senado",
          level: "Nivel 1",
          why: "Proyecto que propone el 1 de diciembre de 2027. No está publicado como ley.",
          links: [
            {
              label: "Tramitación",
              href: "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07",
            },
          ],
        },
      ],
    },
    {
      title: "Documentación de las nubes",
      layout: "providers" as const,
      sources: [
        {
          title: "Sensitive Data Protection",
          publisher: "Google Cloud",
          level: "Nivel 2",
          provider: "GCP",
          why: "Descubrir y clasificar datos sensibles.",
          links: [{ href: "https://docs.cloud.google.com/sensitive-data-protection/docs/sensitive-data-protection-overview" }],
        },
        {
          title: "Amazon Macie",
          publisher: "AWS",
          level: "Nivel 2",
          provider: "AWS",
          why: "Inventario y hallazgos de datos sensibles en S3.",
          links: [{ href: "https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html" }],
        },
        {
          title: "Data Map",
          publisher: "Microsoft Learn",
          level: "Nivel 2",
          provider: "Azure",
          why: "Clasificación de activos en Microsoft Purview.",
          links: [{ href: "https://learn.microsoft.com/en-us/purview/data-map-classification" }],
        },
      ],
    },
  ],
};

export const stepsChain: PipelineChain = {
  chips: [],
  label: null,
  steps: [
    { name: [{ type: "text", value: "Requisito normativo" }], note: null },
    { name: [{ type: "text", value: "Riesgo identificado" }], note: null },
    { name: [{ type: "text", value: "Control técnico" }], note: null },
    { name: [{ type: "text", value: "Verificación" }], note: null },
    { name: [{ type: "text", value: "Evidencia" }], note: null },
  ],
};

export const stepDescriptions = [
  "Lo que la norma exige al responsable o al encargado.",
  "La falla técnica que impediría cumplirlo.",
  "La decisión de arquitectura que reduce ese riesgo.",
  "La prueba de que el control opera.",
  "El registro reciente que permite demostrarlo.",
];
