import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    console.log('Full body received:', body);
    console.log('Body type:', typeof body);

    const { email, password } = body || {};
    console.log('Email:', email, 'Password:', password);

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const session = await this.supabaseService.signInWithPassword(
      email,
      password,
    );
    if (!session) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { access_token: session.access_token };
  }
}
