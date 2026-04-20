import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join_room', userId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinChat = (requestId: string) => {
  const s = getSocket();
  s.emit('join_chat', requestId);
};

export const sendMessage = (data: {
  request_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
}) => {
  const s = getSocket();
  s.emit('send_message', data);
};

export default getSocket;
