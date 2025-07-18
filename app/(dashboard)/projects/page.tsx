import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Projects</h1>
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to SandPix!</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Your projects will appear here once you create them.
          </p>
          <Button variant="gradient" size="lg">
            Create New Project
          </Button>
        </div>
      </div>
    </div>
  )
}