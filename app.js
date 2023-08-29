const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

const frequencySlider = document.getElementById('frequencySlider');
const frequencyDisplay = document.getElementById('frequencyDisplay');
const startStopButton = document.getElementById('startStopButton');
let isPlaying = false;

frequencySlider.addEventListener('input', () => {
  const frequency = parseFloat(frequencySlider.value);
  frequencyDisplay.textContent = `Frequency: ${frequency} Hz`;
  if (oscillator) {
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  }
});

startStopButton.addEventListener('click', () => {
  if (!isPlaying) {
    startSound();
  } else {
    stopSound();
  }
});

function startSound() {
  const frequency = parseFloat(frequencySlider.value);
  isPlaying = true;
  startStopButton.textContent = 'Stop Sound';

  oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

function stopSound() {
  isPlaying = false;
  startStopButton.textContent = 'Start Sound';

  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
}
