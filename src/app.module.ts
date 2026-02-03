import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiDataModule } from './apiData/apiData.module';
import { SupabaseModule } from './supabase/supabse.modiule';

@Module({
  imports: [ConfigModule.forRoot(), SupabaseModule, ApiDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
