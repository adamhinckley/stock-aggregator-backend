import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiDataService } from './apiData.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api-data')
export class ApiDataController {
  constructor(private readonly apiDataService: ApiDataService) {}

  @Get('stock/:symbol')
  @UseGuards(AuthGuard)
  async getStock(
    @Param('symbol') symbol: string,
    @Query('include') include?: string,
    @Query('maxStories') maxStories?: string,
  ) {
    const includes = include?.split(',') || [
      'profile',
      'news',
      'financials',
      'logo',
    ];

    console.log('max', maxStories);

    const [profile, news, financials, nameAndLogo] = await Promise.all([
      includes.includes('profile')
        ? this.apiDataService.getProfile(symbol)
        : null,
      includes.includes('news')
        ? this.apiDataService.getCompanyNews(
            symbol,
            maxStories ? parseInt(maxStories) : undefined,
          )
        : null,
      includes.includes('financials')
        ? this.apiDataService.getFinancials(symbol)
        : null,
      includes.includes('logo')
        ? this.apiDataService.getCompanyNameAndLogo(symbol)
        : null,
    ]);

    return { profile, news, financials, nameAndLogo };
  }
}
