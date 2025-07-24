// AudioWorklet processor for real-time PCM extraction
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096; // Larger buffer for smoother audio
    this.buffer = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0]; // Mono channel
      
      // Convert Float32 to Int16 PCM
      const pcm16 = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
      
      this.buffer.push(...pcm16);
      
      // Send chunks of PCM data
      if (this.buffer.length >= this.bufferSize) {
        const chunk = new Int16Array(this.buffer.splice(0, this.bufferSize));
        this.port.postMessage({
          type: 'audio',
          data: chunk.buffer
        }, [chunk.buffer]);
      }
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);