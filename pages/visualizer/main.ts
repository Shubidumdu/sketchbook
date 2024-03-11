document.addEventListener('DOMContentLoaded', () => {
  const audioFileInput = document.getElementById(
    'audioFile',
  ) as HTMLInputElement;
  const audioElement = document.getElementById('audio') as HTMLAudioElement;
  const visualizerCanvas = document.getElementById(
    'visualizer',
  ) as HTMLCanvasElement;
  const audioContext = new window.AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audioElement);
  console.log(audioContext);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = Math.pow(2, 15); // MAX 15

  const bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  const dataArray = new Uint8Array(bufferLength);

  const canvasCtx = visualizerCanvas.getContext('2d')!;
  visualizerCanvas.width = window.innerWidth - 40;
  visualizerCanvas.height = 150;

  const drawVisualizer = () => {
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      canvasCtx.fillStyle = `rgb(${barHeight * 2 + 100}, 50, 50)`;
      canvasCtx.fillRect(
        x,
        visualizerCanvas.height - barHeight,
        barWidth,
        barHeight,
      );

      x += barWidth + 1;
    }

    requestAnimationFrame(drawVisualizer);
  };

  audioFileInput.addEventListener('change', (event) => {
    const file = event.target?.files[0];
    const objectURL = URL.createObjectURL(file);
    console.log(objectURL);

    audioElement.src = objectURL;
    audioElement.load();
    audioElement.play();

    drawVisualizer();
  });
});
