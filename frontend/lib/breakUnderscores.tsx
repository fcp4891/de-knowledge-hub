import { Fragment, type ReactNode } from "react";

/** Identificador con oportunidades de corte tras cada guion bajo (<wbr>): se parte ahí, no en cualquier letra. */
export function breakAtUnderscores(text: string): ReactNode {
  const parts = text.split("_");
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? (
        <>
          _<wbr />
        </>
      ) : null}
    </Fragment>
  ));
}
