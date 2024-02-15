import Image from "next/image";
import { Card } from '@tremor/react';
import { ChartLine } from '@/app/components/ChartLine';

export default async function Home() {
  const { data } = await fetch(process.env.METRICS_API_ENDPOINT as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Key": process.env.METRICS_API_KEY as string,
    },
    body: JSON.stringify({
      query: `
        query Query {
          actor {
            account(id: 4184737) {
              nrql(query: "SELECT uniqueCount(timestamp) FROM Metric WHERE metricName = 'asyncapi_adoption.action.finished' AND action = 'validate' AND  asyncapi_version = '3.0.0' SINCE 1 week ago") {
                results
                embeddedChartUrl
              }
            }
          }
          }
      `,
    }),
    next: { revalidate: 10 },
  }).then((res) => res.json());

  const asyncAPIAdoption = data?.actor?.account?.nrql?.results[0]['uniqueCount.timestamp'];
  console.log(data)

  return (
    <main>
      <div className="flex flex-row p-24">
        <Card className="mr-8 w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            AsyncAPI 3.0.0 Adoption
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            {asyncAPIAdoption}
          </p>
        </Card>
        <Card className="mr-8  w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Created AsyncAPI files
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            3k
          </p>
        </Card>
        <Card className="mr-8  w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Time to first API Design
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            20min
          </p>
        </Card>
        <Card className="mr-8  w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            System errors
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            12k
          </p>
        </Card>
        <Card className="mr-8  w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Validation errors
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            30k
          </p>
        </Card>
        <Card className="mr-8  w-1/6">
          <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Time to fix a validation error
          </h4>
          <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            40min
          </p>
        </Card>
        
      </div>
      <div className="flex flex-row pl-24 pr-24 mt-1">
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
      </div>
      <div className="flex flex-row pl-24 pr-24 mt-1">
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
      </div>
      <div className="flex flex-row pl-24 pr-24 mt-1">
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
        <div className="mr-8 w-1/2">
          <ChartLine></ChartLine>
        </div>
      </div>
    </main>
  );
}