'use client'

const integrations = [
  { name: 'LangGraph', color: 'from-cyan-500 to-blue-600', letter: 'LG' },
  { name: 'LightGBM', color: 'from-green-500 to-emerald-600', letter: 'GB' },
  { name: 'NetworkX', color: 'from-indigo-500 to-purple-600', letter: 'NX' },
  { name: 'Ollama (On-Prem)', color: 'from-amber-500 to-orange-600', letter: 'OL' },
  { name: 'Claude 3.5 Sonnet', color: 'from-amber-600 to-rose-600', letter: 'CL' },
  { name: 'DeepSeek R1', color: 'from-cyan-400 to-indigo-600', letter: 'DS' },
  { name: 'Llama 3.1 70B', color: 'from-purple-500 to-pink-600', letter: 'LL' },
  { name: 'pgvector RAG', color: 'from-blue-500 to-cyan-500', letter: 'PG' },
  { name: 'Model Context Protocol (MCP)', color: 'from-teal-400 to-emerald-500', letter: 'MCP' },
  { name: 'bKash MFS Rails', color: 'from-rose-500 to-pink-600', letter: 'bK' },
  { name: 'Nagad MFS Rails', color: 'from-orange-500 to-amber-600', letter: 'NG' },
  { name: 'Open Banking ISO 20022', color: 'from-blue-600 to-indigo-700', letter: 'ISO' },
]

const doubled = [...integrations, ...integrations]

export default function IntegrationsReel() {
  return (
    <div className="relative overflow-hidden py-4">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950 to-transparent" />

      <div className="flex animate-marquee gap-3 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 backdrop-blur-sm"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white ${item.color}`}
            >
              {item.letter}
            </div>
            <span className="text-xs font-semibold text-slate-200">{item.name}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
