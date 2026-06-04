import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateBookingStatusRealtime } from '../store/slices/bookingSlice';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      // Connect to Socket.io server
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const newSocket = io(API_URL.replace('/api', ''), {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket.io connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      // Listen for booking status updates
      newSocket.on('booking-status-updated', (data) => {
        console.log('Booking status updated:', data);
        dispatch(updateBookingStatusRealtime(data));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, dispatch]);

  const joinBookingRoom = (bookingId) => {
    if (socket) {
      socket.emit('join-booking', bookingId);
    }
  };

  const leaveBookingRoom = (bookingId) => {
    if (socket) {
      socket.emit('leave-booking', bookingId);
    }
  };

  const updateLocation = (bookingId, coordinates) => {
    if (socket) {
      socket.emit('update-location', { bookingId, coordinates });
    }
  };

  const value = {
    socket,
    joinBookingRoom,
    leaveBookingRoom,
    updateLocation,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
