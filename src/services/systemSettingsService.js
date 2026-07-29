import { supabase } from './supabase';

export const systemSettingsService = {
  async getSetting(key) {
    return await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();
  },

  async getAllSettings() {
    return await supabase
      .from('system_settings')
      .select('*');
  },

  async updateSetting(key, value) {
    return await supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select();
  }
};
