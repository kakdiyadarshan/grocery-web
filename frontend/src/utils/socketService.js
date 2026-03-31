import io from 'socket.io-client';
import { BASE_URL } from '../utils/baseUrl';
import { receiveNotification } from '../redux/slice/notifications.slice';

let socket;

export const initSocketConnection = (dispatch, userId, token) => {
  if (socket && socket.connected) {
    socket.disconnect();
  }

  socket = io(BASE_URL.replace('/api', ''), {
    auth: {
      userId,
      token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to server');
    // Join user-specific room
    socket.emit('joinRoom', { userId });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  // Listen for notification events
  socket.on('notify', (data) => {
    console.log('Received notification:', data);
    dispatch(receiveNotification(data));
  });

  // Listen for other events to debug
  socket.onAny((event, ...args) => {
    console.log('Socket event received:', event, args);
  });

  // Handle socket errors
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};