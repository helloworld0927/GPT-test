let mediaRecorder;
let recordedChunks = [];
let stream;
let micStream;

const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resumeBtn = document.getElementById('resume');
const stopBtn = document.getElementById('stop');
const micCheckbox = document.getElementById('mic');
const preview = document.getElementById('preview');
const downloadLink = document.getElementById('download');
const controls = document.getElementById('controls');

async function startRecording() {
    recordedChunks = [];

    try {
        // capture screen (user chooses screen/window/tab)
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false // system audio capture is often restricted
        });

        if (micCheckbox.checked) {
            // capture microphone
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // combine screen and mic audio tracks
            const tracks = [...stream.getVideoTracks(), ...micStream.getAudioTracks()];
            stream = new MediaStream(tracks);
        }

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
        mediaRecorder.start();

        document.body.classList.add('recording');
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
    } catch (err) {
        console.error('Error: ', err);
    }
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

function handleStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    preview.src = url;
    preview.style.display = 'block';
    downloadLink.href = url;
    downloadLink.style.display = 'inline';

    document.body.classList.remove('recording');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;

    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
    }
}

function pauseRecording() {
    mediaRecorder.pause();
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
}

function resumeRecording() {
    mediaRecorder.resume();
    resumeBtn.disabled = true;
    pauseBtn.disabled = false;
}

function stopRecording() {
    mediaRecorder.stop();
}

startBtn.onclick = startRecording;
pauseBtn.onclick = pauseRecording;
resumeBtn.onclick = resumeRecording;
stopBtn.onclick = stopRecording;
