const { desktopCapturer, remote } = require("electron");
const { dialog, Menu } = remote;
const { writeFile } = require('fs');

let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = []
const videoElement = document.querySelector("video");

const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

const startBtn = document.getElementById("startBtn");
startBtn.onclick = e => {
    // Check whether a video source has been selected
    // before changing the style of the button etc
    if (Boolean(recordedChunks.length)) {
        videoElement.style.width = "70%";
        startBtn.style.width = "100px";
        mediaRecorder.start();
        startBtn.classList.add('is-danger');
        startBtn.innerText = 'Recording';
    } else {
        alert("Please select a screen first!")
    }
};

const stopBtn = document.getElementById("stopBtn");
stopBtn.onclick = e => {
    videoElement.style.width = "60%";
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
    startBtn.style.width = "60px";
};

/**
 * Get all the available screens onto the user's system
 * and show it to the user
 */
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    });
    // Create a UI element
    // Build a native menu directly into the code
    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    );
    videoOptionsMenu.popup();
}

/**
 * Change the videoSource window to record
 */
async function selectSource(source) {
    videoSelectBtn.innerHTML = `&nbsp;&nbsp;&nbsp;${source.name}&nbsp;&nbsp;&nbsp;`;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };
    // Create a Stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the source in a video element
    // Updates the UI
    videoElement.srcObject = stream;
    videoElement.play();

    // Create the Media Recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    // Register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

/**
 * Captures all the recoded chunks
 */
function handleDataAvailable(e) {
    recordedChunks.push(e.data);
}

/**
 * Saves the video file on stop
 */
async function handleStop(e) {
    // A `Blob` is a data structure used for handling raw data
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });
    // A buffer is required instead of a blob in order to convert the data
    // into useable format to be played back as a video
    const buffer = Buffer.from(await blob.arrayBuffer());
    // Ask the user where to save the file
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });
    if (filePath) {
        writeFile(filePath, buffer, () => alert("Video has been saved successfully!"));
    }
}
