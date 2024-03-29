import { Period } from '@/app/dashboard/[dashboardID]/[periodShorthand]/page'
import CacheManager, { CacheData } from './CacheManager'

const API_KEY = process.env.NEW_RELIC_USER_API_KEY
const ENDPOINT = process.env.NEW_RELIC_ENDPOINT
const ACCOUNT_ID = process.env.NEW_RELIC_ACCOUNT_ID

// just to cover the case when the query reaches the server a litle late.
const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000 - 100000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_IN_MS = 7 * ONE_DAY_IN_MS;
const ONE_MONTH_IN_MS = 30 * ONE_DAY_IN_MS;
const THREE_MONTHS_IN_MS = 3 * ONE_MONTH_IN_MS;


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
    if(data.errors) {data.errors.forEach((error: any) => console.error(error))}
    else return data.data.actor.account.nrql.results
  } catch (error) {
    console.error(error)
  }

  return [];
}

async function fetchData(NrqlQuery: string): Promise<any[]> {
  console.log("running: ", NrqlQuery)
  const graphqlQuery = buildGraphqlQuery(NrqlQuery);
  return fetchGraphqlQuery(graphqlQuery);
}

export type ChartPoint = {
  timestamp: number;
  value: number;
};

export async function fetchGraphStats(period: Period): Promise<Record<string, ChartPoint[]>> {
  const stats = await fetchStats(period, true);
  const formmater = (entry: any) => ({timestamp: entry.beginTimeSeconds * 1000, value: entry.result});
  return {
    asyncAPI3AdoptationG: stats.AsyncAPI3Adoptation.map(formmater),
    createdFilesG: stats.CreatedFiles.map(formmater),
    systemErrorsG: stats.systemErrors.map(formmater),
    validationErrorsG: stats.validationErrors.map(formmater),
  }
}

export async function fetchCardStats(period: Period): Promise<Record<string, number>> {
  const stats = await fetchStats(period, false);
  console.log(stats.AsyncAPI3Adoptation)
  return {
    asyncAPI3Adoptation: stats.AsyncAPI3Adoptation[0].result,
    createdFiles: stats.CreatedFiles[0].result,
    systemErrors: stats.systemErrors[0].result,
    validationErrors: stats.validationErrors[0].result,
  }
}

export async function fetchStats(period: Period, forGraph: boolean) {

  const AsyncAPI3Adoptation = await fetchData(`SELECT filter(sum(asyncapi_adoption.action.finished), WHERE asyncapi_version LIKE '3.%.%')/sum(asyncapi_adoption.action.finished) AS 'result' FROM Metric WHERE action = 'validate' AND validation_result = 'valid' SINCE ${period} ${forGraph ? 'TIMESERIES' : ''}`);
  const CreatedFiles = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE action = 'new:file' OR action = 'new' SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);
  const systemErrors = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE success = false SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);
  const validationErrors = await fetchData(`SELECT sum(asyncapi_adoption.action.finished) as 'result' FROM Metric WHERE action = 'validate' AND validation_result = 'invalid' SINCE ${period}  ${forGraph ? 'TIMESERIES' : ''}`);

  return {
    AsyncAPI3Adoptation,
    CreatedFiles,
    systemErrors,
    validationErrors,
  }
}
type TimeToFirstAPIDesignQueryResult = {
  facet:string[], 
  endTimestamp: number
}

export async function fetchTimeToFirstAPIDesign(period: Period, forGraph: boolean = false): Promise<{median: number, graphData: ChartPoint[]}> {
  const cacheManager = new CacheManager('cache/time-to-first-api-design.json');
  const cache = cacheManager.getCache();
  const data = cache.data;
  const currentTimestamp = Date.now();

  const SINCE = cache.latestQueriedTimestamp || currentTimestamp - TWO_DAYS_IN_MS;
  const UNTIL = SINCE + TWO_DAYS_IN_MS < currentTimestamp ? SINCE + TWO_DAYS_IN_MS : currentTimestamp;
  const query = `SELECT min(endTimestamp) as 'endTimestamp' FROM Metric WHERE file_creation_timestamp is NOT NULL AND action = 'generate:fromTemplate' FACET file_creation_timestamp, user SINCE ${SINCE} UNTIL ${UNTIL} RAW`;
  const queryResult: TimeToFirstAPIDesignQueryResult[] =  await fetchData(query);
  const newData: CacheData[] = queryResult.map((result) => ({timestamp: result.endTimestamp, value: result.endTimestamp - Number(result.facet[0])}))
  const combinedData = data.concat(newData);
  cacheManager.updateCache(newData);
 return filterForPeriod(period, combinedData);

}

type TimeToFixValidationErrorQueryResult = {
  facet: string[];
  invalidTS: number;
  validTS: number
}

export async function fetchTimeToFixValidationError(period: Period, forGraph: boolean = false) {
  const cacheManager = new CacheManager('cache/time-to-fix-validation-error.json');
  const cache = cacheManager.getCache();
  const data = cache.data;
  const currentTimestamp = Date.now();

  const SINCE = cache.latestQueriedTimestamp || currentTimestamp - TWO_DAYS_IN_MS;
  const UNTIL = SINCE + TWO_DAYS_IN_MS < currentTimestamp ? SINCE + TWO_DAYS_IN_MS : currentTimestamp;
  const query = `SELECT filter(latest(endTimestamp), validation_result ='valid') AS 'validTS', filter(latest(endTimestamp), WHERE validation_result ='invalid') as 'invalidTS' FROM Metric WHERE file_creation_timestamp is not null AND action = 'validate' AND success = true FACET user,file_creation_timestamp SINCE ${SINCE} UNTIL ${UNTIL} RAW`;
  const queryResult: TimeToFixValidationErrorQueryResult[] = await fetchData(query);
  const newData: CacheData[] = queryResult.map((result) => ({timestamp: result.validTS, value: result.validTS - result.invalidTS}))
  const combinedData = data.concat(newData);
  cacheManager.updateCache(newData);
  return filterForPeriod(period, combinedData);
}


function calculateMedian(data: number[]) {
  const sortedData = data.sort((a, b) => a - b);
  const mid = Math.floor(sortedData.length / 2);
  return sortedData.length % 2 !== 0 ? sortedData[mid] : (sortedData[mid - 1] + sortedData[mid]) / 2;
}

function filterForPeriod(period: string, data: CacheData[]): {median: number, graphData: ChartPoint[]} {
  const currentTimestamp = Date.now()
  let filtered: CacheData[] = [];
  let graphData: CacheData[] = [];
  const maketograph = (entry: any) => ({timestamp: entry.timestamp, value: entry.value/1000});
 if(period === '1 day ago') {
    filtered = data.filter((entry) => currentTimestamp - entry.timestamp < ONE_DAY_IN_MS);
    graphData = calculateMedianTimeToFirstApi(filtered, 48, ONE_DAY_IN_MS);
 }
  if(period === '1 week ago') {
    filtered =  data.filter((entry) => currentTimestamp - entry.timestamp < ONE_WEEK_IN_MS);
    graphData = calculateMedianTimeToFirstApi(filtered, 28, ONE_WEEK_IN_MS);
  }
  if(period === '1 month ago') {
    filtered = data.filter((entry) => currentTimestamp - entry.timestamp < ONE_MONTH_IN_MS);
    graphData = calculateMedianTimeToFirstApi(filtered, 30, ONE_MONTH_IN_MS);
  }
  if(period === '3 months ago') {
    filtered = data.filter((entry) => currentTimestamp - entry.timestamp < THREE_MONTHS_IN_MS);
    graphData = calculateMedianTimeToFirstApi(filtered, 30, THREE_MONTHS_IN_MS);
  }
  const median = calculateMedian(filtered.map((entry) => entry.value))/1000;
  return {median, graphData: graphData.map(maketograph)};
}


function calculateMedianTimeToFirstApi(data: CacheData[], categories: number, totalCategoriesLength: number): CacheData[] {

  const categorySpanMilliseconds = totalCategoriesLength / categories;
  
  let output: CacheData[] = [];
  
  // Handle case when data is empty by returning categories with placeholder results
  if (data.length === 0) {
    for (let i = 0; i < categories; i++) {
      output.push({
        timestamp: (totalCategoriesLength / categories) * (i + 1), // Convert to milliseconds
        value: 0
      });
    }
    return output;
  }
  
  // Find the latest timestamp to set as end boundary for categorization
  const latestTimestamp = Date.now();

  for (let i = 0; i < categories; i++) {
    const categoryEnd = latestTimestamp - (categorySpanMilliseconds * i);
    const categoryStart = categoryEnd - categorySpanMilliseconds;

    // Filter data for the current category period
    const filteredResults = data
      .filter(item => item.timestamp > categoryStart && item.timestamp <= categoryEnd)
      .map(item => item.value)
    
    // Calculate median of filtered results
    let median: number = 0;
    if (filteredResults.length > 0) { 
      median = calculateMedian(filteredResults);
    }
    
    // Append result for the current category
    output.unshift({
      timestamp: categoryEnd,
      value: median
    });
  }

  return output;
}
