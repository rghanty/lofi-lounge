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
let playerDetails = {};
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
    if (message.command === 'createPlaybackWindow') {
        //await createPlaybackWindow();
        //sendResponse({ status: 'ok' });

    } else if (message.command === 'getSongs') {
        try {
            
            sendResponse({ songs, currentSongIndex});
        } catch (error) {
            console.error('Error sending songs:', error);
            sendResponse({ status: 'error', message: error.message });
        }
        return true; 
    } else if (message.command === 'play') {

        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
    } else if (message.command === 'pause') {
        chrome.runtime.sendMessage({ command: 'pause' });
    } else if (message.command === 'next') {
        currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
    } else if (message.command === 'prev') {
        currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
        chrome.runtime.sendMessage({ play: { url: chrome.runtime.getURL(songs[currentSongIndex].url) } });
    } else if (message.command === 'seek') {
        chrome.runtime.sendMessage({ command: 'seek', seekTo: message.seekTo });
    }
    
    sendResponse({ status: 'ok' })
    return true; // Indicate that the response is asynchronous
});
