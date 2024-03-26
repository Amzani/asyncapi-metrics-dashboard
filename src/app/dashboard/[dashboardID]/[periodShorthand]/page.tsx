import DeveloperExperience from "@/app/components/Dashboards/DeveloperExperience"
import { notFound } from "next/navigation"

export const revalidate = 86400

interface PostShowPageProps {
  params: {
    dashboardID: string
    periodShorthand: string
  }
}

export type Period = "1 day ago" | "1 week ago" | "1 month ago" | "3 months ago"
const dashboards = ["DeveloperExperience"]

function convertPeriodShorthand(shorthand: string): Period {
  const periodMap: Record<string, Period> = {
    "1D": "1 day ago",
    "1W": "1 week ago",
    "1M": "1 month ago",
    "3M": "3 months ago",
  }

  if (!periodMap[shorthand]) {
    console.warn("Invalid period shorthand:", shorthand)
    return notFound()
  }
  return periodMap[shorthand]
}

export default async function Dashboard({ params }: PostShowPageProps) {
  const { dashboardID, periodShorthand } = params
  if (!dashboards.includes(dashboardID)) {
    return notFound()
  }
  const period = convertPeriodShorthand(periodShorthand)
  return dashboardID === "DeveloperExperience" && <DeveloperExperience period={period} />
}

export function generateStaticParams() {
  return ["1D", "1W", "1M", "3M"].map((periodShorthand) => {
    return {
      dashboardID: "DeveloperExperience",
      periodShorthand,
    }
  })
}
