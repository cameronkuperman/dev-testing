import { useEffect, useRef, useState, useCallback } from 'react';
import { useProductionVoiceDetection } from './useProductionVoiceDetection';

interface UseGeminiVoiceConfig {
  wsEndpoint?: string;
  onConnectionChange?: (connected: boolean) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

interface AudioProcessor {
  context: AudioContext;
  source?: MediaStreamAudioSourceNode;
  processor?: ScriptProcessorNode;
  gainNode: GainNode;
  stream?: MediaStream;
}

export function useGeminiVoice(config: UseGeminiVoiceConfig = {}) {
  const {
    wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8080',
    onConnectionChange,
    onStatusChange,
    onError,
    autoConnect = false,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  // Use production voice detection for UI feedback
  const voiceDetection = useProductionVoiceDetection({
    onSpeechStart: () => {
      if (status === 'listening') {
        setStatus('thinking');
        onStatusChange?.('thinking');
      }
    },
    onSpeechEnd: () => {
      if (status === 'thinking') {
        setStatus('listening');
        onStatusChange?.('listening');
      }
    },
  });

  // Initialize audio context and processors
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      const context = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      const source = context.createMediaStreamSource(stream);
      const gainNode = context.createGain();
      
      // Create processor for 48kHz → 16kHz downsampling
      const processor = context.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isMuted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Downsample from 48kHz to 16kHz (3:1 ratio)
        const downsampledLength = Math.floor(inputData.length / 3);
        const downsampled = new Float32Array(downsampledLength);
        
        for (let i = 0; i < downsampledLength; i++) {
          downsampled[i] = inputData[i * 3];
        }
        
        // Convert to 16-bit PCM
        const pcm16 = new Int16Array(downsampledLength);
        for (let i = 0; i < downsampledLength; i++) {
          const s = Math.max(-1, Math.min(1, downsampled[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send audio chunk
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
        wsRef.current.send(JSON.stringify({
          type: 'audio',
          data: base64,
        }));
      };

      source.connect(processor);
      processor.connect(gainNode);
      gainNode.connect(context.destination);
      gainNode.gain.value = 0; // Mute local feedback

      audioProcessorRef.current = {
        context,
        source,
        processor,
        gainNode,
        stream,
      };

      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      onError?.('Failed to access microphone');
      return false;
    }
  }, [isMuted, onError]);

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    if (!audioProcessorRef.current) return;

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift()!;
    
    try {
      // Convert ArrayBuffer to Float32Array (24kHz PCM)
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }
      
      // Create audio buffer (24kHz mono)
      const audioBuffer = audioProcessorRef.current.context.createBuffer(
        1, 
        float32Array.length, 
        24000
      );
      audioBuffer.getChannelData(0).set(float32Array);
      
      // Play the buffer
      const source = audioProcessorRef.current.context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioProcessorRef.current.context.destination);
      
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio(); // Play next in queue
      };
      
      source.start();
      
      setStatus('speaking');
      onStatusChange?.('speaking');
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
    }
  }, [onStatusChange]);

  // WebSocket connection management
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    console.log('useGeminiVoice: Starting connection to', wsEndpoint);

    // Initialize audio first
    const audioReady = await initializeAudio();
    if (!audioReady) {
      console.error('useGeminiVoice: Audio initialization failed');
      return;
    }
    
    console.log('useGeminiVoice: Audio initialized, connecting WebSocket...');

    try {
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to voice proxy');
        setIsConnected(true);
        onConnectionChange?.(true);
        reconnectAttemptsRef.current = 0;
        
        // Send start command
        ws.send(JSON.stringify({ type: 'control', action: 'start' }));
        
        // Start voice detection for UI
        voiceDetection.startListening();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'audio':
              if (message.data) {
                const audioData = Uint8Array.from(atob(message.data), c => c.charCodeAt(0));
                audioQueueRef.current.push(audioData.buffer);
                playNextAudio();
              }
              break;
              
            case 'status':
              console.log('Status:', message.status);
              if (message.status === 'ready') {
                setStatus('listening');
                onStatusChange?.('listening');
              }
              break;
              
            case 'error':
              console.error('Voice error:', message.error);
              onError?.(message.error);
              break;
          }
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from voice proxy');
        setIsConnected(false);
        onConnectionChange?.(false);
        voiceDetection.stopListening();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 1000 * reconnectAttemptsRef.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('Connection error');
      };
    } catch (error) {
      console.error('Connection failed:', error);
      onError?.('Failed to connect');
    }
  }, [wsEndpoint, onConnectionChange, onStatusChange, onError, initializeAudio, voiceDetection, playNextAudio]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'control', action: 'stop' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioProcessorRef.current) {
      audioProcessorRef.current.stream?.getTracks().forEach(track => track.stop());
      audioProcessorRef.current.context.close();
      audioProcessorRef.current = null;
    }
    
    voiceDetection.stopListening();
    setIsConnected(false);
    setStatus('idle');
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, [voiceDetection]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isMuted,
    status,
    voiceActivity: voiceDetection.voiceActivity,
    signalQuality: voiceDetection.signalQuality,
    connect,
    disconnect,
    toggleMute,
  };
}