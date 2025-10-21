import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Users,
  Minimize2,
  Maximize2,
  Settings,
} from 'lucide-react';
import { useVideoCall } from '../hooks/useVideoCall';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface VideoCallProps {
  consultationId: string;
  roomId: string;
  onEndCall: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  consultationId,
  roomId,
  onEndCall,
}) => {
  const {
    state,
    joinRoom,
    leaveRoom,
    toggleCamera,
    toggleMicrophone,
    sendMessage,
    endCall,
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Join room on mount
  useEffect(() => {
    joinRoom(roomId, consultationId).catch(console.error);

    return () => {
      leaveRoom().catch(console.error);
    };
  }, [roomId, consultationId]);

  // Update video elements
  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && state.remoteStream) {
      remoteVideoRef.current.srcObject = state.remoteStream;
    }
  }, [state.remoteStream]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleEndCall = async () => {
    await endCall();
    onEndCall();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isMinimized) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Card className='p-4 bg-white shadow-lg'>
          <div className='flex items-center gap-3'>
            <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-sm font-medium'>
              {state.consultation?.specialty} - {state.participants.length}{' '}
              participantes
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleEndCall}
              className='text-red-500 hover:text-red-700'
            >
              <PhoneOff className='w-4 h-4' />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black z-50 ${isFullscreen ? 'fullscreen' : ''}`}
    >
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-10'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className='font-medium'>
                {state.consultation?.specialty} - Consulta Online
              </span>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <Users className='w-4 h-4' />
              <span>{state.participants.length} participantes</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsMinimized(true)}
              className='text-white hover:bg-white hover:bg-opacity-20'
            >
              <Minimize2 className='w-4 h-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={toggleFullscreen}
              className='text-white hover:bg-white hover:bg-opacity-20'
            >
              {isFullscreen ? (
                <Minimize2 className='w-4 h-4' />
              ) : (
                <Maximize2 className='w-4 h-4' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className='flex h-full pt-16'>
        {/* Main Video Area */}
        <div className='flex-1 relative'>
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className='w-full h-full object-cover'
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Local Video */}
          <div className='absolute bottom-4 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-white'>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover'
              style={{ transform: 'scaleX(-1)' }}
            />

            {!state.localVideoEnabled && (
              <div className='absolute inset-0 bg-gray-800 flex items-center justify-center'>
                <VideoOff className='w-8 h-8 text-gray-400' />
              </div>
            )}
          </div>

          {/* Connection Status */}
          {!state.isConnected && (
            <div className='absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center'>
              <div className='text-white text-center'>
                <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <div>Conectando...</div>
              </div>
            </div>
          )}

          {/* Waiting for participants */}
          {state.isConnected && state.participants.length === 1 && (
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
              <div className='text-white text-center'>
                <Users className='w-16 h-16 mx-auto mb-4 opacity-50' />
                <div className='text-xl font-medium mb-2'>
                  Aguardando participante...
                </div>
                <div className='text-sm opacity-75'>
                  O profissional será conectado em breve
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className='w-80 bg-gray-900 flex flex-col'>
            <div className='p-4 border-b border-gray-700'>
              <div className='flex items-center justify-between'>
                <h3 className='text-white font-medium'>Chat</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowChat(false)}
                  className='text-gray-400 hover:text-white'
                >
                  ×
                </Button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4 space-y-3'>
              {state.messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.type === 'system'
                      ? 'bg-blue-900 bg-opacity-50 text-blue-200'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div className='text-xs opacity-75 mb-1'>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div>{message.message}</div>
                </div>
              ))}
            </div>

            <div className='p-4 border-t border-gray-700'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder='Digite uma mensagem...'
                  className='flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none'
                />
                <Button onClick={handleSendMessage} className='px-3 py-2'>
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4'>
        <div className='flex items-center justify-center gap-4'>
          {/* Camera Toggle */}
          <Button
            onClick={toggleCamera}
            className={`w-12 h-12 rounded-full ${
              state.localVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {state.localVideoEnabled ? (
              <Video className='w-6 h-6 text-white' />
            ) : (
              <VideoOff className='w-6 h-6 text-white' />
            )}
          </Button>

          {/* Microphone Toggle */}
          <Button
            onClick={toggleMicrophone}
            className={`w-12 h-12 rounded-full ${
              state.localAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {state.localAudioEnabled ? (
              <Mic className='w-6 h-6 text-white' />
            ) : (
              <MicOff className='w-6 h-6 text-white' />
            )}
          </Button>

          {/* Chat Toggle */}
          <Button
            onClick={() => setShowChat(!showChat)}
            className={`w-12 h-12 rounded-full ${
              showChat
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <MessageCircle className='w-6 h-6 text-white' />
          </Button>

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            className='w-12 h-12 rounded-full bg-red-600 hover:bg-red-700'
          >
            <PhoneOff className='w-6 h-6 text-white' />
          </Button>
        </div>
      </div>
    </div>
  );
};
