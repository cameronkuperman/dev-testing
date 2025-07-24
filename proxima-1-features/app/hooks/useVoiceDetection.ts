import { useEffect, useRef, useState, useCallback } from 'react';

interface VoiceDetectionConfig {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onAmplitudeChange?: (amplitude: number) => void;
  simulationMode?: boolean;
}

export function useVoiceDetection(config: VoiceDetectionConfig = {}) {
  const [isListening, setIsListening] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Speech detection thresholds
  const SPEECH_THRESHOLD = 0.02;
  const SILENCE_DURATION = 1000; // ms
  const lastSpeechRef = useRef<number>(Date.now());
  const isSpeakingRef = useRef(false);
  
  // Simulation state
  const simulationIntervalRef = useRef<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const updateAmplitude = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate amplitude (RMS)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += (dataArray[i] / 255) ** 2;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    setAmplitude(rms);
    config.onAmplitudeChange?.(rms);
    
    // Speech detection
    if (rms > SPEECH_THRESHOLD) {
      lastSpeechRef.current = Date.now();
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        setIsUserSpeaking(true);
        config.onSpeechStart?.();
      }
    } else if (isSpeakingRef.current && Date.now() - lastSpeechRef.current > SILENCE_DURATION) {
      isSpeakingRef.current = false;
      setIsUserSpeaking(false);
      config.onSpeechEnd?.();
    }
    
    animationFrameRef.current = requestAnimationFrame(updateAmplitude);
  }, [config]);

  const startListening = useCallback(async () => {
    try {
      // Prevent multiple starts
      if (isListening || audioContextRef.current) {
        return;
      }
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Voice detection not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      setError(null);
      updateAmplitude();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access microphone');
      console.error('Voice detection error:', err);
    }
  }, [isListening, updateAmplitude]);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
    setAmplitude(0);
    setIsUserSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  // Simulation functions for demo/testing
  const startSimulation = (pattern: 'speaking' | 'listening' | 'thinking' = 'speaking') => {
    setIsSimulating(true);
    setIsListening(true);
    
    let time = 0;
    simulationIntervalRef.current = window.setInterval(() => {
      time += 0.1;
      let simulatedAmplitude = 0;
      
      switch (pattern) {
        case 'speaking':
          // Simulate natural speech patterns
          simulatedAmplitude = 
            Math.sin(time * 2) * 0.3 + 
            Math.sin(time * 7) * 0.2 + 
            Math.sin(time * 13) * 0.1 +
            Math.random() * 0.1;
          simulatedAmplitude = Math.max(0, Math.min(1, simulatedAmplitude + 0.5));
          break;
          
        case 'listening':
          // Low ambient noise
          simulatedAmplitude = Math.random() * 0.05;
          break;
          
        case 'thinking':
          // Pulsing pattern
          simulatedAmplitude = (Math.sin(time * 3) + 1) * 0.3;
          break;
      }
      
      setAmplitude(simulatedAmplitude);
      config.onAmplitudeChange?.(simulatedAmplitude);
      
      // Simulate speech detection
      if (simulatedAmplitude > SPEECH_THRESHOLD && !isSpeakingRef.current) {
        isSpeakingRef.current = true;
        setIsUserSpeaking(true);
        config.onSpeechStart?.();
      } else if (simulatedAmplitude <= SPEECH_THRESHOLD && isSpeakingRef.current) {
        isSpeakingRef.current = false;
        setIsUserSpeaking(false);
        config.onSpeechEnd?.();
      }
    }, 50);
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setIsSimulating(false);
    setIsListening(false);
    setAmplitude(0);
    setIsUserSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopListening();
      stopSimulation();
    };
  }, []);

  return {
    isListening,
    amplitude,
    isUserSpeaking,
    error,
    startListening,
    stopListening,
    // Simulation controls
    isSimulating,
    startSimulation,
    stopSimulation,
  };
}