"use client"

import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, MapPin, User, Calendar } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/absensi")({
  component: AttendancePage,
})

function AttendancePage() {
  const [selectedAttendance, setSelectedAttendance] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for active session
  const activeSession = {
    id: 1,
    class: "Struktur Data",
    lecturer: "Prof. Siti Nurhaliza",
    time: "08:40 - 10:20",
    room: "Ruang 201",
    date: "Senin, 13 September 2025",
    sessionCode: "SD-001-130925",
  }

  const attendanceOptions = [
    {
      value: "hadir",
      label: "Hadir",
      description: "Saya mengikuti perkuliahan dengan baik",
      color: "bg-[var(--status-present)] text-[var(--status-present-foreground)]",
      icon: CheckCircle,
    },
    {
      value: "sakit",
      label: "Sakit",
      description: "Tidak dapat mengikuti karena sakit",
      color: "bg-[var(--status-sick)] text-[var(--status-sick-foreground)]",
      icon: Clock,
    },
    {
      value: "izin",
      label: "Izin",
      description: "Tidak dapat mengikuti karena ada keperluan",
      color: "bg-[var(--status-permission)] text-[var(--status-permission-foreground)]",
      icon: User,
    },
    {
      value: "alpha",
      label: "Alpha",
      description: "Tidak mengikuti perkuliahan tanpa keterangan",
      color: "bg-[var(--status-absent)] text-[var(--status-absent-foreground)]",
      icon: Calendar,
    },
  ]

  const handleSubmit = async () => {
    if (!selectedAttendance) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    // Show success message or redirect
    alert(`Absensi berhasil disimpan dengan status: ${selectedAttendance}`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Isi Absensi</h1>
          <p className="text-muted-foreground">Pilih mata kuliah dan status kehadiran Anda untuk sesi perkuliahan</p>
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Informasi Sesi Perkuliahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{activeSession.class}</p>
                  <p className="text-sm text-muted-foreground">{activeSession.lecturer}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{activeSession.time}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{activeSession.room}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium text-foreground">{activeSession.date}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Kode Sesi</p>
                <span className="font-medium text-foreground">{activeSession.sessionCode}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Status Kehadiran</CardTitle>
          <CardDescription>Pilih salah satu status kehadiran yang sesuai dengan kondisi Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAttendance} onValueChange={setSelectedAttendance}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendanceOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3 p-4 rounded-lg border-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group">
                        <div
                          className={`h-12 w-12 rounded-xl ${option.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {option.label}
                          </p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!selectedAttendance || isSubmitting}
              className="w-full md:w-auto min-w-[200px] px-8 py-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-lg"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Menyimpan Absensi...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Simpan Absensi
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
