import { socketService } from './socket';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private consultationId: string | null = null;
  private userId: string | null = null;

  constructor(private config: WebRTCConfig = defaultConfig) {}

  async initialize(consultationId: string, userId: string) {
    console.log('🎥 Inicializando WebRTC para consulta:', consultationId);
    this.consultationId = consultationId;
    this.userId = userId;

    try {
      // Obter mídia local (câmera e microfone)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('✅ Mídia local obtida:', this.localStream.getTracks().map(t => t.kind));

      // Criar peer connection
      this.createPeerConnection();

      // Configurar listeners do Socket.IO para sinalização
      this.setupSignalingListeners();

      return this.localStream;
    } catch (error) {
      console.error('❌ Erro ao obter mídia:', error);
      throw new Error('Não foi possível acessar câmera/microfone. Verifique as permissões.');
    }
  }

  private createPeerConnection() {
    console.log('🔗 Criando PeerConnection');
    
    this.peerConnection = new RTCPeerConnection(this.config);
    this.remoteStream = new MediaStream();

    // Adicionar tracks locais ao peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log('➕ Adicionando track local:', track.kind);
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Receber tracks remotos
    this.peerConnection.ontrack = (event) => {
      console.log('📥 Recebendo track remoto:', event.track.kind);
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
    };

    // ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Enviando ICE candidate');
        socketService.getSocket()?.emit('webrtc-ice-candidate', {
          consultationId: this.consultationId,
          candidate: event.candidate,
          userId: this.userId,
        });
      }
    };

    // Connection state
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection?.connectionState);
    };

    // ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
    };
  }

  private setupSignalingListeners() {
    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ Socket não disponível');
      return;
    }

    // Receber offer
    socket.on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit; userId: string }) => {
      console.log('📨 Recebendo offer de:', data.userId);
      
      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      // Verificar se podemos aceitar offer
      const state = this.peerConnection?.signalingState;
      if (state !== 'stable' && state !== 'have-local-offer') {
        console.log('⏭️ Ignorando offer - estado atual:', state);
        return;
      }

      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('✅ Remote description (offer) setada');

        // Criar answer
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        console.log('✅ Local description (answer) setada');

        // Enviar answer
        socket.emit('webrtc-answer', {
          consultationId: this.consultationId,
          answer,
          userId: this.userId,
        });
        console.log('📤 Answer enviada');
      } catch (error) {
        console.error('❌ Erro ao processar offer:', error);
      }
    });

    // Receber answer
    socket.on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit; userId: string }) => {
      console.log('📨 Recebendo answer de:', data.userId);
      
      // Verificar se estamos esperando um answer
      const state = this.peerConnection?.signalingState;
      if (state !== 'have-local-offer') {
        console.log('⏭️ Ignorando answer - estado atual:', state, '(esperado: have-local-offer)');
        return;
      }
      
      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log('✅ Remote description (answer) setada');
      } catch (error) {
        console.error('❌ Erro ao processar answer:', error);
      }
    });

    // Receber ICE candidate
    socket.on('webrtc-ice-candidate', async (data: { candidate: RTCIceCandidateInit; userId: string }) => {
      console.log('🧊 Recebendo ICE candidate de:', data.userId);
      
      try {
        if (this.peerConnection && data.candidate) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('✅ ICE candidate adicionado');
        }
      } catch (error) {
        console.error('❌ Erro ao adicionar ICE candidate:', error);
      }
    });
  }

  async createOffer() {
    console.log('📤 Criando offer');
    
    if (!this.peerConnection) {
      throw new Error('PeerConnection não inicializado');
    }

    // Verificar estado antes de criar offer
    const state = this.peerConnection.signalingState;
    if (state !== 'stable') {
      console.log('⏭️ Pulando offer - estado atual:', state);
      return;
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);
      console.log('✅ Local description (offer) setada');

      // Enviar offer via Socket.IO
      socketService.getSocket()?.emit('webrtc-offer', {
        consultationId: this.consultationId,
        offer,
        userId: this.userId,
      });
      console.log('📤 Offer enviada');
    } catch (error) {
      console.error('❌ Erro ao criar offer:', error);
      throw error;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
        console.log('📹 Vídeo:', enabled ? 'ativado' : 'desativado');
      });
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
        console.log('🎤 Áudio:', enabled ? 'ativado' : 'desativado');
      });
    }
  }

  switchCamera() {
    // Implementar troca de câmera (frontal/traseira) se necessário
    console.log('🔄 Trocar câmera (não implementado)');
  }

  async cleanup() {
    console.log('🧹 Limpando WebRTC');

    // Parar tracks locais
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('⏹️ Track parado:', track.kind);
      });
      this.localStream = null;
    }

    // Fechar peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('🔌 PeerConnection fechado');
    }

    // Remover listeners
    const socket = socketService.getSocket();
    if (socket) {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      console.log('🔇 Listeners removidos');
    }

    this.remoteStream = null;
    this.consultationId = null;
    this.userId = null;
  }
}

// Singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;

