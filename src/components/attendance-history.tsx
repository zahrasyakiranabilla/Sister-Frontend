"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CheckCircle2, AlertCircle, Clock, X, Search, Filter } from "lucide-react"

interface AttendanceHistoryProps {
  attendanceData: Array<{
    id: number
    subject: string
    status: string
    time: string
    date: string
  }>
  stats: {
    totalClasses: number
    attended: number
    sick: number
    permission: number
    absent: number
    attendanceRate: number
  }
}

export default function AttendanceHistory({ attendanceData, stats }: AttendanceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hadir":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "Sakit":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "Izin":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Alpha":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "bg-green-100 text-green-700"
      case "Sakit":
        return "bg-blue-100 text-blue-700"
      case "Izin":
        return "bg-yellow-100 text-yellow-700"
      case "Alpha":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredData = attendanceData
    .filter((item) => {
      const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return a.subject.localeCompare(b.subject)
    })

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.attended}</p>
              <p className="text-sm text-gray-600">Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.sick}</p>
              <p className="text-sm text-gray-600">Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.permission}</p>
              <p className="text-sm text-gray-600">Izin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-gray-600">Alpha</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Hadir">Hadir</SelectItem>
                <SelectItem value="Sakit">Sakit</SelectItem>
                <SelectItem value="Izin">Izin</SelectItem>
                <SelectItem value="Alpha">Alpha</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Tanggal Terbaru</SelectItem>
                <SelectItem value="subject">Mata Kuliah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi ({filteredData.length} data)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Tidak ada data yang ditemukan</div>
            ) : (
              filteredData.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(attendance.status)}
                    <div>
                      <p className="font-medium text-gray-900">{attendance.subject}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attendance.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        • {attendance.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                    {attendance.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
