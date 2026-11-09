import "./ficha-blocks.css";

const RULES: { rule: string; fn: string; requirement: string }[] = [
  { rule: "Todo consumo declara una finalidad aprobada en el catálogo", fn: "purpose_check", requirement: "Finalidad" },
  { rule: "Solo columnas aprobadas", fn: "schema_minimization", requirement: "Minimización" },
  { rule: "Sin datos vencidos, tampoco tras un replay", fn: "retention_check", requirement: "Retención" },
  { rule: "Ningún usuario inactivo con acceso", fn: "access_review", requirement: "Acceso restringido" },
  { rule: "Lo suprimido no reaparece al reprocesar", fn: "erasure_replay_check", requirement: "Derechos del titular" },
];

const SCENARIOS: { name: string; text: string; exitCode: 0 | 1 }[] = [
  { name: "con-brechas", text: "una brecha por regla: las cinco fallan", exitCode: 1 },
  { name: "corregido", text: "las cinco reglas pasan", exitCode: 0 },
  { name: "sin-revision", text: "falta la fecha de la última revisión de accesos: queda en UNKNOWN, que no cuenta como aprobado", exitCode: 1 },
  { name: "evidencia-alterada", text: "la evidencia de retención se edita después de guardada y su huella ya no coincide", exitCode: 1 },
  { name: "control-faltante", text: "no llega el resultado de minimización", exitCode: 1 },
  { name: "evidencia-vencida", text: "la evidencia de accesos tiene 31 días, más que los 30 de la política de ejemplo", exitCode: 1 },
];

export function CodeGuide() {
  return (
    <section className="ficha-block code-guide" aria-label="Qué hace el ejemplo">
      <h3>Qué hace</h3>
      <p className="code-guide-lead">
        Revisa automáticamente cinco reglas de privacidad sobre datos ficticios y valida que su evidencia sea completa, reciente e íntegra. Si algo falla, la CI rechaza el cambio (salida 1); si todo pasa, lo aprueba (salida 0).
      </p>

      <table>
        <thead>
          <tr>
            <th>Regla</th>
            <th>Función</th>
            <th>Requisito de la matriz</th>
          </tr>
        </thead>
        <tbody>
          {RULES.map((row) => (
            <tr key={row.fn}>
              <td>{row.rule}</td>
              <td>
                <code>{row.fn}</code>
              </td>
              <td>{row.requirement}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Qué no cubre</h3>
      <p>Cubre 5 de los 7 requisitos de la matriz. Los otros dos no se resuelven con una regla que pase o falle en cada cambio:</p>
      <ul>
        <li>
          <strong>Vulneraciones:</strong> es un proceso de respuesta a incidentes: detectar, dimensionar el alcance y reportar a la Agencia (art. 14 sexies). Se prueba con simulacros.
        </li>
        <li>
          <strong>Transferencias:</strong> dependen de contratos con encargados y de evaluar cada destino (art. 15 bis; arts. 27 a 29). Un script puede conciliar flujos contra un inventario, pero no juzgar si un contrato o un país dan garantías suficientes.
        </li>
      </ul>

      <h3>Escenarios</h3>
      <table className="code-guide-scenarios">
        <tbody>
          {SCENARIOS.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>{row.text}</td>
              <td>
                <span className={row.exitCode === 0 ? "code-guide-exit is-ok" : "code-guide-exit is-bad"}>{row.exitCode}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Qué simplifica</h3>
      <ul>
        <li>
          <strong>Finalidad:</strong> comprueba que el consumo declare una finalidad aprobada, no que el uso real sea compatible con ella; eso requiere revisión humana.
        </li>
        <li>
          <strong>Supresión:</strong> solo revisa la reconstrucción desde la fuente; en producción también debe alcanzar respaldos, CDC y derivados.
        </li>
        <li>
          <strong>Minimización:</strong> usa una sola lista de columnas aprobadas; en producción la lista es por finalidad y por capa.
        </li>
        <li>
          <strong>Evidencia:</strong> la huella se calcula en la misma ejecución; en producción se compara con la evidencia guardada en un almacenamiento inmutable.
        </li>
      </ul>

      <p className="code-guide-limit">
        <strong>Límite:</strong> es un ejemplo didáctico. Un resultado aprobado demuestra que los controles funcionaron, no que el tratamiento sea lícito.
      </p>
    </section>
  );
}
