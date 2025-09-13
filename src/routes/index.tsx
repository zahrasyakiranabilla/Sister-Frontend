"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, GraduationCap, BarChart3, CheckCircle2, ArrowLeft } from "lucide-react"
// TODO: Make sure the file exists at src/components/attendance-form.tsx
import AttendanceForm from "@/components/attendance-form"
import AttendanceHistory from "@/components/attendance-history"

export const Route = createFileRoute("/")({
  component: StudentDashboard,
})

type Page = "dashboard" | "attendance" | "history"

function StudentDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  const [attendanceData, setAttendanceData] = useState([
    { id: 1, subject: "Pemrograman Web", status: "Hadir", time: "08:00", date: "2025-01-13" },
    { id: 2, subject: "Basis Data", status: "Hadir", time: "10:00", date: "2025-01-13" },
    { id: 3, subject: "Algoritma", status: "Izin", time: "13:00", date: "2025-01-12" },
    { id: 4, subject: "Pemrograman Web", status: "Hadir", time: "08:00", date: "2025-01-11" },
    { id: 5, subject: "Basis Data", status: "Sakit", time: "10:00", date: "2025-01-11" },
    { id: 6, subject: "UI/UX Design", status: "Hadir", time: "13:00", date: "2025-01-11" },
    { id: 7, subject: "Algoritma", status: "Hadir", time: "15:00", date: "2025-01-10" },
    { id: 8, subject: "Pemrograman Web", status: "Alpha", time: "08:00", date: "2025-01-10" },
    { id: 9, subject: "Basis Data", status: "Hadir", time: "10:00", date: "2025-01-10" },
    { id: 10, subject: "UI/UX Design", status: "Izin", time: "13:00", date: "2025-01-09" },
    { id: 11, subject: "Algoritma", status: "Hadir", time: "15:00", date: "2025-01-09" },
    { id: 12, subject: "Pemrograman Web", status: "Hadir", time: "08:00", date: "2025-01-09" },
    { id: 13, subject: "Basis Data", status: "Hadir", time: "10:00", date: "2025-01-08" },
    { id: 14, subject: "UI/UX Design", status: "Hadir", time: "13:00", date: "2025-01-08" },
    { id: 15, subject: "Algoritma", status: "Sakit", time: "15:00", date: "2025-01-08" },
    { id: 16, subject: "Pemrograman Web", status: "Hadir", time: "08:00", date: "2025-01-07" },
    { id: 17, subject: "Basis Data", status: "Hadir", time: "10:00", date: "2025-01-07" },
    { id: 18, subject: "UI/UX Design", status: "Hadir", time: "13:00", date: "2025-01-07" },
    { id: 19, subject: "Algoritma", status: "Izin", time: "15:00", date: "2025-01-06" },
    { id: 20, subject: "Pemrograman Web", status: "Hadir", time: "08:00", date: "2025-01-06" },
  ])

  const todaySchedule = [
    {
      id: 1,
      class: "Algoritma dan Pemrograman",
      lecturer: "Dr. Ahmad Santoso",
      time: "07:00 - 08:40",
      room: "Lab Komputer 1",
      status: "completed",
      attendance: "hadir",
    },
    {
      id: 2,
      class: "Struktur Data",
      lecturer: "Prof. Siti Nurhaliza",
      time: "08:40 - 10:20",
      room: "Ruang 201",
      status: "active",
      attendance: null,
    },
    {
      id: 3,
      class: "Basis Data",
      lecturer: "Dr. Budi Santoso",
      time: "10:30 - 12:10",
      room: "Lab Database",
      status: "upcoming",
      attendance: null,
    },
  ]

  const stats = {
    totalClasses: attendanceData.length,
    attended: attendanceData.filter((a) => a.status === "Hadir").length,
    sick: attendanceData.filter((a) => a.status === "Sakit").length,
    permission: attendanceData.filter((a) => a.status === "Izin").length,
    absent: attendanceData.filter((a) => a.status === "Alpha").length,
    get attendanceRate() {
      return Math.round((this.attended / this.totalClasses) * 100 * 10) / 10
    },
  }

  const studentStats = {
    totalClasses: 6,
    attendedClasses: stats.attended,
    totalSessions: stats.totalClasses,
    attendanceRate: stats.attendanceRate,
    todayClasses: 3,
    completedToday: 1,
  }

  const handleAttendanceSubmit = (newAttendance: any) => {
    const attendance = {
      id: Date.now(),
      ...newAttendance,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    }
    setAttendanceData((prev) => [attendance, ...prev])
    setCurrentPage("dashboard")
  }

  const navigateToAttendance = () => setCurrentPage("attendance")
  const navigateToHistory = () => setCurrentPage("history")
  const navigateToDashboard = () => setCurrentPage("dashboard")

  if (currentPage === "attendance") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={navigateToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F72C5B]/10">
                <GraduationCap className="h-6 w-6 text-[#F72C5B]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Isi Absensi</h1>
                <p className="text-sm text-gray-500">Pilih mata kuliah dan status kehadiran</p>
              </div>
            </div>
          </div>
        </header>
        <AttendanceForm
    todaySchedule={todaySchedule.map(item => ({
    id: item.id,
    subject: item.class,
    time: item.time,
    room: item.room,
    lecturer: item.lecturer,
  }))}
  onSubmit={handleAttendanceSubmit}
/>
      </div>
    )
  }

  if (currentPage === "history") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={navigateToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F72C5B]/10">
                <GraduationCap className="h-6 w-6 text-[#F72C5B]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Riwayat Absensi</h1>
                <p className="text-sm text-gray-500">Lihat semua riwayat kehadiran Anda</p>
              </div>
            </div>
          </div>
        </header>
        <AttendanceHistory attendanceData={attendanceData} stats={stats} />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Selesai</Badge>
      case "active":
        return <Badge className="bg-orange-100 text-orange-700">Sedang Berlangsung</Badge>
      case "upcoming":
        return <Badge variant="outline">Akan Datang</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getAttendanceBadge = (attendance: string | null) => {
    if (!attendance) return null
    switch (attendance) {
      case "hadir":
        return <Badge className="bg-green-100 text-green-700">Hadir</Badge>
      case "sakit":
        return <Badge className="bg-yellow-100 text-yellow-700">Sakit</Badge>
      case "izin":
        return <Badge className="bg-blue-100 text-blue-700">Izin</Badge>
      case "alpha":
        return <Badge className="bg-red-100 text-red-700">Alpha</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F72C5B]/10">
              <GraduationCap className="h-7 w-7 text-[#F72C5B]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Mahasiswa</h1>
              <p className="text-sm text-gray-600">Selamat datang kembali, Robby Whohoho</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Robby Whohoho</p>
              <p className="text-xs text-gray-500">NIM: L0123124</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#F72C5B] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">RW</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mata Kuliah</p>
                  <p className="text-3xl font-bold text-gray-900">{studentStats.totalClasses}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kehadiran</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {studentStats.attendedClasses}/{studentStats.totalSessions}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Persentase Hadir</p>
                  <p className="text-3xl font-bold text-green-600">{studentStats.attendanceRate}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kelas Hari Ini</p>
                  <p className="text-3xl font-bold text-[#F72C5B]">{studentStats.todayClasses}</p>
                </div>
                <div className="h-12 w-12 bg-[#F72C5B]/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#F72C5B]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Aksi Cepat</CardTitle>
            <CardDescription className="text-gray-600">Kelola absensi dengan mudah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                className="h-12 bg-[#F72C5B] hover:bg-[#F72C5B]/90 text-white font-medium"
                onClick={navigateToAttendance}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Isi Absensi
              </Button>
              <Button
                className="h-12 bg-white border-2 border-[#F72C5B] text-[#F72C5B] hover:bg-[#F72C5B]/5 font-medium"
                onClick={navigateToHistory}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Lihat Riwayat Absensi
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Jadwal Perkuliahan Hari Ini</CardTitle>
            <CardDescription className="text-gray-600">Daftar mata kuliah dan status kehadiran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{schedule.class}</p>
                      <p className="text-sm text-muted-foreground">{schedule.lecturer}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.time} • {schedule.room}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getAttendanceBadge(schedule.attendance)}
                    {getStatusBadge(schedule.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
