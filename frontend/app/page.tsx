"use client"
import { useState } from "react"

export default function Home() {
  const [repo, setRepo] = useState("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const analyze = async () => {
    if (!repo) {
      setError("Please enter a GitHub repository URL")
      return
    }

    setLoading(true)
    setError("")
    setData(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repo_url: repo })
        }
      )

      const json = await res.json()
      console.log("API RESPONSE:", json)

      setData(json)

    } catch (e) {
      setError("Backend not reachable. Make sure FastAPI is running.")
    }

    setLoading(false)
  }

  const result = data

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">

      <div className="relative z-10 flex justify-center items-center min-h-screen p-6">
        <div className="w-full max-w-3xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Mini You
            </h1>
            <p className="text-gray-400 mt-3">
              Your AI twin for understanding any codebase
            </p>
          </div>

          {/* Input */}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4"
              placeholder="Paste GitHub repository URL"
              value={repo}
              onChange={e => setRepo(e.target.value)}
            />

            <button
              onClick={analyze}
              disabled={loading}
              className="bg-white text-black font-semibold px-8 py-4 rounded-xl hover:bg-gray-200 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-10 text-gray-500 animate-pulse">
              🔍 Analyzing repository...
            </div>
          )}

          {/* RESULTS */}
          {result && (
            <div className="mt-12 space-y-8">

              {/* TECH STACK */}
              <Card title="Tech Stack" icon="🛠️">
                {result.tech_stack?.length > 0 ? (
                  result.tech_stack.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="inline-block mr-2 mb-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                    >
                      {t}
                    </span>
                  ))
                ) : "No data"}
              </Card>

              {/* KEY FILES */}
              <Card title="Key Files" icon="📁">
                <ul className="space-y-3 text-sm text-gray-300">
                  {result.key_files?.map((f: string, i: number) => {
                    const clean = f.replace("â", "–")
                    const parts = clean.split("–")

                    return (
                      <li key={i} className="leading-relaxed">
                        <span className="font-medium text-white">
                          {i + 1}. {parts[0]}
                        </span>

                        {parts[1] && (
                          <div className="text-gray-400 ml-4">
                            {parts[1]}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </Card>

              {/* DESCRIPTION */}
              <Card title="Project Overview" icon="📝">
                {result.description || "No data"}
              </Card>

              {/* SUGGESTIONS */}
              <Card title="AI Suggestions" icon="✨">
                {result.suggestions?.length > 0 ? (
                  result.suggestions.map((s: string, i: number) => (
                    <div key={i}>→ {s}</div>
                  ))
                ) : "No data"}
              </Card>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
  icon
}: {
  title: string
  children: React.ReactNode
  icon: string
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <h3 className="text-xs uppercase tracking-widest text-gray-500">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}
