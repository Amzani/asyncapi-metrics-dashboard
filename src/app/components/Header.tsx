"use client"
import { Select, SelectItem } from "@tremor/react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
export default function Header() {
  const router = useRouter()
  const segments = usePathname().split("/")

  const [dashboard, setDashboard] = useState(segments[2] || "DeveloperExperience")
  const [period, setPeriod] = useState(segments[3] || "1D")

  const reroute = (dashboard: string, period: string) => {
    router.push(`/dashboard/${dashboard}/${period}`)
  }

  return (
    <div className="w-full border-b border-solid border-indigo-900 pb-10">
      <div className="flex pt-24">
        <h1 className="text-3xl">AsyncAPI Metrics Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-8">
        <div className="">
          <Select
            defaultValue={dashboard}
            onValueChange={(dashboard) => {
              setDashboard(dashboard)
              reroute(dashboard, period)
            }}
          >
            <SelectItem value="DeveloperExperience">Developer Experience</SelectItem>
          </Select>
        </div>
        <div>
          <Select
            defaultValue={period}
            onValueChange={(period) => {
              setPeriod(period)
              reroute(dashboard, period)
            }}
          >
            <SelectItem value="1D">1 Day ago</SelectItem>
            <SelectItem value="1W">1 Week ago</SelectItem>
            <SelectItem value="1M">1 Month ago</SelectItem>
            <SelectItem value="3M">3 Months ago</SelectItem>
          </Select>
        </div>
      </div>
    </div>
  )
}
