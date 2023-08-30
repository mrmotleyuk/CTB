// Define an AudioWorkletProcessor for buffering
class BufferProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.bufferSize = 2048; // Default buffer size
      this.sampleRate = 44100; // Default sample rate
      this.buffer = new Float32Array(this.bufferSize);
      this.bufferIndex = 0;
      this.port.onmessage = event => {
        const { type, value } = event.data;
        if (type === 'bufferSize') {
          this.bufferSize = value;
          this.buffer = new Float32Array(this.bufferSize);
          this.bufferIndex = 0;
        } else if (type === 'sampleRate') {
          this.sampleRate = value;
        }
      };
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
  
      for (let channel = 0; channel < input.length; ++channel) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
  
        for (let i = 0; i < inputChannel.length; ++i) {
          this.buffer[this.bufferIndex] = inputChannel[i];
          outputChannel[i] = this.buffer[this.bufferIndex];
  
          // Update buffer index
          this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
        }
      }
  
      return true;
    }
  }
  
  registerProcessor('buffer-processor', BufferProcessor);
  