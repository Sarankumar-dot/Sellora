import AnimatedCard from '@/animations/AnimatedCard.jsx'

function Card({ children, className = '' }) {
  return <AnimatedCard className={`rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.3)] ${className}`}>{children}</AnimatedCard>
}

export default Card
