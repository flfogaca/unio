import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface VideoCallState {
  isConnected: boolean;
  isInCall: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  participants: Participant[];
  messages: ChatMessage[];
  localVideoEnabled: boolean;
  localAudioEnabled: boolean;
  roomId: string | null;
  consultation: any | null;
}

interface Participant {
  userId: string;
  userRole: string;
  socketId: string;
  name: string;
  joinedAt: string;
}

interface ChatMessage {
  from: string;
  message: string;
  type: 'text' | 'system';
  timestamp: string;
}

interface VideoCallHook {
  state: VideoCallState;
  socket: Socket | null;
  peerConnection: RTCPeerConnection | null;
  joinRoom: (roomId: string, consultationId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  sendMessage: (message: string) => void;
  endCall: () => Promise<void>;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useVideoCall = (): VideoCallHook => {
  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isInCall: false,
    localStream: null,
    remoteStream: null,
    participants: [],
    messages: [],
    localVideoEnabled: true,
    localAudioEnabled: true,
    roomId: null,
    consultation: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${import.meta.env.VITE_API_URL}/video`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to video gateway');
      setState(prev => ({ ...prev, isConnected: true }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from video gateway');
      setState(prev => ({ ...prev, isConnected: false, isInCall: false }));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Room events
    socket.on('room-joined', (data) => {
      console.log('Joined room:', data);
      setState(prev => ({
        ...prev,
        isInCall: true,
        roomId: data.roomId,
        participants: data.participants,
        consultation: data.consultation,
      }));
    });

    socket.on('participants-updated', (participants) => {
      setState(prev => ({ ...prev, participants }));
    });

    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          from: 'system',
          message: 'Usuário entrou na chamada',
          type: 'system',
          timestamp: new Date().toISOString(),
        }],
      }));
    });

    socket.on('user-left', (data) => {
      console.log('User left:', data);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          from: 'system',
          message: 'Usuário saiu da chamada',
          type: 'system',
          timestamp: new Date().toISOString(),
        }],
      }));
    });

    // WebRTC events
    socket.on('webrtc-offer', async (data) => {
      console.log('Received offer:', data);
      await handleReceiveOffer(data.offer);
    });

    socket.on('webrtc-answer', async (data) => {
      console.log('Received answer:', data);
      await handleReceiveAnswer(data.answer);
    });

    socket.on('webrtc-ice-candidate', async (data) => {
      console.log('Received ICE candidate:', data);
      await handleReceiveIceCandidate(data.candidate);
    });

    // Media events
    socket.on('camera-toggled', (data) => {
      console.log('Camera toggled:', data);
      // Update participant state
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.userId === data.userId ? { ...p, videoEnabled: data.enabled } : p
        ),
      }));
    });

    socket.on('microphone-toggled', (data) => {
      console.log('Microphone toggled:', data);
      // Update participant state
      setState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.userId === data.userId ? { ...p, audioEnabled: data.enabled } : p
        ),
      }));
    });

    // Chat events
    socket.on('message-received', (message) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = peerConnection;

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', {
          roomId: state.roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      setState(prev => ({ ...prev, remoteStream: event.streams[0] }));
    };

    return peerConnection;
  }, [state.roomId]);

  // Get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setState(prev => ({ ...prev, localStream: stream }));

      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }, []);

  // Handle WebRTC offer
  const handleReceiveOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      initializePeerConnection();
    }

    await peerConnectionRef.current!.setRemoteDescription(offer);
    const answer = await peerConnectionRef.current!.createAnswer();
    await peerConnectionRef.current!.setLocalDescription(answer);

    socketRef.current?.emit('webrtc-answer', {
      roomId: state.roomId,
      answer,
    });
  };

  // Handle WebRTC answer
  const handleReceiveAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(answer);
    }
  };

  // Handle ICE candidate
  const handleReceiveIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate);
    }
  };

  // Join room
  const joinRoom = async (roomId: string, consultationId: string) => {
    try {
      // Initialize peer connection
      initializePeerConnection();

      // Get user media
      await getUserMedia();

      // Join room via socket
      socketRef.current?.emit('join-room', { roomId, consultationId });

    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  // Leave room
  const leaveRoom = async () => {
    try {
      if (state.roomId) {
        socketRef.current?.emit('leave-room', { roomId: state.roomId });
      }

      // Stop local stream
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isInCall: false,
        localStream: null,
        remoteStream: null,
        participants: [],
        roomId: null,
        consultation: null,
      }));

    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, localVideoEnabled: videoTrack.enabled }));
        
        socketRef.current?.emit('toggle-camera', {
          roomId: state.roomId,
          enabled: videoTrack.enabled,
        });
      }
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, localAudioEnabled: audioTrack.enabled }));
        
        socketRef.current?.emit('toggle-microphone', {
          roomId: state.roomId,
          enabled: audioTrack.enabled,
        });
      }
    }
  };

  // Send message
  const sendMessage = (message: string) => {
    if (socketRef.current && state.roomId) {
      socketRef.current.emit('send-message', {
        roomId: state.roomId,
        message,
        type: 'text',
      });
    }
  };

  // End call
  const endCall = async () => {
    await leaveRoom();
  };

  return {
    state,
    socket: socketRef.current,
    peerConnection: peerConnectionRef.current,
    joinRoom,
    leaveRoom,
    toggleCamera,
    toggleMicrophone,
    sendMessage,
    endCall,
  };
};
