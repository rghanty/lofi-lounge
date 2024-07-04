// offscreen.js (or similar offscreen script)
let isPlaying = false;
let currentTime = 0;
let totalDuration = 0;
let audio = new Audio();
let isPaused = false;
let prevsrc = null;

chrome.runtime.onMessage.addListener((message) => {
    if (message.play) {
        playAudio(message.play.url);
        
    } else if (message.command === 'pause') {
        pauseAudio();
    } else if (message.command === 'seek') {
        seekAudio(message.seekTo);
    
    }
});



function playAudio(url) {
    if (!isPaused || prevsrc !== url) {
    audio.src = url;
    prevsrc = url;  
    }
    audio.play();
    isPlaying = true;
    isPaused = false;
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    isPaused = true;
}

function seekAudio(seekTo) {
    audio.currentTime = seekTo;
}

audio.addEventListener('timeupdate', () => {
    chrome.runtime.sendMessage({
        currentTime: audio.currentTime,
        duration: audio.duration,
        isPlaying: isPlaying
    });
});

audio.addEventListener('ended', () => {
    chrome.runtime.sendMessage({ command: 'next' });
});
