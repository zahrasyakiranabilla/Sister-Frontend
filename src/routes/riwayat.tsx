import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Download, Filter } from "lucide-react"

export const Route = createFileRoute("/riwayat")({
  component: AttendanceHistoryPage,
})

function AttendanceHistoryPage() {
  // Mock attendance history data
  const attendanceHistory = [
    {
      id: 1,
      class: "Algoritma dan Pemrograman",
      lecturer: "Dr. Ahmad Santoso",
      date: "2025-09-13",
      time: "07:00 - 08:40",
      room: "Lab Komputer 1",
      status: "hadir",
      sessionCode: "AP-001-130925",
    },
    {
      id: 2,
      class: "Struktur Data",
      lecturer: "Prof. Siti Nurhaliza",
      date: "2025-09-12",
      time: "08:40 - 10:20",
      room: "Ruang 201",
      status: "hadir",
      sessionCode: "SD-001-120925",
    },
    {
      id: 3,
      class: "Basis Data",
      lecturer: "Dr. Budi Santoso",
      date: "2025-09-11",
      time: "10:30 - 12:10",
      room: "Lab Database",
      status: "sakit",
      sessionCode: "BD-001-110925",
    },
    {
      id: 4,
      class: "Algoritma dan Pemrograman",
      lecturer: "Dr. Ahmad Santoso",
      date: "2025-09-10",
      time: "07:00 - 08:40",
      room: "Lab Komputer 1",
      status: "hadir",
      sessionCode: "AP-002-100925",
    },
    {
      id: 5,
      class: "Pemrograman Web",
      lecturer: "Dr. Lisa Permata",
      date: "2025-09-09",
      time: "13:00 - 14:40",
      room: "Lab Web",
      status: "izin",
      sessionCode: "PW-001-090925",
    },
    {
      id: 6,
      class: "Struktur Data",
      lecturer: "Prof. Siti Nurhaliza",
      date: "2025-09-08",
      time: "08:40 - 10:20",
      room: "Ruang 201",
      status: "alpha",
      sessionCode: "SD-002-080925",
    },
  ]

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case "hadir":
        return <Badge className="bg-[var(--status-present)] text-[var(--status-present-foreground)]">Hadir</Badge>
      case "sakit":
        return <Badge className="bg-[var(--status-sick)] text-[var(--status-sick-foreground)]">Sakit</Badge>
      case "izin":
        return <Badge className="bg-[var(--status-permission)] text-[var(--status-permission-foreground)]">Izin</Badge>
      case "alpha":
        return <Badge className="bg-[var(--status-absent)] text-[var(--status-absent-foreground)]">Alpha</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate statistics
  const totalSessions = attendanceHistory.length
  const presentCount = attendanceHistory.filter((item) => item.status === "hadir").length
  const sickCount = attendanceHistory.filter((item) => item.status === "sakit").length
  const permissionCount = attendanceHistory.filter((item) => item.status === "izin").length
  const absentCount = attendanceHistory.filter((item) => item.status === "alpha").length
  const attendanceRate = Math.round((presentCount / totalSessions) * 100)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Riwayat Absensi</h1>
            <p className="text-muted-foreground">Lihat riwayat kehadiran Anda di semua mata kuliah</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sesi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--status-present)]">{presentCount}</p>
            <p className="text-sm text-muted-foreground">Hadir</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--status-sick)]">{sickCount}</p>
            <p className="text-sm text-muted-foreground">Sakit</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--status-permission)]">{permissionCount}</p>
            <p className="text-sm text-muted-foreground">Izin</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--status-absent)]">{absentCount}</p>
            <p className="text-sm text-muted-foreground">Alpha</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{attendanceRate}%</p>
              <p className="text-muted-foreground">Tingkat Kehadiran</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
          <CardDescription>Daftar lengkap kehadiran Anda di semua mata kuliah</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{record.class}</p>
                    <p className="text-sm text-muted-foreground">{record.lecturer}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{record.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{record.room}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {record.sessionCode}
                  </Badge>
                  {getAttendanceBadge(record.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
