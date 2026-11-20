import type { Metadata } from 'next'
import { Calendar, User, ArrowRight, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — NexusGuard',
  description:
    'Insights on AI agent observability, LLM engineering, and production AI systems from the NexusGuard team.',
  openGraph: {
    title: 'Blog — NexusGuard',
    description: 'Insights on AI agent observability, LLM engineering, and production AI systems.',
    images: [{ url: '/og-image.png' }],
  },
}

const posts = [
  {
    slug: 'why-your-ai-agent-needs-a-circuit-breaker',
    title: 'Why Every Production AI Agent Needs a Circuit Breaker',
    excerpt:
      'Runaway agents can rack up thousands of dollars in LLM costs within minutes. Learn how circuit breakers — borrowed from distributed systems — save teams from catastrophic failures.',
    author: 'Maya Patel',
    date: 'Nov 18, 2026',
    readTime: '8 min read',
    tags: ['Reliability', 'Cost Control'],
    color: 'from-red-500 to-orange-500',
    letter: 'CB',
  },
  {
    slug: 'opentelemetry-for-llm-applications',
    title: 'OpenTelemetry for LLM Applications: A Practical Guide',
    excerpt:
      "OTel wasn't designed for LLMs, but with the right conventions it's the best observability substrate for multi-agent systems. Here's how we made it work at scale.",
    author: 'James Liu',
    date: 'Nov 12, 2026',
    readTime: '12 min read',
    tags: ['OpenTelemetry', 'Engineering'],
    color: 'from-blue-500 to-cyan-500',
    letter: 'OT',
  },
  {
    slug: 'prompt-versioning-at-scale',
    title: 'Prompt Versioning at Scale: Lessons from 50M Daily Events',
    excerpt:
      "Treating prompts like code — with version history, diffs, and regression tests — transformed how our customers ship. Here's the system we built.",
    author: 'Leila Ahmadi',
    date: 'Nov 5, 2026',
    readTime: '10 min read',
    tags: ['Prompt Engineering', 'Best Practices'],
    color: 'from-violet-500 to-purple-600',
    letter: 'PV',
  },
  {
    slug: 'multi-agent-distributed-tracing',
    title: 'Distributed Tracing Across Multi-Agent Systems',
    excerpt:
      'When one agent spawns three sub-agents across two frameworks, traditional tracing breaks. We built a trace correlation model that works across any agent topology.',
    author: 'Marco Santos',
    date: 'Oct 28, 2026',
    readTime: '14 min read',
    tags: ['Tracing', 'Architecture'],
    color: 'from-green-500 to-teal-500',
    letter: 'DT',
  },
  {
    slug: 'ai-agent-eval-methodology',
    title: 'Beyond Accuracy: A Holistic Eval Methodology for AI Agents',
    excerpt:
      'Token accuracy is the wrong metric for agents. We share the rubric we use — covering faithfulness, groundedness, tool-use correctness, and cost-efficiency.',
    author: 'Priya Nair',
    date: 'Oct 20, 2026',
    readTime: '9 min read',
    tags: ['Evals', 'LLM Quality'],
    color: 'from-pink-500 to-rose-500',
    letter: 'EV',
  },
  {
    slug: 'enterprise-llm-governance',
    title: 'Enterprise LLM Governance: RBAC, Audit Logs & Approval Workflows',
    excerpt:
      "The enterprise AI platform team's checklist for shipping agents in regulated industries — HIPAA, SOC2, and GDPR compliance without killing developer velocity.",
    author: 'Sarah Chen',
    date: 'Oct 14, 2026',
    readTime: '11 min read',
    tags: ['Governance', 'Enterprise'],
    color: 'from-amber-500 to-yellow-500',
    letter: 'GV',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14">
          <h1 className="mb-4 text-5xl font-black text-white">
            The AgentOps{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            Engineering insights on AI agent observability, reliability, and production ML.
          </p>
        </div>

        {/* Featured post */}
        <div className="mb-10">
          <a
            href={`/blog/${posts[0].slug}`}
            className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/8"
          >
            <div className={`h-3 w-full bg-gradient-to-r ${posts[0].color}`} />
            <div className="p-8 md:p-10">
              <div className="mb-3 flex flex-wrap gap-2">
                {posts[0].tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-500/15 px-3 py-0.5 text-xs font-medium text-indigo-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors md:text-3xl">
                {posts[0].title}
              </h2>
              <p className="mb-6 text-slate-400">{posts[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {posts[0].author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {posts[0].date}
                  </span>
                  <span>{posts[0].readTime}</span>
                </div>
                <span className="flex items-center gap-1 text-sm text-indigo-400 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Post grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(1).map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/8"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${post.color}`} />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-slate-400"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mb-2 font-semibold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
