import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext.js';

export function useSocketEvent<T>(event: string, handler: (data: T) => void) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event, handler as (...args: unknown[]) => void);
    };
  }, [socket, event, handler]);
}

export function useJoinRoom(room: string) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.emit(room.startsWith('visit:') ? 'join-visit' : 'join-admin', room.replace('visit:', ''));
    return () => {
      if (room.startsWith('visit:')) {
        socket.emit('leave-visit', room.replace('visit:', ''));
      }
    };
  }, [socket, room]);
}
