import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse | any) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
      });

      socket.on('typing', (data: { roomId: string, doctorId: string, isTyping: boolean }) => {
        socket.to(data.roomId).emit('user_typing', data);
      });

      socket.on('send_message', (data: any) => {
        io.to(data.roomId).emit('receive_message', data);
      });
      
      socket.on('mark_read', (data: { roomId: string, messageId: string }) => {
        io.to(data.roomId).emit('message_read', data);
      });

      socket.on('user_online', (doctorId: string) => {
        socket.broadcast.emit('online_status', { doctorId, isOnline: true });
      });

      // WebRTC Signaling
      socket.on('call_user', (data: { userToCall: string, signalData: any, from: string, name: string }) => {
        io.to(data.userToCall).emit('call_user', { signal: data.signalData, from: data.from, name: data.name });
      });

      socket.on('answer_call', (data: { to: string, signal: any }) => {
        io.to(data.to).emit('call_accepted', data.signal);
      });
      
      socket.on('end_call', (data: { to: string }) => {
        io.to(data.to).emit('call_ended');
      });

      // Conference Mesh Signaling
      socket.on('join_conference', (roomId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit('user_joined_conference', socket.id);
      });

      socket.on('send_conference_signal', (payload: { userToSignal: string, callerID: string, signal: any }) => {
        io.to(payload.userToSignal).emit('conference_user_joined', { signal: payload.signal, callerID: payload.callerID });
      });

      socket.on('return_conference_signal', (payload: { signal: any, callerID: string }) => {
        io.to(payload.callerID).emit('receiving_returned_signal', { signal: payload.signal, id: socket.id });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        socket.broadcast.emit('call_ended'); // generic catch-all for disconnects during calls
      });
    });
  }
  res.end();
}
