export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full p-6">
        <h1 className="text-3xl font-bold mb-4">McMacroMaker</h1>
        <p className="mb-6">A Minecraft macro editor and runner. Sign in to continue.</p>
        <div>
          <a href="/dashboard" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Go to dashboard</a>
        </div>
      </div>
    </main>
  )
}
