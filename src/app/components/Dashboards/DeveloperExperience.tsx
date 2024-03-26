import React from "react"
import { ChartLine } from "../ChartLine"
import numeral from "numeral"
import { fetchCardStats, fetchGraphStats } from "@/newrelic_api"
import { Period } from "@/app/dashboard/[dashboardID]/[periodShorthand]/page"
import MetricCard from "../MetricCard"

interface DeveloperExperienceProps {
  period: Period
}

async function DeveloperExperience({ period }: DeveloperExperienceProps) {
  const { asyncAPI3Adoptation, createdFiles, systemErrors, validationErrors } = await fetchCardStats(period)
  const { asyncAPI3AdoptationG, createdFilesG, systemErrorsG, validationErrorsG } = await fetchGraphStats(period)

  return (
    <main>
      <div className="`container mx-auto`">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <MetricCard title="AsyncAPI 3.x.x Adoption" value={asyncAPI3Adoptation ? `${asyncAPI3Adoptation}%` : "N/A"} />
          <MetricCard title="Created AsyncAPI files" value={numeral(createdFiles).format("0a")} />
          <MetricCard title="System Errors" value={numeral(systemErrors).format("0a")} />
          <MetricCard title="Validation Errors" value={numeral(validationErrors).format("0a")} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <ChartLine title="AsyncAPI 3.x.x Adoption" data={asyncAPI3AdoptationG} category="V3Adoption" sign="%" />
          <ChartLine title="Created AsyncAPI Files" data={createdFilesG} category="CreatedFiles" />
          <ChartLine title="system Errors" data={systemErrorsG} category="SystemErrors" />
          <ChartLine title="Validation Errors" data={validationErrorsG} category="ValidationErrors" />
        </div>
      </div>
    </main>
  )
}

export default DeveloperExperience
