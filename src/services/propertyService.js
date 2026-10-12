import { supabase } from './supabase';

/**
 * Status as the review workflow sees it. The `property_status` enum has no
 * "rejected" value, so a rejected listing is stored as `pending` with a
 * rejection reason.
 */
export const getReviewStatus = (property) => {
  if (!property) return 'pending';
  if (property.status === 'pending' && property.rejection_reason) return 'rejected';
  return property.status || 'pending';
};

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

  /**
   * Moves a listing to `newStatus`.
   *
   * The database has no "rejected" status: a rejected listing is `pending`
   * with a rejection reason. So the reason and remarks are always written,
   * and cleared for an approval or a suspension, otherwise a stale reason
   * would keep marking the listing as rejected.
   *
   * `expectedStatus` guards against two admins acting on the same listing:
   * the update only applies if the listing is still in the status the admin
   * was looking at.
   */
  async updatePropertyStatus(id, newStatus, rejectionReason = null, rejectionRemarks = null, expectedStatus = null) {
    const updateData = {
      status: newStatus,
      rejection_reason: rejectionReason || null,
      rejection_remarks: rejectionRemarks || null
    };
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
    let query = supabase
      .from('properties')
      .update(updateData)
      .eq('id', id);
    if (expectedStatus) {
      query = query.eq('status', expectedStatus);
    }
    const { data, error } = await query.select('id');
    if (error) return { data, error };
    if (!data || data.length === 0) {
      return {
        data,
        error: new Error('This listing was changed by someone else or you no longer have access. Reload the page and try again.')
      };
    }
    return { data, error: null };
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
