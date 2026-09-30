import Link from "next/link";

import { CloudTabs } from "@/components/card/CloudTabs";
import type { CapabilityCell } from "@/lib/api/types";
import { VERIFICATION_LABEL } from "@/lib/labels";

const CLOUD_ORDER = ["gcp", "aws", "azure"];
const CLOUD_TITLE: Record<string, string> = {
  gcp: "GCP",
  aws: "AWS",
  azure: "Azure",
};

export function CapabilityList({ capabilities }: { capabilities: CapabilityCell[] }) {
  if (capabilities.length === 0) {
    return <p className="muted">Esta tecnología todavía no tiene comparación en la matriz.</p>;
  }

  return (
    <div className="sections">
      {capabilities.map((capability) => {
        const clouds = Object.keys(capability.equivalents).sort((left, right) => {
          const leftIndex = CLOUD_ORDER.indexOf(left);
          const rightIndex = CLOUD_ORDER.indexOf(right);
          return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
        });

        return (
          <article key={capability.capability} className="panel">
            <h2>{capability.title}</h2>
            <p className="meta">
              <span
                className={
                  capability.verification_status === "review_required" ||
                  capability.verification_status === "potentially_outdated"
                    ? "badge badge-alert"
                    : undefined
                }
              >
                {VERIFICATION_LABEL[capability.verification_status]}
              </span>
            </p>
            <h3>Diferencias</h3>
            <p>{capability.differences}</p>
            <h3>No es equivalente cuando</h3>
            <p>{capability.not_equivalent_when}</p>
            <CloudTabs
              tabs={clouds.map((cloud) => {
                const equivalent = capability.equivalents[cloud];
                return {
                  id: cloud,
                  title: CLOUD_TITLE[cloud] ?? cloud,
                  content: equivalent ? (
                    <div>
                      <ul>
                        {equivalent.services.map((service) => (
                          <li key={service}>
                            <Link href={`/technologies/${service}`}>{service}</Link>
                          </li>
                        ))}
                      </ul>
                      <p>{equivalent.differences}</p>
                      <p>
                        <strong>No es equivalente cuando.</strong> {equivalent.not_equivalent_when}
                      </p>
                    </div>
                  ) : null,
                };
              })}
            />
          </article>
        );
      })}
    </div>
  );
}
