import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

export const useChatsController = () => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const channelRef = useRef(null);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const [{ data: chatRows, error }, { data: reports }] = await Promise.all([
        chatService.getChats(),
        chatService.getChatReports()
      ]);
      // Reported conversations that were opened from a lead.
      const knownIds = new Set((chatRows || []).map((chat) => chat.id));
      const enquiryChatIds = [...new Set((reports || []).map((report) => report.chat_id))]
        .filter((chatId) => !knownIds.has(chatId));
      const { data: enquiryChats } = await chatService.getEnquiryChats(enquiryChatIds);

      // Attach each chat's report reasons so the reviewer sees why it is here.
      const data = [...(chatRows || []), ...(enquiryChats || [])].map((chat) => ({
        ...chat,
        reports: (reports || []).filter((report) => report.chat_id === chat.id)
      }));
      if (error) throw error;
      setChats(data || []);
      setFilteredChats(data || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Filter chats by search query
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredChats(chats);
      return;
    }
    const q = search.toLowerCase();
    const result = chats.filter(chat => {
      const propertyTitle = (chat.property?.title || '').toLowerCase();
      const propertyCity = (chat.property?.city || '').toLowerCase();
      const buyerName = (chat.buyer?.full_name || '').toLowerCase();
      const sellerName = (chat.seller?.full_name || '').toLowerCase();
      return (
        propertyTitle.includes(q) ||
        propertyCity.includes(q) ||
        buyerName.includes(q) ||
        sellerName.includes(q)
      );
    });
    setFilteredChats(result);
  }, [search, chats]);

  // Fetch messages and subscribe when selectedChat changes
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const { data, error } = await chatService.getMessages(selectedChat.id);
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    // Unsubscribe from existing channel if any
    if (channelRef.current) {
      chatService.removeChannel(channelRef.current);
    }

    const channel = chatService.subscribeToMessages(selectedChat.id, (payload) => {
      const newMsg = payload.new || payload.newRecord;
      if (newMsg) {
        setMessages(prev => {
          // Check if message already exists to prevent duplication
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        chatService.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedChat]);

  return {
    loading,
    chats,
    filteredChats,
    selectedChat,
    setSelectedChat,
    messages,
    messagesLoading,
    search,
    setSearch,
    refetchChats: fetchChats
  };
};
