/**
 * Audio utility functions for format conversion and processing
 */

/**
 * Convert Float32Array audio samples to 16-bit PCM
 */
export function float32ToPCM16(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp values between -1 and 1
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit signed integer
    pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
  }
  
  return pcm16;
}

/**
 * Convert 16-bit PCM to Float32Array
 */
export function pcm16ToFloat32(pcm16Array: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16Array.length);
  
  for (let i = 0; i < pcm16Array.length; i++) {
    float32[i] = pcm16Array[i] / (pcm16Array[i] < 0 ? 0x8000 : 0x7FFF);
  }
  
  return float32;
}

/**
 * Downsample audio from one sample rate to another
 */
export function downsample(
  inputData: Float32Array,
  fromSampleRate: number,
  toSampleRate: number
): Float32Array {
  const ratio = fromSampleRate / toSampleRate;
  const outputLength = Math.floor(inputData.length / ratio);
  const output = new Float32Array(outputLength);
  
  for (let i = 0; i < outputLength; i++) {
    const inputIndex = Math.floor(i * ratio);
    output[i] = inputData[inputIndex];
  }
  
  return output;
}

/**
 * Create WAV header for PCM data
 */
export function createWAVHeader(
  dataLength: number,
  sampleRate: number,
  numChannels: number = 1,
  bitsPerSample: number = 16
): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, dataLength + 36, true); // file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true); // number of channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // byte rate
  view.setUint16(32, numChannels * bitsPerSample / 8, true); // block align
  view.setUint16(34, bitsPerSample, true); // bits per sample
  
  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // data size
  
  return header;
}