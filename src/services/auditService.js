import { supabase } from './supabase';

export const auditService = {
  async getAuditLogs(limit = null) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  },

  async logAction(adminId, adminName, action, target, details) {
    try {
      await supabase.from('audit_logs').insert({
        admin_id: adminId,
        admin_name: adminName,
        action,
        target,
        details
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  }
};
