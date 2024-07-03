// offscreen.js (or similar offscreen script)
let isPlaying = false;
let currentTime = 0;
let totalDuration = 0;
let audio = new Audio();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.play) {
        playAudio(message.play.url);
        
    } else if (message.command === 'pause') {
        pauseAudio();
    } else if (message.command === 'seek') {
        seekAudio(message.seekTo);
    } else if (message.command === 'updateUI') {
      console.log(updatePlaybackState());
        
    
    }
    
});



function playAudio(url) {
    audio.src = url;
    audio.play();
    isPlaying = true;
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
}

function seekAudio(seekTo) {
    audio.currentTime = seekTo;
}

function updatePlaybackState() {
    return {
        isPlaying: isPlaying,
        currentTime: audio.currentTime,
        totalDuration: audio.totalDuration
    };
}
