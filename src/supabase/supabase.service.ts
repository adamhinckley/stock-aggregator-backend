import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async verifyToken(token: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.getUser(token);
      if (error) throw error;
      return data.user;
    } catch (error) {
      return null;
    }
  }

  async signInWithPassword(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword(
        {
          email,
          password,
        },
      );
      if (error) throw error;
      return data.session;
    } catch (error) {
      return null;
    }
  }
}
