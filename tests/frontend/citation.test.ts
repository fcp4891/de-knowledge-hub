import assert from "node:assert/strict";
import { test } from "node:test";

import { citationDetail, citationLinkText } from "../../frontend/lib/citation.ts";

const registry = { title: "BigQuery documentation", authority_level: 1 };

test("dos citas del mismo registro con page_title distinto se muestran con textos distintos", () => {
  const partitioned = {
    ...registry,
    url: "https://docs.cloud.google.com/bigquery/docs/partitioned-tables",
    page_title: "Introduction to partitioned tables",
  };
  const quotas = {
    ...registry,
    url: "https://docs.cloud.google.com/bigquery/quotas",
    page_title: "Quotas and limits",
  };
  assert.notEqual(citationLinkText(partitioned), citationLinkText(quotas));
  assert.equal(citationLinkText(partitioned), "Introduction to partitioned tables");
  assert.equal(citationLinkText(quotas), "Quotas and limits");
  assert.equal(citationDetail(partitioned), citationDetail(quotas));
  assert.equal(citationDetail(partitioned), "BigQuery documentation · Nivel 1");
});

test("una cita con page_title null muestra la ruta de la URL", () => {
  assert.equal(
    citationLinkText({
      url: "https://docs.cloud.google.com/bigquery/docs/partitioned-tables",
      page_title: null,
    }),
    "/bigquery/docs/partitioned-tables",
  );
});
