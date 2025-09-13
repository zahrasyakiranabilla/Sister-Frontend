"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock, AlertCircle, X, CheckCircle } from "lucide-react"

interface AttendanceFormProps {
  todaySchedule: Array<{
    id: number
    subject: string
    time: string
    room: string
    lecturer: string
  }>
  onSubmit: (attendance: any) => void
}

export default function AttendanceForm({ todaySchedule, onSubmit }: AttendanceFormProps) {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !status) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const selectedSchedule = todaySchedule.find((s) => s.subject === selectedSubject)

    onSubmit({
      subject: selectedSubject,
      status,
      notes,
      lecturer: selectedSchedule?.lecturer,
      room: selectedSchedule?.room,
    })

    setIsSubmitting(false)
  }

  const statusOptions = [
    { value: "Hadir", label: "Hadir", icon: CheckCircle2, color: "text-green-600" },
    { value: "Sakit", label: "Sakit", icon: AlertCircle, color: "text-blue-600" },
    { value: "Izin", label: "Izin", icon: Clock, color: "text-yellow-600" },
    { value: "Alpha", label: "Alpha", icon: X, color: "text-red-600" },
  ]

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Form Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                Mata Kuliah
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full h-12 px-4 border-2 hover:border-primary/30 focus:border-primary transition-all duration-200 rounded-xl bg-background">
                  <SelectValue placeholder="Pilih mata kuliah" className="text-muted-foreground" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  {todaySchedule.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.subject} className="p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">{schedule.subject}</span>
                        <span className="text-sm text-muted-foreground">
                          {schedule.time} • {schedule.lecturer}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Status Kehadiran</Label>
              <RadioGroup value={status} onValueChange={setStatus}>
                <div className="grid grid-cols-2 gap-4">
                  {statusOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Icon className={`h-4 w-4 ${option.color}`} />
                          <span className="font-medium">{option.label}</span>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            {(status === "Sakit" || status === "Izin") && (
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Keterangan
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Masukkan keterangan (opsional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] border-2 hover:border-primary/30 focus:border-primary transition-all duration-200 rounded-xl"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-lg"
              disabled={!selectedSubject || !status || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Simpan Absensi
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
