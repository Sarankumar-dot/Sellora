function PlaceholderPage({ title, description }) {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Sellora foundation</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
    </section>
  )
}

export default PlaceholderPage
