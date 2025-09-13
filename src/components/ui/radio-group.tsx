"use client"

import type * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

function RadioGroupItem({ className, value, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const getColorClasses = (value: string) => {
    switch (value) {
      case "hadir":
        return {
          border: "border-[#A7D477] data-[state=checked]:border-[#A7D477]",
          bg: "data-[state=checked]:bg-[#E4F1AC]",
          indicator: "fill-[#A7D477]",
        }
      case "sakit":
        return {
          border: "border-[#FF748B] data-[state=checked]:border-[#FF748B]",
          bg: "data-[state=checked]:bg-[#FF748B]/10",
          indicator: "fill-[#FF748B]",
        }
      case "izin":
        return {
          border: "border-[#F72C5B] data-[state=checked]:border-[#F72C5B]",
          bg: "data-[state=checked]:bg-[#F72C5B]/10",
          indicator: "fill-[#F72C5B]",
        }
      case "alpha":
        return {
          border: "border-[#F72C5B] data-[state=checked]:border-[#F72C5B]",
          bg: "data-[state=checked]:bg-[#F72C5B]/10",
          indicator: "fill-[#F72C5B]",
        }
      default:
        return {
          border: "border-gray-300 data-[state=checked]:border-blue-500",
          bg: "data-[state=checked]:bg-blue-50",
          indicator: "fill-blue-600",
        }
    }
  }

  const colors = getColorClasses(value || "")

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      value={value}
      className={cn(
        `focus-visible:ring-4 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-white aspect-square size-6 shrink-0 rounded-full border-2 shadow-md transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-lg hover:scale-105 ${colors.border} ${colors.bg}`,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon
          className={`absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${colors.indicator}`}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
