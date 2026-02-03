import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiDataController } from './apiData.controller';
import { ApiDataService } from './apiData.service';
import { AuthGuard } from '../auth/auth.guard';
import { SupabaseModule } from '../supabase/supabse.modiule';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ConfigModule, SupabaseModule, RedisModule],
  controllers: [ApiDataController],
  providers: [ApiDataService, AuthGuard],
  exports: [ApiDataService],
})
export class ApiDataModule {}
