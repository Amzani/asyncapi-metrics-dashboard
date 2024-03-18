# AsyncAPI Metrics Dashboard

This Next.js 14 application parses AsyncAPI metrics from New Relic and displays them for relevant [Working Groups](https://github.com/orgs/asyncapi/discussions/1037), providing a dashboard for viewing their statistics. It employs a Static Site Generation (SSG) model, pre-rendering pages at build time, and updates the data only once daily to ensure optimal performance.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Amzani/asyncapi-metrics-dashboard.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure New Relic credentials:
   Create a `.env.local` file in the project root directory and add the following:

   ```
   NEW_RELIC_USER_API_KEY
   NEW_RELIC_ENDPOINT
   NEW_RELIC_ACCOUNT_ID
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Access the dashboard: The application will be accessible at http://localhost:3000

## Features

- Parses AsyncAPI metrics from New Relic
- Groups metrics for relevant datasets
- Displays metrics in a user-friendly dashboard
- **Static Site Generation (SSG):** Pages are pre-rendered for faster load times.
- **Daily Data Updates:** Ensures data freshness while maintaining performance.

## Tech Stack

- Next.js 14
- New Relic API
- React
- Tremor (`@tremor/react`)
- Tailwind CSS
