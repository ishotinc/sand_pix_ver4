export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Project {params.id}</h1>
          <p className="text-gray-600">
            This is where the AI-generated landing page will be displayed and edited.
          </p>
          <p className="text-gray-600 mt-4">
            (Phase 4 will implement the AI generation functionality)
          </p>
        </div>
      </div>
    </div>
  )
}