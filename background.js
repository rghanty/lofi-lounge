let playbackWindowId = null;

const songs = [
    { name: 'Kay Nakayama - Body and Mind', url: 'songs/BodyandMind.mp3'},
    { name: 'Psalm Trees - fever', url: 'songs/Fever.mp3' },
    { name: 'Mondo Loops - Lunar Drive', url: 'songs/LD.mp3' },
    { name: 'hoogway - Missing Earth', url: 'songs/ME.mp3' },
    { name: 'WYS - Nautilus', url: 'songs/Nautilus.mp3' },
    { name: 'Sleepy Fish - Procrastinating', url: 'songs/Procrastinating.mp3' },
    { name: 'nothingtosay - Inspect', url: 'songs/Inspect.mp3' },
    { name: 'Lenny Ibizzare - The Local Floatery', url: 'songs/TLF.mp3' }
    // Add more songs here
];

let currentSongIndex = 0;


async function createOffscreen() {
    if (!await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.createDocument({
        url: 'audio.html',
        reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
        justification: 'Play lofi music'
    });
    
}
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    createOffscreen();
    if (message.command === 'getState') {
        
            
            //const { isPlaying } = await chrome.storage.local.get(['isPlaying']);
            sendResponse({ songs, currentSongIndex});
        
        //return true; 
    } else if (message.command === 'play') {
        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
        chrome.storage.local.set({ currentSongIndex, isPlaying: true });
    } else if (message.command === 'pause') {
        chrome.runtime.sendMessage({ command: 'pause' });
        chrome.storage.local.set({ isPlaying: false });
    } else if (message.command === 'next') {
        currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
        chrome.storage.local.set({ currentSongIndex, isPlaying: true });
    } else if (message.command === 'prev') {
        currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
        chrome.storage.local.set({ currentSongIndex, isPlaying: true });
    } else if (message.command === 'seek') {
        chrome.runtime.sendMessage({ command: 'seek', seekTo: message.seekTo });
    } else if (message.currentTime !== undefined && message.duration !== undefined) {
        chrome.storage.local.set({ currentTime: message.currentTime, duration: message.duration });
    } else if (message.command === 'getSongs') {
        sendResponse({ songs, currentSongIndex });
    }
    sendResponse({ status: 'ok' })
    return true; // Indicate that the response is asynchronous
});