import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const s = io('https://slack-clone-0wm0.onrender.com', {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Socket connected', s.id);
    });

    s.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
