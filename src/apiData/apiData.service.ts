import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

const today = new Date();
const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

const CACHE_TTL = {
  PROFILE: 60 * 60 * 24, // 24 hours
  NEWS: 60 * 15, // 15 minutes
  FINANCIALS: 60 * 60, // 1 hour becuase the rate limit is 25 calls per day
};

@Injectable()
export class ApiDataService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async getProfile(symbol: string) {
    const cacheKey = `profile:${symbol}`;

    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for profile: ${symbol}`);
      return cached;
    }

    const apiKey = this.configService.get<string>('FINNHUB_API_KEY');

    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY is not set in environment variables');
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    await this.redisService.set(cacheKey, data, CACHE_TTL.PROFILE);
    console.log(`Cached profile: ${symbol}`);

    return data;
  }

  async getCompanyNews(symbol: string, maxStories?: number) {
    const cacheKey = `news:${symbol}:${maxStories || 'all'}`;

    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for news: ${symbol}`);
      return cached;
    }

    const apiKey = this.configService.get<string>('FINNHUB_API_KEY');

    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY is not set in environment variables');
    }
    const fromDate = twoDaysAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch company news: ${response.statusText}`);
    }
    const data = await response.json();
    let result = data;
    if (maxStories && data.length > maxStories) {
      result = data.slice(0, maxStories);
    }

    // Cache the result
    await this.redisService.set(cacheKey, result, CACHE_TTL.NEWS);
    console.log(`Cached news: ${symbol}`);

    return result;
  }

  async getFinancials(symbol: string) {
    const cacheKey = `financials:${symbol}`;

    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for financials: ${symbol}`);
      return cached;
    }

    const apiKey = this.configService.get<string>('ALPHAVANTAGE_API_KEY');

    if (!apiKey) {
      throw new Error(
        'ALPHAVANTAGE_API_KEY is not set in environment variables',
      );
    }
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch financials data: ${response.statusText}`,
      );
    }
    const data = await response.json();

    // Cache the result
    await this.redisService.set(cacheKey, data, CACHE_TTL.FINANCIALS);
    console.log(`Cached financials: ${symbol}`);

    return data;
  }

  async getCombinedStockData(symbol: string) {
    const [profileData, newsData, financialsData] = await Promise.all([
      this.getProfile(symbol),
      this.getCompanyNews(symbol),
      this.getFinancials(symbol),
    ]);

    return {
      profile: profileData,
      news: newsData,
      financials: financialsData,
    };
  }
}
