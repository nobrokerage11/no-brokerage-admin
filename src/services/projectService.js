import { supabase } from './supabase';

export const projectService = {
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createProject: async (projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();
    return { data, error };
  },

  updateProject: async (id, projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select();
    return { data, error };
  },

  deleteProject: async (id) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    return { error };
  }
};
