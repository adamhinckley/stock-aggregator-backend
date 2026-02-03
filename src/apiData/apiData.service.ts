import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const today = new Date();
const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

@Injectable()
export class ApiDataService {
  constructor(private configService: ConfigService) {}

  async getProfile(symbol: string) {
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
    return data;
  }

  async getCompanyNews(symbol: string, maxStories?: number) {
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
    if (maxStories && data.length > maxStories) {
      return data.slice(0, maxStories);
    }
    return data;
  }

  async getFinancials(symbol: string) {
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
