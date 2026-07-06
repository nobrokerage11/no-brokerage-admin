import { supabase } from './supabase';

export const leadService = {
  async getLeads() {
    return await supabase
      .from('enquiries')
      .select(`
        *,
        property:properties(id, title, city),
        buyer:users!enquiries_buyer_id_fkey(id, full_name, phone_number),
        seller:users!enquiries_seller_id_fkey(id, full_name, phone_number)
      `)
      .order('created_at', { ascending: false });
  },

  async updateLeadStatus(leadId, nextStatus) {
    return await supabase
      .from('enquiries')
      .update({ status: nextStatus })
      .eq('id', leadId);
  }
};
