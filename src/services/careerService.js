import { supabase } from './supabase';

export const careerService = {
  async getCareers() {
    return await supabase
      .from('careers')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async createCareer(careerData) {
    return await supabase
      .from('careers')
      .insert([careerData])
      .select();
  },

  async updateCareer(id, careerData) {
    return await supabase
      .from('careers')
      .update({ ...careerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
  },

  async deleteCareer(id) {
    return await supabase
      .from('careers')
      .delete()
      .eq('id', id);
  },

  async toggleCareerStatus(id, isActive) {
    return await supabase
      .from('careers')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
  }
};
