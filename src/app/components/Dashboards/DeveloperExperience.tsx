import React from "react"
import { ChartLine } from "../ChartLine"
import numeral from "numeral"
import { fetchCardStats, fetchGraphStats, fetchTimeToFirstAPIDesign, fetchTimeToFixValidationError } from "@/newrelic_api"
import { Period } from "@/app/dashboard/[dashboardID]/[periodShorthand]/page"
import MetricCard from "../MetricCard"

interface DeveloperExperienceProps {
  period: Period
}


const TIME_FORMAT = "00:00:00"
const NUMBER_FORMAT = "0a"
const PERCENTAGE_FORMAT = "0.00%"

async function DeveloperExperience({ period }: DeveloperExperienceProps) {
  const unit = period === "1 day ago" ? "hour" : "day";
  const { asyncAPI3Adoptation, createdFiles, systemErrors, validationErrors } = await fetchCardStats(period)
  const { asyncAPI3AdoptationG, createdFilesG, systemErrorsG, validationErrorsG } = await fetchGraphStats(period)
  const timeToFirstAPIDesign = await fetchTimeToFirstAPIDesign(period)
  const timeToFixValidationError = await fetchTimeToFixValidationError(period)
  return (
    <main>
      <div className="`container mx-auto`">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        <MetricCard title="Time to First API Design" value={numeral(timeToFirstAPIDesign.median).format(TIME_FORMAT)} />
          <MetricCard title="Time to Fix Validation Error" value={numeral(timeToFixValidationError.median).format(TIME_FORMAT)} />
          <MetricCard title="AsyncAPI 3.x.x Adoption" value={numeral(asyncAPI3Adoptation).format(PERCENTAGE_FORMAT)} />
          <MetricCard title="Created AsyncAPI files" value={numeral(createdFiles).format(NUMBER_FORMAT)} />
          <MetricCard title="System Errors" value={numeral(systemErrors).format(NUMBER_FORMAT)} />
          <MetricCard title="Validation Errors" value={numeral(validationErrors).format(NUMBER_FORMAT)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <ChartLine title="Time to First API Design" data={timeToFirstAPIDesign.graphData} category="Time to First API Design" unit={unit} format={TIME_FORMAT}/>
          <ChartLine title="Time to Fix Validation Error" data={timeToFixValidationError.graphData} category="Time to Fix Validation Errors" unit={unit} format={TIME_FORMAT}/>
          <ChartLine title="AsyncAPI 3.x.x Adoption" data={asyncAPI3AdoptationG} category="V3Adoption" sign="%" unit={unit} format={PERCENTAGE_FORMAT}/>
          <ChartLine title="Created AsyncAPI Files" data={createdFilesG} category="CreatedFiles" unit={unit} format={NUMBER_FORMAT}/>
          <ChartLine title="system Errors" data={systemErrorsG} category="SystemErrors" unit={unit} format={NUMBER_FORMAT}/>
          <ChartLine title="Validation Errors" data={validationErrorsG} category="ValidationErrors" unit={unit} format={NUMBER_FORMAT}/>
        </div>

      </div>

    </main>
  )
}

export default DeveloperExperience
