import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface QueueState {
  isConnected: boolean;
  specialty: string | null;
  queueLength: number;
  inProgress: number;
  onlineProfessionals: number;
  consultations: any[];
  myConsultations: any[];
}

interface QueueHook {
  state: QueueState;
  socket: Socket | null;
  joinSpecialtyQueue: (specialty: string) => void;
  leaveSpecialtyQueue: () => void;
  assumeConsultation: (consultationId: string) => void;
  finishConsultation: (consultationId: string, notes?: string) => void;
  refreshQueue: () => void;
}

export const useQueue = (): QueueHook => {
  const [state, setState] = useState<QueueState>({
    isConnected: false,
    specialty: null,
    queueLength: 0,
    inProgress: 0,
    onlineProfessionals: 0,
    consultations: [],
    myConsultations: [],
  });

  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(`${import.meta.env.VITE_API_URL}/queue`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to queue gateway');
      setState(prev => ({ ...prev, isConnected: true }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from queue gateway');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('error', error => {
      console.error('Queue socket error:', error);
    });

    // Queue events
    socket.on('queue-status', data => {
      console.log('Queue status updated:', data);
      setState(prev => ({
        ...prev,
        queueLength: data.queueLength,
        inProgress: data.inProgress,
        onlineProfessionals: data.onlineProfessionals,
        consultations: data.consultations || [],
      }));
    });

    socket.on('queue-updated', data => {
      console.log('Queue updated:', data);
      setState(prev => ({
        ...prev,
        queueLength: data.queueLength,
        inProgress: data.inProgress,
        onlineProfessionals: data.onlineProfessionals,
        consultations: data.consultations || [],
      }));
    });

    // Consultation events
    socket.on('consultation-assumed', data => {
      console.log('Consultation assumed:', data);
      setState(prev => ({
        ...prev,
        consultations: prev.consultations.filter(
          c => c.id !== data.consultationId
        ),
        myConsultations: [...prev.myConsultations, data.consultation],
      }));
    });

    socket.on('consultation-started', data => {
      console.log('Consultation started:', data);
      setState(prev => ({
        ...prev,
        consultations: prev.consultations.map(c =>
          c.id === data.consultationId
            ? {
                ...c,
                status: 'em_atendimento',
                professionalId: data.professionalId,
              }
            : c
        ),
      }));
    });

    socket.on('consultation-finished', data => {
      console.log('Consultation finished:', data);
      setState(prev => ({
        ...prev,
        myConsultations: prev.myConsultations.filter(
          c => c.id !== data.consultationId
        ),
      }));
    });

    // User events
    socket.on('user-joined-queue', data => {
      console.log('User joined queue:', data);
    });

    socket.on('user-left-queue', data => {
      console.log('User left queue:', data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join specialty queue
  const joinSpecialtyQueue = useCallback((specialty: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-specialty-queue', { specialty });
      setState(prev => ({ ...prev, specialty }));
    }
  }, []);

  // Leave specialty queue
  const leaveSpecialtyQueue = useCallback(() => {
    if (socketRef.current && state.specialty) {
      socketRef.current.emit('leave-specialty-queue', {
        specialty: state.specialty,
      });
      setState(prev => ({ ...prev, specialty: null }));
    }
  }, [state.specialty]);

  // Assume consultation
  const assumeConsultation = useCallback((consultationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('assume-consultation', { consultationId });
    }
  }, []);

  // Finish consultation
  const finishConsultation = useCallback(
    (consultationId: string, notes?: string) => {
      if (socketRef.current) {
        socketRef.current.emit('finish-consultation', {
          consultationId,
          notes,
        });
      }
    },
    []
  );

  // Refresh queue
  const refreshQueue = useCallback(() => {
    if (socketRef.current && state.specialty) {
      socketRef.current.emit('request-queue-update', {
        specialty: state.specialty,
      });
    }
  }, [state.specialty]);

  return {
    state,
    socket: socketRef.current,
    joinSpecialtyQueue,
    leaveSpecialtyQueue,
    assumeConsultation,
    finishConsultation,
    refreshQueue,
  };
};
