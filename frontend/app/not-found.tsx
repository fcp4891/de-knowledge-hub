import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <h1>No existe</h1>
      <p className="lead">Esa página no está en el sitio.</p>
      <p>
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
