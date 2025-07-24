export class FrequencyAnalyzer {
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private sampleRate: number = 44100;

  initialize(audioContext: AudioContext, source: MediaStreamAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048; // High resolution for accurate frequency analysis
    this.analyser.smoothingTimeConstant = 0.85; // Smooth but responsive
    
    source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.sampleRate = audioContext.sampleRate;
  }

  getFrequencyData(): FrequencyData {
    if (!this.analyser || !this.dataArray) {
      return { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 };
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate frequency bands with proper weighting
    const nyquist = this.sampleRate / 2;
    const binHz = nyquist / this.dataArray.length;

    // Define frequency ranges
    const ranges = {
      bass: { min: 20, max: 250 },
      lowMid: { min: 250, max: 500 },
      mid: { min: 500, max: 2000 },
      highMid: { min: 2000, max: 4000 },
      treble: { min: 4000, max: 20000 }
    };

    // Calculate average amplitude for each range
    const calculateBandAmplitude = (minHz: number, maxHz: number): number => {
      const minBin = Math.floor(minHz / binHz);
      const maxBin = Math.ceil(maxHz / binHz);
      
      let sum = 0;
      let count = 0;
      
      for (let i = minBin; i < maxBin && i < this.dataArray!.length; i++) {
        // Apply psychoacoustic weighting (emphasize mid frequencies)
        const freq = i * binHz;
        const weight = this.getFrequencyWeight(freq);
        sum += (this.dataArray![i] / 255) * weight;
        count++;
      }
      
      return count > 0 ? sum / count : 0;
    };

    return {
      bass: calculateBandAmplitude(ranges.bass.min, ranges.bass.max),
      lowMid: calculateBandAmplitude(ranges.lowMid.min, ranges.lowMid.max),
      mid: calculateBandAmplitude(ranges.mid.min, ranges.mid.max),
      highMid: calculateBandAmplitude(ranges.highMid.min, ranges.highMid.max),
      treble: calculateBandAmplitude(ranges.treble.min, ranges.treble.max)
    };
  }

  // A-weighting curve approximation for more natural perception
  private getFrequencyWeight(freq: number): number {
    const f2 = freq * freq;
    const f4 = f2 * f2;
    
    const num = 12194 * 12194 * f4;
    const den = (f2 + 20.6 * 20.6) * 
                Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) * 
                (f2 + 12194 * 12194);
    
    return num / den;
  }

  // Get dominant frequency for pitch detection
  getDominantFrequency(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);

    let maxValue = 0;
    let maxIndex = 0;

    // Find peak in spectrum
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    // Convert bin to frequency
    const nyquist = this.sampleRate / 2;
    const binHz = nyquist / this.dataArray.length;
    
    return maxIndex * binHz;
  }

  // Smooth frequency data over time
  smoothFrequencyData(
    current: FrequencyData, 
    previous: FrequencyData, 
    smoothing: number = 0.7
  ): FrequencyData {
    return {
      bass: previous.bass * smoothing + current.bass * (1 - smoothing),
      lowMid: previous.lowMid * smoothing + current.lowMid * (1 - smoothing),
      mid: previous.mid * smoothing + current.mid * (1 - smoothing),
      highMid: previous.highMid * smoothing + current.highMid * (1 - smoothing),
      treble: previous.treble * smoothing + current.treble * (1 - smoothing)
    };
  }

  destroy() {
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    this.dataArray = null;
  }
}