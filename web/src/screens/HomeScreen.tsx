import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FEATURES } from '../features'

export default function HomeScreen() {
  return (
    <div className="mx-auto max-w-xl space-y-3 p-4 pb-10">
      <p className="text-center text-sm text-base-content/60">AI-powered photo editing for product listings</p>
      {FEATURES.map((f) => (
        <Link
          key={f.path}
          to={`/${f.path}`}
          className="card card-side items-center gap-3 border-l-4 bg-base-100 p-3 shadow-sm transition active:scale-[0.99]"
          style={{ borderLeftColor: f.color }}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-field" style={{ backgroundColor: `${f.color}18`, color: f.color }}>
            <f.icon className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">{f.label}</span>
            <span className="block text-sm text-base-content/60">{f.desc}</span>
          </span>
          <ChevronRight className="size-5 text-base-content/30" />
        </Link>
      ))}
    </div>
  )
}
