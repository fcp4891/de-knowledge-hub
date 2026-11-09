import { ArchitectureDot } from "@/components/markdown/InlineText";
import { stepNumber } from "@/lib/controlMatrix";

import "@/components/markdown/pipeline.css";
import "./ficha-blocks.css";

const HEADERS = ["Requisito", "Riesgo", "Control técnico", "Verificación", "Evidencia"];

const ROWS: {
  name: string;
  bases: string[];
  code?: string;
  risk: string;
  control: string;
  check: string;
  evidence: string;
}[] = [
  {
    name: "Finalidad",
    bases: ["Principio de finalidad · art. 3"],
    risk: "Datos usados para un fin no autorizado",
    control: "Autorización por finalidad y catálogo de actividades",
    check: "Test de que cada consumo declara una finalidad aprobada",
    evidence: "Catálogo versionado y accesos por finalidad",
  },
  {
    name: "Minimización",
    bases: ["Principio de proporcionalidad · art. 3"],
    code: "schema_minimization",
    risk: "Columnas no aprobadas llegan a capas analíticas",
    control: "Contrato de campos permitidos",
    check: "Test de esquema en CI",
    evidence: "Resultado del test y versión del contrato",
  },
  {
    name: "Retención",
    bases: ["Principio de proporcionalidad · art. 3"],
    code: "retention_check",
    risk: "Datos vencidos siguen guardados o vuelven con un replay",
    control: "Política por clase de dato y almacenamiento",
    check: "Control de vencidos tras la purga y en el replay",
    evidence: "Configuración, ejecución y excepciones",
  },
  {
    name: "Acceso restringido",
    bases: ["Medidas de seguridad · art. 14 quinquies"],
    code: "access_review",
    risk: "Usuarios inactivos o con privilegios de más",
    control: "IAM o RBAC, segregación de funciones",
    check: "Revisión periódica de permisos",
    evidence: "Inventario de permisos y revisión fechada",
  },
  {
    name: "Derechos del titular",
    bases: ["Derechos · art. 4"],
    code: "erasure_replay_check",
    risk: "No localizar todos los registros de un titular, o que lo suprimido reaparezca",
    control: "Localizador de registros y flujo autorizado",
    check: "Prueba de punta a punta: localizar, ejecutar y reprocesar",
    evidence: "ID interno de la solicitud, estados y resultado",
  },
  {
    name: "Vulneraciones",
    bases: ["Reporte de vulneraciones · art. 14 sexies"],
    risk: "No poder dimensionar el alcance a tiempo",
    control: "Logs, alertas y consulta de alcance por linaje",
    check: "Simulacro de consulta de alcance",
    evidence: "Línea de tiempo, sistemas afectados y acciones",
  },
  {
    name: "Transferencias",
    bases: ["Transferencia internacional · arts. 27 a 29", "Encargado · art. 15 bis"],
    risk: "Flujos a terceros o al extranjero sin control",
    control: "Inventario de destinos y controles del proveedor",
    check: "Conciliación de flujos contra el inventario",
    evidence: "Contrato, evaluación y trazabilidad",
  },
];

export function ControlMatrix() {
  return (
    <div className="markdown">
      <h3>
        <ArchitectureDot /> Matriz de control
      </h3>
      <p className="matrix-legend">
        <strong>art.</strong> fundamento legal del requisito · <strong>función</strong> control implementado en el código
        de la ficha
      </p>
      <div className="markdown-table-wrap markdown-table-steps">
        <table>
          <thead>
            <tr>
              {HEADERS.map((header, index) => (
                <th key={header}>
                  <span className="step-number">{stepNumber(index)}</span>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.name}>
                <td>
                  {row.name}
                  {row.bases.map((basis) => (
                    <span key={basis} className="matrix-meta">
                      {basis}
                    </span>
                  ))}
                  {row.code ? <code className="matrix-code">{row.code}</code> : null}
                </td>
                <td>{row.risk}</td>
                <td>{row.control}</td>
                <td>{row.check}</td>
                <td>{row.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>La evidencia no guarda nombres, RUT ni datos sensibles cuando basta una referencia interna protegida.</p>
    </div>
  );
}
