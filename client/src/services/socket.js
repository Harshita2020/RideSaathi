import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Initializes and returns a new Socket.IO client connection.
 * @param {string} token - The user JWT to use for authentication
 */
export const connectSocket = (token) => {
  return io(SOCKET_URL, {
    auth: {
      token
    },
    autoConnect: false, // Explicitly connect on request
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  });
};
