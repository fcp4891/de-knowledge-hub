// DE Knowledge Hub — configuración de capas y objetivos de aprendizaje.
// Copiar a frontend/lib/learning-paths.ts. Es configuración de UI: no toca el blueprint ni el contrato.
// Los slugs de dominio deben coincidir con /domains de la API (verificar y ajustar si difieren).

export type LayerKey = 'frontera' | 'flujo' | 'operacion' | 'transversal' | 'plataforma' | 'cimientos';

export interface Layer {
  key: LayerKey;
  name: string;
  caption: string;
  color: string;      // línea, borde y relleno de avance
  dark: string;       // fondo del número de paso (texto blanco, contraste AA)
  domains: string[];  // códigos de dominio en orden visual (izquierda → derecha)
}

// Orden visual de arriba hacia abajo (como un edificio: el techo arriba, los cimientos abajo).
export const LAYERS: Layer[] = [
  { key: 'frontera',    name: 'Frontera',       caption: 'Lo nuevo, sobre lo consolidado',  color: '#4E7D2B', dark: '#3A5F1F', domains: ['21', '22', '23'] },
  { key: 'flujo',       name: 'Flujo y diseño', caption: 'Cómo se mueven y arman los datos', color: '#2F5FB3', dark: '#22468A', domains: ['05', '14', '06', '07'] },
  { key: 'operacion',   name: 'Operación',      caption: 'Cómo se despliega y mantiene',     color: '#6B4FB3', dark: '#4B3590', domains: ['11', '12', '13'] },
  { key: 'transversal', name: 'Transversal',    caption: 'Cruza todas las capas',            color: '#B23A48', dark: '#8A2433', domains: ['15', '16', '17', '18', '19'] },
  { key: 'plataforma',  name: 'Plataforma',     caption: 'Dónde corre',                      color: '#B85A08', dark: '#8A4306', domains: ['08', '09', '10', '20'] },
  { key: 'cimientos',   name: 'Cimientos',      caption: 'Empieza aquí',                     color: '#0D7C74', dark: '#0A5E58', domains: ['01', '02', '03', '04'] },
];

// Nombre corto para mostrar en la estación del mapa (el nombre largo viene de la API).
export const SHORT_NAMES: Record<string, string> = {
  '01': 'Fundamentos', '02': 'SQL', '03': 'Python', '04': 'Modelado',
  '05': 'Pipelines', '06': 'Orquestación', '07': 'Arquitectura', '08': 'Google Cloud',
  '09': 'AWS', '10': 'Azure', '11': 'DevOps', '12': 'IaC', '13': 'Contenedores',
  '14': 'Streaming', '15': 'Calidad', '16': 'Observabilidad', '17': 'Gobierno',
  '18': 'Seguridad', '19': 'Compliance', '20': 'Open Data Stack', '21': 'IA para DE',
  '22': 'Modern DE', '23': 'Emergentes', '24': 'Ingeniería de privacidad',
};

export type Level = 'Inicial' | 'Intermedio' | 'Avanzado';
export type Weight = 'Esencial' | 'Complementario';

export interface GoalStep {
  domain: string;
  weight: Weight;
  /** Slug del tramo, cuando el paso recorre un subdominio y no el dominio entero. */
  stage?: string;
}

export interface Goal {
  key: string;
  label: string;
  description: string;
  level: Level;
  requires: string;       // texto mostrado en la tarjeta y en el itinerario
  steps: GoalStep[];      // orden = orden de estudio (respeta prerrequisitos)
}

// Ordenados de inicial a avanzado. El orden de los pasos sigue prerrequisitos reales:
// ningún paso depende de uno posterior.
export const GOALS: Goal[] = [
  {
    key: 'cero', label: 'Empiezo desde cero', description: 'La base que todo lo demás necesita',
    level: 'Inicial', requires: 'Sin requisitos.',
    steps: [
      { domain: '01', weight: 'Esencial' }, { domain: '02', weight: 'Esencial' },
      { domain: '03', weight: 'Esencial' }, { domain: '04', weight: 'Esencial' },
      { domain: '05', weight: 'Esencial' }, { domain: '06', weight: 'Complementario' },
    ],
  },
  {
    key: 'analitica', label: 'Del dato crudo al modelo', description: 'SQL, modelado dimensional y calidad',
    level: 'Intermedio', requires: 'Requiere: Fundamentos.',
    steps: [
      { domain: '02', weight: 'Esencial' }, { domain: '04', weight: 'Esencial' },
      { domain: '05', weight: 'Esencial' }, { domain: '15', weight: 'Esencial' },
      { domain: '06', weight: 'Complementario' }, { domain: '17', weight: 'Complementario' },
    ],
  },
  {
    key: 'tiemporeal', label: 'Datos en tiempo real', description: 'Eventos, streaming y monitoreo',
    level: 'Intermedio', requires: 'Requiere: Fundamentos y Python.',
    steps: [
      { domain: '05', weight: 'Esencial' }, { domain: '14', weight: 'Esencial' },
      { domain: '15', weight: 'Esencial' }, { domain: '16', weight: 'Esencial' },
      { domain: '06', weight: 'Complementario' },
    ],
  },
  {
    key: 'produccion', label: 'Llevar a producción', description: 'Despliegue, operación y seguridad',
    level: 'Intermedio', requires: 'Requiere: Pipelines y Orquestación.',
    steps: [
      { domain: '11', weight: 'Esencial' }, { domain: '12', weight: 'Esencial' },
      { domain: '13', weight: 'Complementario' }, { domain: '16', weight: 'Esencial' },
      { domain: '18', weight: 'Esencial' },
    ],
  },
  {
    key: 'confiables', label: 'Datos confiables y gobernados', description: 'Calidad, gobierno, seguridad y cumplimiento',
    level: 'Avanzado', requires: 'Requiere: Modelado y Pipelines.',
    steps: [
      { domain: '15', weight: 'Esencial' }, { domain: '17', weight: 'Esencial' },
      { domain: '18', weight: 'Esencial' }, { domain: '16', weight: 'Complementario' },
      { domain: '19', weight: 'Complementario' },
    ],
  },
  {
    key: 'modernizar', label: 'Modernizar una plataforma', description: 'Arquitectura, open source y tendencias',
    level: 'Avanzado', requires: 'Requiere: experiencia llevando datos a producción.',
    steps: [
      { domain: '07', weight: 'Esencial' }, { domain: '20', weight: 'Esencial' },
      { domain: '22', weight: 'Esencial' }, { domain: '17', weight: 'Complementario' },
      { domain: '21', weight: 'Complementario' },
    ],
  },
  {
    key: 'ley21719',
    label: 'Tratar datos personales bajo la Ley 21.719',
    description: 'Fundamentos, diseño, derechos, riesgo y evidencia',
    level: 'Avanzado',
    requires: 'Requiere: Modelado y Pipelines.',
    steps: [
      { domain: '24', weight: 'Esencial', stage: 'fundamentos' },
      { domain: '24', weight: 'Esencial', stage: 'diseno-protegido' },
      { domain: '24', weight: 'Esencial', stage: 'derechos-ciclo-vida' },
      { domain: '24', weight: 'Esencial', stage: 'riesgo-terceros-incidentes' },
      { domain: '24', weight: 'Esencial', stage: 'evidencia-automatizacion' },
    ],
  },
];

// Objetivos futuros: se muestran solo como texto "Próximamente".
export const UPCOMING_GOALS = [
  { label: 'Pipeline en GCP', reason: 'filtrará conceptos y componentes de Google Cloud' },
  { label: 'Entrevista para un rol', reason: 'alineará el contenido a la oferta que entregues' },
];

// Agrupación de las 22 secciones de la ficha en el índice lateral.
export const CARD_SECTION_GROUPS: { group: string; sections: number[] }[] = [
  { group: 'Entender', sections: [1, 2, 3, 4, 5, 6] },
  { group: 'Aplicar', sections: [7, 8, 9, 10] },
  { group: 'Multicloud', sections: [11, 12, 13] },
  { group: 'Profundizar', sections: [14, 15, 16, 17] },
  { group: 'Practicar', sections: [18, 19] },
  { group: 'Referencias', sections: [20, 21, 22] },
];
