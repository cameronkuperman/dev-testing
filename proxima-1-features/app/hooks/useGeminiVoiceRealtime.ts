import { useEffect, useRef, useState, useCallback } from 'react';

interface UseGeminiVoiceConfig {
  wsEndpoint?: string;
  assistantType?: 'mei' | 'varys';
  onConnectionChange?: (connected: boolean) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  onError?: (error: string) => void;
}

export function useGeminiVoice(config: UseGeminiVoiceConfig = {}) {
  const {
    wsEndpoint = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8080',
    assistantType = 'mei',
    onConnectionChange,
    onStatusChange,
    onError,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [voiceActivity, setVoiceActivity] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  
  // Audio playback
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift()!;
    
    try {
      // Convert ArrayBuffer to audio buffer (24kHz PCM16)
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      
      // Apply smoothing to reduce choppiness
      for (let i = 0; i < int16Array.length; i++) {
        const sample = int16Array[i] / 32768;
        // Clamp to prevent distortion
        float32Array[i] = Math.max(-1, Math.min(1, sample));
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      currentSourceRef.current = source;
      
      source.onended = () => {
        isPlayingRef.current = false;
        currentSourceRef.current = null;
        
        if (audioQueueRef.current.length > 0) {
          playNextAudio();
        } else {
          setStatus('listening');
          onStatusChange?.('listening');
        }
      };
      
      setStatus('speaking');
      onStatusChange?.('speaking');
      source.start();
      
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
    }
  }, [onStatusChange]);

  // Stop current audio playback (for interruption)
  const stopCurrentAudio = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
      } catch (e) {
        // Ignore if already stopped
      }
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setStatus('listening');
    onStatusChange?.('listening');
  }, [onStatusChange]);

  // Initialize audio and start streaming
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;

      // Create audio context with optimal settings for voice
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'playback', // Better for smooth playback
        sampleRate: 48000,
      });

      // Load AudioWorklet for PCM processing
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      
      // Create nodes
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm-processor');
      
      // Connect WebSocket with assistant type
      const wsUrl = `${wsEndpoint}?assistant=${assistantType}`;
      console.log('Connecting with assistant:', assistantType, 'URL:', wsUrl);
      const ws = new WebSocket(wsUrl);
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
          
          switch (message.type) {
            case 'audio':
              if (message.data) {
                // Decode base64 to ArrayBuffer
                const binaryString = atob(message.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                
                audioQueueRef.current.push(bytes.buffer);
                playNextAudio();
              }
              break;
              
            case 'status':
              if (message.status === 'ready') {
                setStatus('listening');
                onStatusChange?.('listening');
                startAudioStreaming();
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
        stopAudioStreaming();
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error event triggered', error);
        // Don't call onError for normal connection events
        // Only call it for actual errors that prevent functionality
      };

    } catch (error: any) {
      console.error('Connection failed:', error);
      onError?.(error.message);
    }
  }, [wsEndpoint, assistantType, onConnectionChange, onStatusChange, onError, playNextAudio]);

  // Start audio streaming through worklet
  const startAudioStreaming = useCallback(() => {
    if (!workletNodeRef.current || !sourceRef.current) return;

    // Voice activity detection state
    let consecutiveSilentChunks = 0;
    let consecutiveActiveChunks = 0;
    const SILENCE_THRESHOLD = 400; // Balanced threshold for good interruption
    const ACTIVE_CHUNKS_NEEDED = 2; // Need 2 chunks to avoid false triggers
    
    // Handle PCM chunks from worklet
    workletNodeRef.current.port.onmessage = (event) => {
      if (event.data.type === 'audio' && !isMuted) {
        const pcmData = event.data.data;
        const int16Array = new Int16Array(pcmData);
        
        // Calculate audio energy
        let energy = 0;
        for (let i = 0; i < int16Array.length; i++) {
          energy += Math.abs(int16Array[i]);
        }
        energy = energy / int16Array.length;
        
        // Detect voice activity
        if (energy > SILENCE_THRESHOLD) {
          consecutiveActiveChunks++;
          consecutiveSilentChunks = 0;
          
          // User started speaking - interrupt Mei immediately
          if (consecutiveActiveChunks >= ACTIVE_CHUNKS_NEEDED && status === 'speaking') {
            console.log('User speaking - interrupting Mei');
            stopCurrentAudio();
            // Send a signal to Gemini that user is speaking
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'control',
                action: 'user_speaking'
              }));
            }
          }
        } else {
          consecutiveSilentChunks++;
          consecutiveActiveChunks = 0;
        }
        
        // Always send audio to server
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // Simple downsampling by taking every 3rd sample (48kHz -> 16kHz)
          const downsampled = new Int16Array(Math.floor(int16Array.length / 3));
          for (let i = 0; i < downsampled.length; i++) {
            downsampled[i] = int16Array[i * 3];
          }
          
          const base64 = arrayBufferToBase64(downsampled.buffer);
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            data: base64,
          }));
        }
      }
    };

    // Connect audio graph
    sourceRef.current.connect(workletNodeRef.current);
    console.log('Audio streaming started');
  }, [isMuted, status, stopCurrentAudio]);

  // Stop audio streaming
  const stopAudioStreaming = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }, []);

  // Disconnect everything
  const disconnect = useCallback(() => {
    stopAudioStreaming();
    stopCurrentAudio();
    
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
  }, [stopAudioStreaming, stopCurrentAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Simulate voice activity
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        if (status === 'listening') {
          setVoiceActivity(Math.random() * 0.3);
        } else if (status === 'speaking') {
          setVoiceActivity(0.5 + Math.random() * 0.5);
        } else {
          setVoiceActivity(0);
        }
      }, 100);
      return () => clearInterval(interval);
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