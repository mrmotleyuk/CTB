// Initialize Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let selectedInput;
let sourceNode;
let gainNode; // Add a gain node
let bufferNode; // Add a buffer node
let isProcessing = false; // Track if audio processing is active

// Set up audio input dropdown
async function setupAudioInput() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioInputs = devices.filter(device => device.kind === 'audioinput');
  const dropdown = document.getElementById('audioInputDropdown');

  audioInputs.forEach(input => {
    const option = document.createElement('option');
    option.value = input.deviceId;
    option.text = input.label || `Input ${dropdown.options.length + 1}`;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener('change', async () => {
    selectedInput = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: dropdown.value },
    });
  });
}

// Stop audio processing
function stopAudioProcessing() {
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }

  if (bufferNode) {
    bufferNode.disconnect();
    bufferNode = null;
  }

  isProcessing = false;
  const startButton = document.getElementById('startButton');
  startButton.textContent = 'Start Processing';
}

// Start audio processing
async function startAudioProcessing() {
  const startButton = document.getElementById('startButton');

  if (isProcessing) {
    // Stop processing
    stopAudioProcessing();
    return;
  }

  if (!selectedInput) {
    console.log('No input selected.');
    return;
  }

  // Create a worklet processor for buffering
  await audioContext.audioWorklet.addModule('buffer-processor.js'); // Add your processor module

  sourceNode = audioContext.createMediaStreamSource(selectedInput);
  bufferNode = new AudioWorkletNode(audioContext, 'buffer-processor');

  // Connect nodes and start processing
  sourceNode.connect(bufferNode);

  // Add a gain node for volume control
  gainNode = audioContext.createGain();
  bufferNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Adjust the volume based on the slider value
  const volumeSlider = document.getElementById('volumeSlider');
  volumeSlider.addEventListener('input', () => {
    gainNode.gain.value = volumeSlider.value;
  });

  // Change button text and behavior
  startButton.textContent = 'Stop Processing';
  isProcessing = true;
}

// Call setupAudioInput to populate dropdown
setupAudioInput();

// Start/stop audio processing when user clicks "Start Processing" button
document.getElementById('startButton').addEventListener('click', startAudioProcessing);

// Adjust buffer size based on slider value
const bufferSizeSlider = document.getElementById('bufferSizeSlider');
const bufferSizeLabel = document.getElementById('bufferSizeLabel');
bufferSizeSlider.addEventListener('input', () => {
  const bufferSize = parseInt(bufferSizeSlider.value);
  bufferSizeLabel.textContent = bufferSize;
  if (bufferNode) {
    bufferNode.port.postMessage({ type: 'bufferSize', value: bufferSize });
  }
});

// Adjust sample rate based on slider value
const sampleRateSlider = document.getElementById('sampleRateSlider');
const sampleRateLabel = document.getElementById('sampleRateLabel');
sampleRateSlider.addEventListener('input', () => {
  const sampleRateValue = parseInt(sampleRateSlider.value);
  sampleRateLabel.textContent = sampleRateValue;
  if (audioContext) {
    audioContext.sampleRate = sampleRateValue;
    if (bufferNode) {
      bufferNode.port.postMessage({ type: 'sampleRate', value: sampleRateValue });
    }
  }
});
