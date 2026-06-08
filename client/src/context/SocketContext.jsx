import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket } from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && token) {
      // Create and connect the socket instance
      socketInstance = connectSocket(token);
      socketInstance.connect();

      socketInstance.on('connect', () => {
        console.log('Real-time tracking socket connected:', socketInstance.id);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(socketInstance);
    } else {
      // Disconnect and clean up if unauthorized
      setSocket(null);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        console.log('Socket disconnected via cleanup effect');
      }
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
