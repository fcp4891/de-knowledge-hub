export function MockMiss({ slug }: { slug?: string }) {
  return (
    <p className="mock-miss" role="status">
      {slug ? <span className="slug">{slug}. </span> : null}
      Sin datos en modo mock.
    </p>
  );
}
