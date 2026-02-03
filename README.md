# Stock Data API

Stock aggregator backend API built with NestJS. Fetches stock data from Finnhub and AlphaVantage APIs with Supabase authentication.

## API Endpoints

### Authentication

**POST** `/login`

- Body: `{ email: string, password: string }`
- Returns: `{ access_token: string }`
- Public endpoint for user authentication

### Stock Data

**GET** `/api-data/stock/:symbol`

- Requires: Bearer token authentication
- Parameters:
  - `symbol` (path) - Stock symbol (e.g., AAPL, TSLA)
- Query params:
  - `include` (optional) - Comma-separated list of data types to include. Options: `profile`, `news`, `financials`. Default: all three
  - `maxStories` (optional) - Limits news to the most recent N stories. By default, returns all news from the past 2 days. Use this to get only the latest stories (e.g., `maxStories=5` for the 5 most recent)
- Returns: `{ profile: object, news: array, financials: object }`
- Note: The `news` array contains company news from 2 days ago until now, ordered by recency
- Examples:
  - `/api-data/stock/AAPL` - Get all data for Apple
  - `/api-data/stock/AAPL?include=profile,news` - Get only profile and news
  - `/api-data/stock/AAPL?include=news&maxStories=5` - Get only 5 news stories

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
