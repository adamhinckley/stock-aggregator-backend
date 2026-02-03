import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiDataModule } from './apiData/apiData.module';
import { SupabaseModule } from './supabase/supabse.modiule';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot(), SupabaseModule, ApiDataModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
