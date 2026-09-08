export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Customer Notes</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Customer notes workspace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The application is ready for customer and note management features.
        </p>
      </section>
    </main>
  );
}
