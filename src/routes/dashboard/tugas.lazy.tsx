"use client"

import type React from "react"

import { createLazyFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getStatusAssignmentsOptions,
  getStatusAssignmentsQueryKey,
  postSubmissionMutation,
} from "../../client/@tanstack/react-query.gen"
import { useMutation } from "@tanstack/react-query"

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
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())
  const [comment, setComment] = useState("")

  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJtYWhhc2lzd2EiLCJpYXQiOjE3NTc5OTk5MTIsImV4cCI6MTc1ODAwMDgxMn0.pMaY-aoECynf1b0wva2fsmt90iD3182fGp5_9eeQIMc'

  const queryClient = useQueryClient()
  const options = getStatusAssignmentsOptions({
    headers: { Authorization: `Bearer ${authToken}` },
  })

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
  queryKey: getStatusAssignmentsQueryKey(),
    queryFn: ({ signal }) =>
      options.queryFn?.({
  queryKey: getStatusAssignmentsQueryKey(),
        signal,
        client: queryClient,
        meta: undefined,
      }) ?? Promise.reject("queryFn tidak tersedia"),
  })

  // Debug: print raw API payload to help mapping fields
  if (typeof window !== "undefined") {
    console.debug("getStatusAssignments raw response:", data)
  }

  // Helper: cari field dengan beberapa kemungkinan nama
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

  // Pemetaan data API -> shape yang dipakai UI mahasiswa
  const assignments: Assignment[] = rawAssignments.map((a, idx) => {
    const id = String(
      getField(a, ["id", "_id", "slug", "uuid", "assignmentId"]) ?? idx
    )

    const title =
      getField(a, ["nama", "name", "title"]) ?? "Tanpa Judul"

    const course =
      getField(a, ["course", "courseName", "mataKuliah", "kelas", "subject"]) ?? "-"

    const lecturer =
      getField(a, ["lecturer", "lecturerName", "dosen", "teacher"]) ?? "-"

    const deadlineRaw =
      getField(a, ["deadline", "dueDate", "due_date", "dueAt", "due", "deadlineAt", "due_at"])
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

    // Prefer status provided by the API when available (e.g. 'submitted').
    // Otherwise fall back to detecting submittedAt or deadline.
    let apiStatus = getField(a, ["status", "assignmentStatus", "state"]) as string | undefined

    // Normalize status text from API (e.g. "Submitted" -> "submitted")
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

    return {
      id,
      title,
      course,
      lecturer,
      deadline,
      description,
      status,
      submittedAt,
    }
  })

  // Keep a set of assignment ids that are already submitted (sync from server)
  useEffect(() => {
    const s = new Set<string>()
    for (const asg of assignments) {
      if (asg.status === "submitted") s.add(asg.id)
    }
    setSubmittedIds(s)
  }, [assignments])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const submissionMutation = useMutation({
    ...postSubmissionMutation(),
    onSuccess: (res) => {
      console.log("Upload successful:", res)
      // Optimistic UI update: mark the currently selected assignment as submitted
      setSelectedAssignment((prev) =>
        prev
          ? {
              ...prev,
              status: "submitted",
              submittedAt: new Date().toISOString(),
            }
          : prev
      )

      // Add to submittedIds to prevent further uploads client-side
      if (selectedAssignment) {
        setSubmittedIds((prev) => new Set(prev).add(selectedAssignment.id))
      }

      // Force refetch to get authoritative fresh data from server
      try {
        refetch()
      } catch (e) {
        // ignore
      }

      alert("Tugas berhasil dikumpulkan!")
      // reset form fields (keep selectedAssignment updated above so details show submitted)
      setFile(null)
      setComment("")
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
    if (submittedIds.has(selectedAssignment.id)) {
      // already submitted — prevent reupload
      alert("Tugas ini sudah dikumpulkan dan tidak dapat dikumpulkan lagi.")
      return
    }

    // Prefer file from input ref (matches `upload.tsx` concept), fallback to state
    const selectedFile = fileInputRef.current?.files?.[0] ?? file
    if (!selectedFile) return

    // prepare body as required by generated SDK (form-data handled by serializer)
    const tugasIdNum = Number(selectedAssignment.id)
    setIsSubmitting(true)
    submissionMutation.mutate({
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        file: selectedFile,
        // Generated SDK expects `tugasId: number` so provide a numeric value.
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
    return (
      <div className="space-y-6 bg-white font-poppins">
        <div className="text-gray-600">Memuat daftar tugas...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6 bg-white font-poppins">
        <div className="text-red-600">
          Gagal memuat daftar tugas: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Pengumpulan Tugas</h1>
          <p className="text-gray-600 mt-1 font-poppins font-light">Kelola dan kumpulkan tugas dari dosen Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">Daftar Tugas</h2>

          {assignments.length === 0 && (
            <div className="text-gray-500 text-sm">Belum ada tugas.</div>
          )}

          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
                selectedAssignment?.id === assignment.id
                  ? "border-primary-pink shadow-lg"
                  : "border-gray-200 hover:border-secondary-pink shadow-sm"
              }`}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 font-poppins">{assignment.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium font-poppins ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-poppins">
                <span className="text-gray-500">
                  Deadline: {new Date(assignment.deadline).toLocaleDateString("id-ID")}
                </span>
                {assignment.submittedAt && (
                  <span className="text-[#A7D477] font-medium">
                    Dikumpulkan: {new Date(assignment.submittedAt).toLocaleDateString("id-ID")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Assignment Details & Submission Form */}
        <div className="space-y-6">
          {selectedAssignment ? (
            <>
              {/* Assignment Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Tugas</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Judul</label>
                    <p className="text-gray-900">{selectedAssignment.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedAssignment.description}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Deadline</label>
                    <p className="text-[#F72C5B] font-medium">
                      {new Date(selectedAssignment.deadline).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Form */}
              {selectedAssignment.status === "pending" && !submittedIds.has(selectedAssignment.id) && (
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Komentar (Opsional)</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-pink focus:border-transparent resize-none font-poppins"
                        placeholder="Tambahkan komentar untuk tugas ini..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!file || isSubmitting}
                      className="w-full bg-primary-pink text-white py-3 px-4 rounded-lg font-medium hover:bg-secondary-pink disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-poppins"
                    >
                      {isSubmitting ? "Mengunggah..." : "Kumpulkan Tugas"}
                    </button>
                  </form>
                </div>
              )}

              {/* Already Submitted */}
              {selectedAssignment.status === "submitted" && (
                <div className="bg-[#A7D477]/10 rounded-xl border border-[#A7D477]/30 p-6">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-[#A7D477]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-[#A7D477]">Tugas Sudah Dikumpulkan</h4>
                      <p className="text-sm text-gray-600">
                        Dikumpulkan pada {new Date(selectedAssignment.submittedAt!).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Tugas</h3>
              <p className="text-gray-600">
                Pilih tugas dari daftar di sebelah kiri untuk melihat detail dan mengumpulkan tugas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
