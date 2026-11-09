import "@/components/markdown/pipeline.css";

import "./ficha-blocks.css";

type Cell = { name: string; text: string; warn?: string };

type Row = {
  need: string;
  meta: string;
  gcp: Cell;
  aws: Cell;
  azure: Cell;
};

const ROWS: Row[] = [
  {
    need: "Descubrir y clasificar",
    meta: "Cómo funciona · ¿Qué datos trato?",
    gcp: {
      name: "Sensitive Data Protection",
      text: "Perfila BigQuery, Cloud SQL y Cloud Storage; también desidentifica.",
    },
    aws: {
      name: "Amazon Macie",
      text: "Datos sensibles en buckets de S3; no cubre otros almacenes.",
    },
    azure: {
      name: "Purview Data Map",
      text: "Clasificaciones de sistema y propias al escanear.",
    },
  },
  {
    need: "Restringir acceso a filas y columnas",
    meta: "Matriz · Acceso restringido",
    gcp: {
      name: "BigQuery",
      text: "Seguridad por columna (policy tags) y políticas de acceso por fila.",
    },
    aws: {
      name: "Lake Formation",
      text: "Permisos finos por tabla, columna y fila.",
    },
    azure: {
      name: "Unity Catalog",
      text: "En Azure Databricks: privilegios, filtros de fila y máscaras de columna.",
    },
  },
  {
    need: "Auditar accesos a datos",
    meta: "Matriz · Vulneraciones y evidencia",
    gcp: {
      name: "Cloud Audit Logs",
      text: "Data Access audit logs, configurables por servicio.",
      warn: "Desactivados por defecto, salvo BigQuery",
    },
    aws: {
      name: "CloudTrail · data events",
      text: "Registra lecturas y escrituras sobre los datos.",
      warn: "No se registran por defecto",
    },
    azure: {
      name: "Registros de diagnóstico de Azure Databricks",
      text: "Entrega de registros de auditoría a Azure Monitor o almacenamiento.",
      warn: "Hay que configurar su entrega",
    },
  },
];

function Service({ cell }: { cell: Cell }) {
  return (
    <td>
      <strong>{cell.name}</strong>
      {cell.text}
      {cell.warn ? <span className="cloud-compare-warn">{cell.warn}</span> : null}
    </td>
  );
}

export function CloudCompare() {
  return (
    <div className="markdown cloud-compare">
      <p>Servicios nativos que apoyan tres controles de la ficha. No son equivalencias exactas.</p>
      <p className="cloud-compare-note">
        <strong>Por defecto.</strong> En las tres nubes, la auditoría de acceso a datos no queda activa sola: hay que
        configurarla. Sin ella no hay evidencia de quién accedió.
      </p>
      <div className="markdown-table-wrap markdown-table-steps">
        <table>
          <thead>
            <tr>
              <th>Necesidad</th>
              <th>GCP</th>
              <th>AWS</th>
              <th>Azure</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.need}>
                <td>
                  {row.need}
                  <span className="cloud-compare-meta">{row.meta}</span>
                </td>
                <Service cell={row.gcp} />
                <Service cell={row.aws} />
                <Service cell={row.azure} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Ningún servicio certifica cumplimiento por sí solo: cada uno se evalúa por alcance, configuración y evidencia
        disponible.
      </p>
    </div>
  );
}
