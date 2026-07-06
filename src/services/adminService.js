import { supabase } from './supabase';

export const adminService = {
  async getAdminProfile(id) {
    return await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
  },

  async updateAdminProfile(id, fullName) {
    return await supabase
      .from('admin_users')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', id);
  },

  async getAdminUsers() {
    return await supabase
      .from('admin_users')
      .select('*');
  },

  async toggleAdminStatus(adminId, nextStatus) {
    return await supabase
      .from('admin_users')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', adminId);
  },

  async createAdminUser(email, password, fullName, role) {
    return await supabase.rpc('create_admin_user', {
      admin_email: email,
      admin_password: password,
      admin_name: fullName,
      admin_role: role
    });
  },

  async updateAdminLastLogin(id) {
    return await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
  }
};
