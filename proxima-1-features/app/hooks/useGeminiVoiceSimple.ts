import { useEffect, useRef, useState, useCallback } from 'react';

interface UseGeminiVoiceConfig {
  wsEndpoint?: string;
  onConnectionChange?: (connected: boolean) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

// Simpler implementation focused on getting audio working
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
  const [voiceActivity, setVoiceActivity] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Simple audio playback queue
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Play audio from base64
  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert PCM to audio buffer (assuming 24kHz mono PCM16)
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }
      
      // Create audio buffer
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      // Play the buffer
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        isPlayingRef.current = false;
        // Play next in queue if any
        if (audioQueueRef.current.length > 0) {
          const next = audioQueueRef.current.shift();
          if (next) playAudio(next);
        } else {
          setStatus('listening');
          onStatusChange?.('listening');
        }
      };
      
      isPlayingRef.current = true;
      setStatus('speaking');
      onStatusChange?.('speaking');
      source.start();
      
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
    }
  }, [onStatusChange]);

  // Process incoming audio
  const processAudioResponse = useCallback((base64Audio: string) => {
    if (isPlayingRef.current) {
      // Queue if already playing
      audioQueueRef.current.push(base64Audio);
    } else {
      // Play immediately
      playAudio(base64Audio);
    }
  }, [playAudio]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    console.log('Connecting to:', wsEndpoint);

    try {
      // Get microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Create WebSocket connection
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnectionChange?.(true);
        
        // Send start command
        ws.send(JSON.stringify({ type: 'control', action: 'start' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message type:', message.type);
          
          switch (message.type) {
            case 'audio':
              if (message.data) {
                processAudioResponse(message.data);
              }
              break;
              
            case 'status':
              console.log('Status:', message.status);
              if (message.status === 'ready') {
                setStatus('listening');
                onStatusChange?.('listening');
                startRecording();
                
                // Send initial greeting to trigger Mei's introduction
                setTimeout(() => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'text',
                      text: 'Hello Mei, please introduce yourself to the patient.'
                    }));
                  }
                }, 500);
              }
              break;
              
            case 'error':
              console.error('Server error:', message.error);
              onError?.(message.error);
              break;
          }
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onConnectionChange?.(false);
        stopRecording();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('Connection error');
      };
    } catch (error: any) {
      console.error('Connection failed:', error);
      onError?.(error.message);
    }
  }, [wsEndpoint, onConnectionChange, onStatusChange, onError, processAudioResponse]);

  // Start recording audio
  const startRecording = useCallback(() => {
    if (!streamRef.current || mediaRecorderRef.current) return;

    try {
      // Use simple audio recording with MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Send audio chunks every 250ms
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          // For now, send as blob - the server needs to handle conversion
          const base64 = await blobToBase64(event.data);
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: base64,
            mimeType: 'audio/webm',
          }));
        }
      };
      
      mediaRecorder.start(250); // Send chunks every 250ms
      console.log('Started recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [isMuted]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  // Helper to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Disconnect
  const disconnect = useCallback(() => {
    stopRecording();
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'control', action: 'stop' }));
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsConnected(false);
    setStatus('idle');
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, [stopRecording]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Simulate voice activity for visual feedback
  useEffect(() => {
    if (isConnected && status === 'listening') {
      const interval = setInterval(() => {
        // Random activity between 0 and 0.3 when listening
        setVoiceActivity(Math.random() * 0.3);
      }, 100);
      return () => clearInterval(interval);
    } else if (status === 'speaking') {
      const interval = setInterval(() => {
        // Higher activity when speaking
        setVoiceActivity(0.5 + Math.random() * 0.5);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVoiceActivity(0);
    }
  }, [isConnected, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isMuted,
    status,
    voiceActivity,
    signalQuality: 'good' as const,
    connect,
    disconnect,
    toggleMute,
  };
}