// Initialize Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let selectedInput;
let sourceNode;
let chorusNode;
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

// Set up chorus effect
function setupChorus() {
  chorusNode = audioContext.createStereoPanner();
  // Set up and connect chorusNode to audioContext.destination
  // Adjust chorus parameters based on the slider value
}

// Stop audio processing
function stopAudioProcessing() {
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }

  if (chorusNode) {
    chorusNode.disconnect();
    chorusNode = null;
  }

  isProcessing = false;
  const startButton = document.getElementById('startButton');
  startButton.textContent = 'Start Processing';
}

// Start audio processing
function startAudioProcessing() {
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

  sourceNode = audioContext.createMediaStreamSource(selectedInput);

  // Connect nodes and start processing
  sourceNode.connect(audioContext.destination);

  const chorusToggle = document.getElementById('chorusToggle');
  
  // Add an event listener for the checkbox change event
  chorusToggle.addEventListener('change', () => {
    if (chorusToggle.checked) {
      setupChorus();
      sourceNode.connect(chorusNode);
      chorusNode.connect(audioContext.destination);
    } else {
      if (chorusNode) {
        chorusNode.disconnect();
        chorusNode = null;
      }
    }
  });

  // Change button text and behavior
  startButton.textContent = 'Stop Processing';
  isProcessing = true;
}

// Call setupAudioInput to populate dropdown
setupAudioInput();

// Start/stop audio processing when user clicks "Start Processing" button
document.getElementById('startButton').addEventListener('click', startAudioProcessing);
