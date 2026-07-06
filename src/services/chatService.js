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
