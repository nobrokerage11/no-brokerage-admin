import { supabase } from './supabase';

export const notificationService = {
  async getNotifications(limit = 5) {
    return await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async markAsRead(unreadIds) {
    return await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  },

  async sendNotification(userId, title, body) {
    return await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        is_read: false
      });
  },

  subscribeToNotifications(onInsertCallback) {
    return supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, onInsertCallback)
      .subscribe();
  },

  removeChannel(channel) {
    supabase.removeChannel(channel);
  }
};
