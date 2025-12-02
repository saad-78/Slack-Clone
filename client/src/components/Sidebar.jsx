import { useState, useEffect } from 'react';
import { FaHashtag, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onSelectChannel, activeChannel }) => {
  const [channels, setChannels] = useState([]);
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const { data } = await api.get('/channels');
    setChannels(data.channels);
  };


  const createChannel = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/channels', { name: newChannelName });
      setChannels([data.channel, ...channels]);
      setNewChannelName('');
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to create channel');
    }
  };

  return (
    <div className="w-64 bg-sidebar text-gray-100 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 font-bold text-lg flex justify-between items-center">
        <span>Team Chat</span>
        <button onClick={logout} className="text-gray-400 hover:text-white">
          <FaSignOutAlt />
        </button>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4 text-gray-400 text-sm uppercase font-semibold">
          <span>Channels</span>
          <button onClick={() => setIsModalOpen(true)} className="hover:text-white">
            <FaPlus />
          </button>
        </div>

        <ul className="space-y-1">
          {channels.map(channel => (
            <li key={channel._id}>
              <button
                onClick={() => onSelectChannel(channel)}
                className={`w-full flex items-center px-2 py-2 rounded ${activeChannel?._id === channel._id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <FaHashtag className="mr-2 text-gray-500" />
                <span className="truncate">{channel.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info */}
      <div className="p-4 bg-gray-900 flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-white mr-2">
          {user?.username[0].toUpperCase()}
        </div>
        <div className="truncate font-medium">{user?.username}</div>
      </div>

      {/* Create Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Create Channel</h3>
            <form onSubmit={createChannel}>
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="# channel-name"
                className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
