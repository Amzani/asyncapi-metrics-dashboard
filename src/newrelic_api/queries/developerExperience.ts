import { Period } from '@/app/dashboard/[dashboardID]/[periodShorthand]/page'

const API_KEY = process.env.NEW_RELIC_USER_API_KEY
const ENDPOINT = process.env.NEW_RELIC_ENDPOINT
const ACCOUNT_ID = process.env.NEW_RELIC_ACCOUNT_ID

if (!API_KEY) {
  console.error("NEW_RELIC_USER_API_KEY is not set in the environment variables. Please set it and try again.")
  process.exit(1)
}

if (!ENDPOINT) {
  console.error("NEW_RELIC_ENDPOINT is not set in the environment variables. Please set it and try again.")
  process.exit(1)
}

if (!ACCOUNT_ID) {
  console.error("NEW_RELIC_ACCOUNT_ID is not set in the environment variables. Please set it and try again.")
  process.exit(1)
}


function buildGraphqlQuery(NrqlQuery: string) {
  return `
  {
    actor {
      account(id: ${ACCOUNT_ID}) {
        nrql(query: "${NrqlQuery}") {
          results
        }
      }
    }
  }
  `;
}

async function fetchGraphqlQuery(graphqlQuery: string) {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': API_KEY!!,
    },
    body: JSON.stringify({ query: graphqlQuery }),

  };
  try {
    const result = await fetch(ENDPOINT!!, fetchOptions)
    const data = await result.json()
    return data.data.actor.account.nrql.results
  } catch (error) {
    console.error(error)
  }

}

async function fetchData(NrqlQuery: string): Promise<any[]> {
  console.log("running: ", NrqlQuery)
  const graphqlQuery = buildGraphqlQuery(NrqlQuery);
  return fetchGraphqlQuery(graphqlQuery);
}

export type ChartPoint = {
  endTimeSeconds: number;
  result: null | number;
};

export async function fetchGraphStats(period: Period): Promise<Record<string, ChartPoint[]>> {
  const stats = await fetchStats(period, true);
  return {
    asyncAPI3AdoptationG: stats.AsyncAPI3Adoptation,
    createdFilesG: stats.CreatedFiles,
    systemErrorsG: stats.systemErrors,
    validationErrorsG: stats.validationErrors,
  }
}

export async function fetchCardStats(period: Period): Promise<Record<string, number>> {
  const stats = await fetchStats(period, false);
  return {
    asyncAPI3Adoptation: stats.AsyncAPI3Adoptation[0].result,
    createdFiles: stats.CreatedFiles[0].result,
    systemErrors: stats.systemErrors[0].result,
    validationErrors: stats.validationErrors[0].result,
  }
}

export async function fetchStats(period: Period, forGraph: boolean) {

  const AsyncAPI3Adoptation = await fetchData(`SELECT percentage(sum(asyncapi_adoption.action.finished),  asyncapi_version LIKE '3.%.%') AS 'result' FROM Metric WHERE action = 'validate' AND validation_result = 'valid' SINCE ${period} ${forGraph ? 'TIMESERIES' : ''}`);
  const CreatedFiles = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE action = 'new:file' SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);
  const systemErrors = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE success = false SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);
  const validationErrors = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE action = 'validate' AND validation_result = 'invalid' SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);

  return {
    AsyncAPI3Adoptation,
    CreatedFiles,
    systemErrors,
    validationErrors,
  }
}
