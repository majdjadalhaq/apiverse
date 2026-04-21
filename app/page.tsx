export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">apiverse</p>
        <h1 className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-5xl font-bold leading-tight text-transparent">
          Coming together.
        </h1>
        <p className="max-w-md text-sm text-neutral-400">
          Browse public APIs. See them live. Save what you like. More soon.
        </p>
      </div>
    </main>
  )
}
