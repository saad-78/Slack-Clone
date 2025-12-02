import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api';
import moment from 'moment';
import { FaPaperPlane } from 'react-icons/fa';

const ChatArea = ({ channel }) => {
  const { user } = useAuth();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const messagesEndRef = useRef(null);
  const topSentinelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch initial messages when channel changes
  useEffect(() => {
    if (!channel) return;
    const fetchMessages = async () => {
      const { data } = await api.get(`/messages/${channel._id}`, {
        params: { limit: 30 },
      });
      setMessages(data.messages);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
      scrollToBottom();
    };
    fetchMessages();
  }, [channel?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !channel) return;

    // Join channel room
    socket.emit('channel:join', channel._id);

    const handleNewMessage = (msg) => {
      if (msg.channel === channel._id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    const handlePresence = (online) => {
      setOnlineUsers(online);
    };

    const handleTyping = ({ userId }) => {
      if (userId === user.id || userId === user._id) return;
      setTypingUser(userId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    };

    const handleTypingStop = ({ userId }) => {
      if (userId === typingUser) setTypingUser(null);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('presence:update', handlePresence);
    socket.on('typing:user', handleTyping);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.emit('channel:leave', channel._id);
      socket.off('message:new', handleNewMessage);
      socket.off('presence:update', handlePresence);
      socket.off('typing:user', handleTyping);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, channel?._id, user?.id, typingUser]);

  // Infinite scroll for older messages
  useEffect(() => {
    if (!hasMore || !topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && cursor) {
          const { data } = await api.get(`/messages/${channel._id}`, {
            params: { limit: 30, before: cursor },
          });
          setMessages((prev) => [...data.messages, ...prev]);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      },
      { threshold: 1 }
    );

    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, cursor, channel?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !channel) return;

    if (value.trim().length > 0) {
      socket.emit('typing:start', channel._id);
    } else {
      socket.emit('typing:stop', channel._id);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !channel) return;

    const content = newMessage.trim();

    socket.emit(
      'message:send',
      { channelId: channel._id, content },
      (ack) => {
        if (!ack.success) {
          console.error('Message send failed:', ack.message);
        }
      }
    );

    setNewMessage('');
    socket.emit('typing:stop', channel._id);
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        Select a channel to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm bg-white z-10">
        <div>
          <h2 className="font-bold text-lg text-gray-800">#{channel.name}</h2>
          <p className="text-xs text-gray-500">
            {channel.description || 'No description'}
          </p>
        </div>
        <div className="text-xs text-gray-500 flex flex-col items-end">
          <span>{channel.members?.length} members</span>
          <span className="text-green-500">
            {onlineUsers.length} online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <div ref={topSentinelRef} />

        {messages.map((msg, index) => {
          const senderId = msg.sender._id || msg.sender.id;
          const isMe =
            senderId === user.id || senderId === user._id;
          const showAvatar =
            index === 0 ||
            (messages[index - 1].sender._id ||
              messages[index - 1].sender.id) !== senderId;

          return (
            <div
              key={msg._id || index}
              className={`flex ${
                isMe ? 'justify-end' : 'justify-start'
              } group`}
            >
              {!isMe && (
                <div
                  className={`w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-bold mr-2 ${
                    showAvatar ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {msg.sender.username?.[0]?.toUpperCase()}
                </div>
              )}

              <div className="max-w-[70%]">
                {!isMe && showAvatar && (
                  <div className="text-xs text-gray-500 ml-1 mb-1">
                    {msg.sender.username}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm break-words ${
                    isMe
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] text-gray-400 mt-1 ${
                    isMe ? 'text-right' : 'text-left'
                  }`}
                >
                  {moment(msg.timestamp).format('h:mm A')}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUser && (
          <div className="text-xs text-gray-500 italic">
            Someone is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={sendMessage}
          className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-transparent focus:outline-none text-sm py-2"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`ml-2 p-2 rounded-full transition-colors ${
              newMessage.trim()
                ? 'text-primary hover:bg-gray-200'
                : 'text-gray-400 cursor-default'
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
