import { supabase } from './supabase';

export const neighborhoodService = {
  getNeighborhoods: async () => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  createNeighborhood: async (neighborhoodData) => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .insert([neighborhoodData])
      .select();
    return { data, error };
  },

  updateNeighborhood: async (id, neighborhoodData) => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .update(neighborhoodData)
      .eq('id', id)
      .select();
    return { data, error };
  },

  deleteNeighborhood: async (id) => {
    const { error } = await supabase
      .from('neighborhoods')
      .delete()
      .eq('id', id);
    return { error };
  }
};
