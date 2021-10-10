const { desktopCapturer, remote } = require("electron");
const { Menu } = remote;

const videoElement = document.querySelector("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

/**
 * Get all the available screens onto the user's system
 * and show it to the user
 */
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ["window", "screen"]
    });
    // Create a UI element
    // Build native menus directly into the code
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
