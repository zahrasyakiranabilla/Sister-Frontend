import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getStatusAssignmentsOptions, getStatusAssignmentsQueryKey } from "@/client/@tanstack/react-query.gen"

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
})

function Dashboard() {
  const token = process.env.NODE_ENV === 'production' ? '' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3NTgwMzg2OTgsImV4cCI6MTc1ODAzOTU5OH0.bpDaIGBDHnTJc1aNql1NTvPQjnlYjJwRzDR1iMuy3Fk'

  const queryClient = useQueryClient()
  const options = getStatusAssignmentsOptions({ headers: { Authorization: token } })

  const { data } = useQuery({
    queryKey: getStatusAssignmentsQueryKey(),
    queryFn: ({ signal }) =>
      options.queryFn?.({ queryKey: getStatusAssignmentsQueryKey(), signal, client: queryClient, meta: undefined }) ?? Promise.reject('queryFn tidak tersedia'),
  })

  const raw: any[] = (data?.data as any) ?? []

  type Assignment = {
    id?: number | string
    nama?: string
    deskripsi?: string
    deadline?: string
    status?: string
    updatedAt?: string
  }

  const assignments: Assignment[] = raw.map((a) => ({
    id: a.id ?? a._id ?? a.assignmentId,
    nama: a.nama ?? a.title ?? a.name,
    deskripsi: a.deskripsi ?? a.description,
    deadline: a.deadline ?? a.dueDate,
    status: a.status ?? undefined,
    updatedAt: a.updatedAt ?? a.updated_at ?? a.updated ?? a.submittedAt ?? a.deadline,
  }))

  const aktivitasTerbaru = assignments
    .slice()
    .sort((a, b) => {
      const at = a.updatedAt ? Date.parse(a.updatedAt) : 0
      const bt = b.updatedAt ? Date.parse(b.updatedAt) : 0
      return bt - at
    })
    .slice(0, 5)

  const totalTugas = assignments.length
  const tugasSelesai = assignments.filter((t) => t.status === 'submitted').length

  return (
    <div className="space-y-8 bg-white font-poppins">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 shadow-lg">
        <h2 className="text-3xl font-bold mb-2 font-poppins text-gray-900">Selamat Datang di SISTER</h2>
        <p className="text-lg font-poppins font-light text-gray-800">Sistem Informasi Akademik untuk Mahasiswa</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">Tugas Aktif</p>
            <p className="text-3xl font-bold text-primary-pink font-poppins">{totalTugas}</p>
            </div>
            <div className="w-12 h-12 bg-primary-pink/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">Tugas Selesai</p>
              <p className="text-3xl font-bold text-accent-green font-poppins">{tugasSelesai}</p>
            </div>
            <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          {aktivitasTerbaru.length > 0 ? (
            aktivitasTerbaru.map((tugas) => (
              <div key={String(tugas.id)} className="flex items-center space-x-4 p-4 rounded-lg hover:shadow-sm transition-colors bg-white">
                <div className={`w-2 h-2 rounded-full ${tugas.status === 'submitted' ? 'bg-accent-green' : 'bg-primary-pink'}`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 font-poppins">{tugas.nama}</p>
                  <p className="text-sm text-gray-600 font-poppins font-light">
                    {tugas.status === 'submitted' ? 'Dikumpulkan baru-baru ini' : `Deadline: ${tugas.deadline ? new Date(tugas.deadline).toLocaleDateString() : '-'}`}
                  </p>
                </div>
                <span className={`text-sm font-medium ${tugas.status === 'submitted' ? 'text-accent-green' : 'text-primary-pink'} font-poppins`}>
                  {tugas.status === 'submitted' ? 'Selesai' : 'Pending'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Belum ada aktivitas terbaru</p>
          )}
        </div>
      </div>
    </div>
  )
}
