import { supabase } from './supabase';

export const userService = {
  async getUsers() {
    return await supabase
      .from('users')
      .select('*');
  },

  async toggleUserStatus(userId, nextStatus) {
    return await supabase
      .from('users')
      .update({ status: nextStatus })
      .eq('id', userId);
  },

  async deleteUser(userId) {
    return await supabase
      .from('users')
      .delete()
      .eq('id', userId);
  }
};
