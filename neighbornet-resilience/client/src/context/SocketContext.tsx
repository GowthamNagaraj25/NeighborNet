import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token && user) {
      const s = initSocket(token);
      setSocket(s);

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));

      // Critical post alert
      s.on('criticalPostCreated', (data) => {
        toast.custom(
          (t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-red-600 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
              <div className="flex-1">
                <p className="text-sm font-bold">🚨 Critical Help Needed Nearby!</p>
                <p className="mt-1 text-sm">{data.message}</p>
              </div>
            </div>
          ),
          { duration: 8000 }
        );
      });

      // Post status update
      s.on('postStatusUpdated', (data) => {
        toast.success(`Post "${data.title}" status updated to ${data.status}`);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
