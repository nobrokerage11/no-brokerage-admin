import { supabase } from './supabase';

export const authService = {
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async updatePassword(newPassword) {
    return await supabase.auth.updateUser({ password: newPassword });
  }
};
