import React from "react"
import { Card } from "@tremor/react"

interface MetricCardProps {
  title: string
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2 h-full'>
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content mx-auto">{title}</h4>
      <div className='mx-auto flex-grow flex h-full'>
      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong mt-auto">
        {value}
      </p>
      </div>
      </div>
    </Card>
  )
}

export default MetricCard
