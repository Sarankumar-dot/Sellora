import { Link } from 'react-router-dom'
import PlaceholderPage from '@/components/ui/PlaceholderPage.jsx'
import { ROUTES } from '@/constants/routes.js'

function NotFoundPage() {
  return <div className="space-y-4"><PlaceholderPage title="Page not found" description="The route you requested does not exist." /><Link className="text-sm font-medium text-slate-700 underline" to={ROUTES.home}>Return home</Link></div>
}

export default NotFoundPage
