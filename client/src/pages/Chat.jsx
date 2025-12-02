import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

const Chat = () => {
  const [activeChannel, setActiveChannel] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onSelectChannel={setActiveChannel} activeChannel={activeChannel} />
      <ChatArea channel={activeChannel} />
    </div>
  );
};

export default Chat;
