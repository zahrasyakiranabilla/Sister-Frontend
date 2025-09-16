"use client"

import type React from "react"

import { createLazyFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import {
  getStatusAssignmentsOptions,
  getStatusAssignmentsQueryKey,
  postSubmissionMutation,
} from "../../client/@tanstack/react-query.gen"

export const Route = createLazyFileRoute("/dashboard/tugas")({
  component: TugasPage,
})

interface Assignment {
  id: string
  title: string
  course: string
  deadline: string
  description: string
  status: "pending" | "submitted" | "late"
  submittedAt?: string
}

function TugasPage() {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const authToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3NTgwNDAyMzYsImV4cCI6MTc1ODA0MTEzNn0.j0g9gl77Na5cOE8zw_PjIrRiEL_aig8clPKdagDtgc0"

  const queryClient = useQueryClient()
  const options = getStatusAssignmentsOptions({
    headers: { Authorization: `Bearer ${authToken}` },
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: getStatusAssignmentsQueryKey(),
    queryFn: ({ signal }) =>
      options.queryFn?.({
        queryKey: getStatusAssignmentsQueryKey(),
        signal,
        client: queryClient,
        meta: undefined,
      }) ?? Promise.reject("queryFn tidak tersedia"),
  })

  const getField = (obj: any, keys: string[]) => {
    if (!obj) return undefined
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null) return obj[k]
    }
    return undefined
  }

  const toDateOrUndefined = (val: any): Date | undefined => {
    if (val === undefined || val === null || val === "") return undefined
    const d = typeof val === "number" ? new Date(val) : new Date(String(val))
    return isNaN(d.getTime()) ? undefined : d
  }

  const rawAssignments: any[] =
    (data?.data as any)?.assignments ?? (data?.data as any) ?? (Array.isArray(data) ? data : [])

  const assignments: Assignment[] = rawAssignments.map((a, idx) => {
    const id = String(getField(a, ["id", "_id", "slug", "uuid", "assignmentId"]) ?? idx)
    const title = getField(a, ["nama", "name", "title"]) ?? "Tanpa Judul"
    const deadlineRaw = getField(a, [
      "deadline",
      "dueDate",
      "due_date",
      "dueAt",
      "due",
      "deadlineAt",
      "due_at",
    ])
    const deadlineDate = toDateOrUndefined(deadlineRaw)
    const deadline = deadlineDate ? deadlineDate.toISOString() : new Date().toISOString()
    const description =
      getField(a, [
        "description",
        "desc",
        "keterangan",
        "deskripsi",
        "detail",
        "details",
        "body",
      ]) ?? "-"
    const submittedAtRaw = getField(a, ["submittedAt", "submitted_at", "turnedInAt"])
    const submittedAtDate = toDateOrUndefined(submittedAtRaw)
    const submittedAt = submittedAtDate ? submittedAtDate.toISOString() : undefined

    let apiStatus = getField(a, ["status", "assignmentStatus", "state"]) as string | undefined
    if (apiStatus && typeof apiStatus === "string") {
      apiStatus = apiStatus.trim().toLowerCase()
    }

    const allowedStatuses = new Set(["pending", "submitted", "late"])
    let status: Assignment["status"] = "pending"
    if (apiStatus && allowedStatuses.has(apiStatus)) {
      status = apiStatus as Assignment["status"]
    } else {
      if (submittedAt) {
        status = "submitted"
      } else if (deadlineDate && deadlineDate.getTime() < Date.now()) {
        status = "late"
      }
    }

    const course = getField(a, ["course", "courseName", "mataKuliah", "kelas", "subject"]) ?? "-"

    return { id, title, course, deadline, description, status, submittedAt }
  })
  // No local persistence: rely on backend as source-of-truth. Keep a
  // small placeholder state only for shape compatibility if needed.
  // no local persistence; backend-driven

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const submissionMutation = useMutation({
    ...postSubmissionMutation(),
    onSuccess: async (res, variables: any) => {
      console.log("Upload successful:", res)

      setSelectedAssignment((prev) =>
        prev ? { ...prev, status: "submitted", submittedAt: new Date().toISOString() } : prev
      )
      const submittedId = variables?.body?.tugasId ?? selectedAssignment?.id
      const submittedIdStr = submittedId != null ? String(submittedId) : undefined

      const now = new Date().toISOString()

      queryClient.setQueryData(getStatusAssignmentsQueryKey(), (old: any) => {
        if (!old) return old

        const updater = (arr: any[]) =>
          arr.map((asg: any) =>
            String(asg.id) === String(submittedIdStr)
              ? { ...asg, status: "submitted", submittedAt: now }
              : asg
          )

        if (Array.isArray(old)) {
          return updater(old)
        }

        if (old.data && Array.isArray(old.data.assignments)) {
          return {
            ...old,
            data: {
              ...old.data,
              assignments: updater(old.data.assignments),
            },
          }
        }

        return old
      })

      // invalidate and attempt to confirm server-side state by polling a
      // few times. We do not persist locally; server is authoritative.
      await queryClient.invalidateQueries({ queryKey: getStatusAssignmentsQueryKey() })

      const attempts = 3
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

      const checkServerHas = () => {
        const val = queryClient.getQueryData(getStatusAssignmentsQueryKey()) as any
        if (!val) return false
        if (Array.isArray(val)) {
          return val.some((asg: any) => String(asg.id) === String(submittedIdStr) && String(asg.status).toLowerCase() === "submitted")
        }
        if (val.data && Array.isArray(val.data.assignments)) {
          return val.data.assignments.some((asg: any) => String(asg.id) === String(submittedIdStr) && String(asg.status).toLowerCase() === "submitted")
        }
        if (val.data && Array.isArray(val.data)) {
          return val.data.some((asg: any) => String(asg.id) === String(submittedIdStr) && String(asg.status).toLowerCase() === "submitted")
        }
        return false
      }

      let serverHasSubmitted = checkServerHas()
      for (let i = 0; i < attempts && !serverHasSubmitted; i++) {
        await delay(500 * (i + 1))
        await queryClient.invalidateQueries({ queryKey: getStatusAssignmentsQueryKey() })
        serverHasSubmitted = checkServerHas()
      }

      alert("Tugas berhasil dikumpulkan!")
      setFile(null)
      setIsSubmitting(false)
    },
    onError: (err) => {
      console.error("Upload failed:", err)
      setIsSubmitting(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return
    // rely on server to enforce duplicate submissions; optimistic UI prevents immediate re-submit
    const selectedFile = fileInputRef.current?.files?.[0] ?? file
    if (!selectedFile) return

    const tugasIdNum = Number(selectedAssignment.id)
    setIsSubmitting(true)
    submissionMutation.mutate({
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        file: selectedFile,
        tugasId: isNaN(tugasIdNum) ? 0 : tugasIdNum,
      },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-primary-pink bg-primary-pink/10"
      case "submitted":
        return "text-accent-green bg-accent-green/10"
      case "late":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Belum Dikumpulkan"
      case "submitted":
        return "Sudah Dikumpulkan"
      case "late":
        return "Terlambat"
      default:
        return "Unknown"
    }
  }

  if (isLoading) {
    return <div className="text-gray-600">Memuat daftar tugas...</div>
  }
  if (isError) {
    return <div className="text-red-600">Gagal memuat daftar tugas: {String(error)}</div>
  }

  return (
    <div className="space-y-6 bg-white font-poppins">
      <h1 className="text-3xl font-bold">Pengumpulan Tugas</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Daftar Tugas</h2>
          {assignments.map((assignment) => {
            const isThisSelected = selectedAssignment?.id === assignment.id
            const statusToShow = isThisSelected ? selectedAssignment!.status : assignment.status
            const submittedAtToShow = isThisSelected ? selectedAssignment!.submittedAt : assignment.submittedAt

            return (
              <div key={assignment.id} className="mb-4">
                {/* card wrapper to add vertical spacing */}
                <div
                  className={`bg-white rounded-xl border-2 p-6 cursor-pointer ${
                    isThisSelected
                      ? "border-primary-pink shadow-lg"
                      : "border-gray-200 hover:border-secondary-pink shadow-sm"
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    statusToShow
                  )}`}
                >
                  {getStatusText(statusToShow)}
                </span>

              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Deadline: {new Date(assignment.deadline).toLocaleDateString("id-ID")}</span>
                {submittedAtToShow && (
                  <span className="text-[#A7D477] font-medium">
                    Dikumpulkan: {new Date(submittedAtToShow).toLocaleDateString("id-ID")}
                  </span>
                )}
              </div>
                </div>
              </div>
            )
          })}
        </div>
        <div>
              {selectedAssignment ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold mb-4">Detail Tugas</h3>
                <p>Judul: {selectedAssignment.title}</p>
                <p>Deskripsi: {selectedAssignment.description}</p>
                <p>
                  Deadline:{" "}
                  {new Date(selectedAssignment.deadline).toLocaleDateString("id-ID")}
                </p>
              </div>

              {/* Submission Form */}
                  {selectedAssignment.status === "pending" && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Kumpulkan Tugas</h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Upload File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-pink transition-colors">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.zip,.rar"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                          <svg
                            className="w-8 h-8 text-gray-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-poppins">{file ? file.name : "Klik untuk upload file"}</span>
                          <span className="text-xs text-gray-400 mt-1 font-poppins font-light">PDF, DOC, DOCX, ZIP, RAR (Max 10MB)</span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!file || isSubmitting || selectedAssignment.status !== "pending"}
                      className="w-full bg-primary-pink text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-pink disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-poppins"
                    >
                      {isSubmitting ? "Mengunggah..." : "Kumpulkan Tugas"}
                    </button>
                  </form>
                </div>
              )}

              {selectedAssignment.status === "submitted" && (
                <div className="bg-[#A7D477]/10 rounded-xl border p-6">
                  <h4 className="font-semibold text-[#A7D477]">Tugas Sudah Dikumpulkan</h4>
                  <p>
                    Dikumpulkan pada{" "}
                    {new Date(selectedAssignment.submittedAt!).toLocaleDateString("id-ID")}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">Pilih Tugas</h3>
              <p>Pilih tugas dari daftar di sebelah kiri</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

