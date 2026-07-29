import { supabase } from './supabase';

export const blogService = {
  async getBlogs() {
    return await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async createBlog(blogData) {
    // Generate slug from title if not provided
    const slug = blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return await supabase
      .from('blogs')
      .insert([{ ...blogData, slug }])
      .select();
  },

  async updateBlog(id, blogData) {
    const slug = blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return await supabase
      .from('blogs')
      .update({ ...blogData, slug, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
  },

  async deleteBlog(id) {
    return await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
  },

  async toggleBlogStatus(id, isPublished) {
    return await supabase
      .from('blogs')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', id);
  }
};
