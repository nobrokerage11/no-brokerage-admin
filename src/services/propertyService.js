import { supabase } from './supabase';

export const propertyService = {
  async getProperties() {
    return await supabase
      .from('properties')
      .select(`
        *,
        owner:users!properties_owner_id_fkey(id, full_name, phone_number)
      `);
  },

  async getPropertyById(id) {
    return await supabase
      .from('properties')
      .select('*, owner:users!properties_owner_id_fkey(*), property_reels(*)')
      .eq('id', id)
      .maybeSingle();
  },

  async updatePropertyStatus(id, newStatus, rejectionReason = null, rejectionRemarks = null) {
    const updateData = { status: newStatus };
    if (rejectionReason !== null) {
      updateData.rejection_reason = rejectionReason;
    }
    if (rejectionRemarks !== null) {
      updateData.rejection_remarks = rejectionRemarks;
    }
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
    return await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id);
  },

  async insertStatusHistory(propertyId, adminId, adminName, oldStatus, newStatus, reason = null, remarks = null) {
    const historyData = {
      property_id: propertyId,
      admin_id: adminId,
      admin_name: adminName,
      old_status: oldStatus,
      new_status: newStatus
    };
    if (reason !== null) {
      historyData.reason = reason;
    }
    if (remarks !== null) {
      historyData.remarks = remarks;
    }
    return await supabase
      .from('property_status_history')
      .insert(historyData);
  },

  async togglePropertyFeatured(id, nextFeatured) {
    return await supabase
      .from('properties')
      .update({ is_featured: nextFeatured })
      .eq('id', id);
  },

  async deleteProperty(id) {
    return await supabase
      .from('properties')
      .delete()
      .eq('id', id);
  },

  async getPropertyStatusHistory(propertyId) {
    return await supabase
      .from('property_status_history')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
  },

  async getPropertyLeads(propertyId) {
    return await supabase
      .from('enquiries')
      .select('*, buyer:users!enquiries_buyer_id_fkey(*)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
  }
};
