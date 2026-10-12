import { supabase } from './supabase';

export const chatService = {
  async getChats() {
    return await supabase
      .from('chats')
      .select(`
        *,
        property:properties(id, title, city, images, price),
        buyer:users!chats_buyer_id_fkey(id, full_name, phone_number, profile_picture_url),
        seller:users!chats_seller_id_fkey(id, full_name, phone_number, profile_picture_url)
      `)
      .order('created_at', { ascending: false });
  },

  // Chats are private: the database only shows this panel the conversations
  // a participant has reported. These are those reports.
  async getChatReports() {
    return await supabase
      .from('chat_reports')
      .select('id, chat_id, reason, status, created_at')
      .order('created_at', { ascending: false });
  },

  // A conversation opened from a lead uses the enquiry itself as the chat,
  // so it has no row in `chats`. These are loaded in the same shape.
  async getEnquiryChats(enquiryIds) {
    if (!enquiryIds || enquiryIds.length === 0) return { data: [], error: null };
    return await supabase
      .from('enquiries')
      .select(`
        id, property_id, buyer_id, seller_id, created_at,
        property:properties(id, title, city, images, price),
        buyer:users!enquiries_buyer_id_fkey(id, full_name, phone_number, profile_picture_url),
        seller:users!enquiries_seller_id_fkey(id, full_name, phone_number, profile_picture_url)
      `)
      .in('id', enquiryIds);
  },

  async getMessages(chatId) {
    return await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
  },

  subscribeToMessages(chatId, onInsertCallback) {
    return supabase
      .channel(`chat_messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        onInsertCallback
      )
      .subscribe();
  },

  removeChannel(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
