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

  // Every write asks for the row back: an update the database refuses
  // changes nothing and reports no error.
  async updateLeadStatus(leadId, nextStatus) {
    const { data, error } = await supabase
      .from('enquiries')
      .update({ status: nextStatus })
      .eq('id', leadId)
      .select('id');
    if (!error && (!data || data.length === 0)) {
      return { data, error: new Error('The enquiry was not updated. Reload the page and try again.') };
    }
    return { data, error };
  },

  async getServiceLeads() {
    return await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async updateServiceLeadStatus(leadId, nextStatus) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status: nextStatus })
      .eq('id', leadId)
      .select('id');
    if (!error && (!data || data.length === 0)) {
      return { data, error: new Error('The lead was not updated. Reload the page and try again.') };
    }
    return { data, error };
  },

  // Staff a lead can be assigned to.
  async getAdmins() {
    return await supabase
      .from('admin_users')
      .select('id, full_name')
      .eq('status', 'Active')
      .order('full_name');
  },

  async assignServiceLead(leadId, adminId) {
    const { data, error } = await supabase
      .from('leads')
      .update({ assigned_to: adminId || null })
      .eq('id', leadId)
      .select('id');
    if (!error && (!data || data.length === 0)) {
      return { data, error: new Error('The lead was not assigned. Reload the page and try again.') };
    }
    return { data, error };
  }
};

// One set of lead statuses for the app, the website and this panel.
// 'accepted' and 'rejected' come from older app builds.
export const ENQUIRY_STATUSES = [
  { value: 'pending', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'visit_scheduled', label: 'Visit scheduled' },
  { value: 'closed', label: 'Closed' },
  { value: 'not_interested', label: 'Not interested' }
];
export const SERVICE_LEAD_STATUSES = ['New', 'Contacted', 'Closed', 'Not interested'];

export const getLeadStatusLabel = (status) => {
  switch ((status || '').toLowerCase()) {
    case '':
    case 'pending':
    case 'new':
      return 'New';
    case 'accepted':
    case 'contacted':
      return 'Contacted';
    case 'visit_scheduled':
      return 'Visit scheduled';
    case 'closed':
      return 'Closed';
    case 'rejected':
    case 'not_interested':
    case 'not interested':
      return 'Not interested';
    default:
      return status;
  }
};

// A lead nobody has acted on for a day needs a follow-up.
export const isStaleLead = (lead) =>
  getLeadStatusLabel(lead.status) === 'New' &&
  Date.now() - new Date(lead.created_at).getTime() > 24 * 60 * 60 * 1000;
