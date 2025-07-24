import { useEffect, useRef, useState, useCallback } from 'react';

// Production-grade Voice Activity Detection (VAD) similar to xAI/ChatGPT/Sesame
interface VoiceDetectionState {
  isListening: boolean;
  isSpeaking: boolean;
  voiceActivity: number;
  noiseFloor: number;
  error: string | null;
  signalQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

interface VoiceDetectionConfig {
  // Callbacks
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVoiceActivityChange?: (activity: number) => void;
  
  // Advanced settings
  vadSensitivity?: number; // 0-1, default 0.7
  noiseSuppressionLevel?: 'low' | 'medium' | 'high' | 'veryhigh';
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
  
  // Frequency analysis
  minFrequency?: number; // Human voice range (85-255 Hz typical)
  maxFrequency?: number; // Human voice range (up to 8000 Hz for clarity)
}

// Voice Activity Detection algorithm constants
const VAD_CONSTANTS = {
  // Frequency bands for human speech
  SPEECH_FREQ_LOW: 85,
  SPEECH_FREQ_HIGH: 8000,
  FORMANT_LOW: 300,
  FORMANT_HIGH: 3400,
  
  // Energy thresholds
  ENERGY_THRESHOLD_RATIO: 1.5, // Energy must be 1.5x noise floor
  ZERO_CROSSING_RATE_LOW: 0.1,
  ZERO_CROSSING_RATE_HIGH: 0.25,
  
  // Timing
  SPEECH_START_FRAMES: 3, // Frames needed to confirm speech start
  SPEECH_END_FRAMES: 15, // Frames of silence to confirm speech end
  NOISE_FLOOR_SAMPLES: 50, // Samples to establish noise floor
  
  // Quality metrics
  SNR_EXCELLENT: 20, // dB
  SNR_GOOD: 15,
  SNR_FAIR: 10,
};

export function useProductionVoiceDetection(config: VoiceDetectionConfig = {}) {
  const [state, setState] = useState<VoiceDetectionState>({
    isListening: false,
    isSpeaking: false,
    voiceActivity: 0,
    noiseFloor: 0,
    error: null,
    signalQuality: 'fair',
  });
  
  // Audio processing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // VAD algorithm state
  const vadStateRef = useRef({
    speechFrames: 0,
    silenceFrames: 0,
    noiseFloorBuffer: [] as number[],
    noiseFloor: 0,
    previousEnergy: 0,
    zeroCrossingRate: 0,
  });
  
  // Advanced audio processing nodes
  const noiseSuppressionRef = useRef<any>(null);
  const echoCancellerRef = useRef<any>(null);
  
  // Production-grade VAD algorithm
  const detectVoiceActivity = useCallback((
    frequencyData: Uint8Array,
    timeDomainData: Uint8Array,
    sampleRate: number
  ) => {
    const nyquist = sampleRate / 2;
    const binCount = frequencyData.length;
    const binWidth = nyquist / binCount;
    
    // 1. Calculate energy in speech frequency bands
    let speechEnergy = 0;
    let totalEnergy = 0;
    let formantEnergy = 0;
    
    for (let i = 0; i < binCount; i++) {
      const freq = i * binWidth;
      const magnitude = frequencyData[i] / 255;
      const energy = magnitude * magnitude;
      
      totalEnergy += energy;
      
      if (freq >= VAD_CONSTANTS.SPEECH_FREQ_LOW && freq <= VAD_CONSTANTS.SPEECH_FREQ_HIGH) {
        speechEnergy += energy;
      }
      
      if (freq >= VAD_CONSTANTS.FORMANT_LOW && freq <= VAD_CONSTANTS.FORMANT_HIGH) {
        formantEnergy += energy * 1.5; // Weight formant frequencies higher
      }
    }
    
    // 2. Calculate zero-crossing rate (indicative of voiced vs unvoiced)
    let zeroCrossings = 0;
    for (let i = 1; i < timeDomainData.length; i++) {
      const curr = timeDomainData[i] - 128;
      const prev = timeDomainData[i - 1] - 128;
      if ((curr > 0 && prev <= 0) || (curr < 0 && prev >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / timeDomainData.length;
    
    // 3. Update noise floor (adaptive)
    const vadState = vadStateRef.current;
    
    // Only update noise floor when not speaking
    if (!vadState.speechFrames || vadState.speechFrames < 3) {
      if (vadState.noiseFloorBuffer.length < VAD_CONSTANTS.NOISE_FLOOR_SAMPLES) {
        vadState.noiseFloorBuffer.push(totalEnergy);
      } else {
        // Rolling average for noise floor
        vadState.noiseFloorBuffer.shift();
        vadState.noiseFloorBuffer.push(totalEnergy);
      }
      
      if (vadState.noiseFloorBuffer.length >= 10) {
        const sortedEnergies = [...vadState.noiseFloorBuffer].sort((a, b) => a - b);
        const newNoiseFloor = sortedEnergies[Math.floor(sortedEnergies.length * 0.2)]; // 20th percentile
        // Smooth noise floor updates
        vadState.noiseFloor = vadState.noiseFloor > 0 
          ? vadState.noiseFloor * 0.9 + newNoiseFloor * 0.1 
          : newNoiseFloor;
      }
    }
    
    // 4. Calculate signal-to-noise ratio
    const snr = vadState.noiseFloor > 0 ? 10 * Math.log10(totalEnergy / vadState.noiseFloor) : 0;
    
    // 5. Voice activity decision logic
    const energyRatio = vadState.noiseFloor > 0 ? totalEnergy / vadState.noiseFloor : 1;
    const speechEnergyRatio = speechEnergy / totalEnergy;
    const formantEnergyRatio = formantEnergy / speechEnergy;
    
    const isVoicePresent = 
      energyRatio > VAD_CONSTANTS.ENERGY_THRESHOLD_RATIO &&
      speechEnergyRatio > 0.3 && // At least 30% energy in speech frequencies
      formantEnergyRatio > 0.4 && // Strong formant presence
      zeroCrossingRate > VAD_CONSTANTS.ZERO_CROSSING_RATE_LOW &&
      zeroCrossingRate < VAD_CONSTANTS.ZERO_CROSSING_RATE_HIGH;
    
    // 6. State machine for speech detection
    if (isVoicePresent) {
      vadState.speechFrames++;
      vadState.silenceFrames = 0;
    } else {
      vadState.silenceFrames++;
      vadState.speechFrames = 0;
    }
    
    // 7. Determine signal quality
    let signalQuality: VoiceDetectionState['signalQuality'] = 'poor';
    if (snr >= VAD_CONSTANTS.SNR_EXCELLENT) signalQuality = 'excellent';
    else if (snr >= VAD_CONSTANTS.SNR_GOOD) signalQuality = 'good';
    else if (snr >= VAD_CONSTANTS.SNR_FAIR) signalQuality = 'fair';
    
    // 8. Calculate voice activity level (0-1) with smoothing
    const rawActivity = Math.min(1, Math.max(0, 
      (energyRatio - 1) * speechEnergyRatio * formantEnergyRatio
    ));
    
    // Smooth the activity level to prevent jitter
    const voiceActivity = vadState.previousEnergy > 0 
      ? rawActivity * 0.7 + vadState.previousEnergy * 0.3
      : rawActivity;
    
    vadState.previousEnergy = voiceActivity;
    
    return {
      isSpeaking: vadState.speechFrames >= VAD_CONSTANTS.SPEECH_START_FRAMES,
      voiceActivity,
      noiseFloor: vadState.noiseFloor,
      signalQuality,
      shouldEndSpeech: vadState.silenceFrames >= VAD_CONSTANTS.SPEECH_END_FRAMES,
    };
  }, []);
  
  // Main processing loop
  const processAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const analyser = analyserRef.current;
    const sampleRate = audioContextRef.current.sampleRate;
    
    // Get frequency and time domain data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeDomainData = new Uint8Array(analyser.fftSize);
    
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);
    
    // Run VAD algorithm
    const vadResult = detectVoiceActivity(frequencyData, timeDomainData, sampleRate);
    
    // Update state
    setState(prev => {
      const newState = {
        ...prev,
        voiceActivity: vadResult.voiceActivity,
        noiseFloor: vadResult.noiseFloor,
        signalQuality: vadResult.signalQuality,
      };
      
      // Handle speech state transitions
      if (!prev.isSpeaking && vadResult.isSpeaking) {
        newState.isSpeaking = true;
        config.onSpeechStart?.();
      } else if (prev.isSpeaking && vadResult.shouldEndSpeech) {
        newState.isSpeaking = false;
        config.onSpeechEnd?.();
      }
      
      return newState;
    });
    
    config.onVoiceActivityChange?.(vadResult.voiceActivity);
    
    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [detectVoiceActivity, config]);
  
  // Start listening with production-grade settings
  const startListening = useCallback(async () => {
    try {
      // Check for API support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      
      // Production-grade audio constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: config.echoCancellation ?? true,
          noiseSuppression: config.noiseSuppression ?? true,
          autoGainControl: config.autoGainControl ?? true,
          sampleRate: 48000, // High quality
          channelCount: 1,
          
          // Advanced constraints for better quality
          ...(navigator.mediaDevices.getSupportedConstraints().latency && {
            latency: 0.01, // 10ms latency
          }),
          ...(navigator.mediaDevices.getSupportedConstraints().sampleSize && {
            sampleSize: 16, // 16-bit audio
          }),
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Create audio context with optimal settings
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });
      
      // Create analyser with production settings
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // Higher resolution for better frequency analysis
      analyserRef.current.smoothingTimeConstant = 0.3; // Less smoothing for faster response
      
      // Connect audio nodes
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      setState(prev => ({ ...prev, isListening: true, error: null }));
      processAudio();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start voice detection';
      setState(prev => ({ ...prev, error: errorMsg }));
      console.error('[VAD] Error:', err);
    }
  }, [config, processAudio]);
  
  // Stop listening and cleanup
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Reset VAD state
    vadStateRef.current = {
      speechFrames: 0,
      silenceFrames: 0,
      noiseFloorBuffer: [],
      noiseFloor: 0,
      previousEnergy: 0,
      zeroCrossingRate: 0,
    };
    
    setState({
      isListening: false,
      isSpeaking: false,
      voiceActivity: 0,
      noiseFloor: 0,
      error: null,
      signalQuality: 'fair',
    });
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);
  
  return {
    ...state,
    startListening,
    stopListening,
  };
}