import React from "react"
import { Card } from "@tremor/react"

interface MetricCardProps {
  title: string
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card>
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{title}</h4>
      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {value}
      </p>
    </Card>
  )
}

export default MetricCard
