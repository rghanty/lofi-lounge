document.addEventListener('DOMContentLoaded', function() {
    const playPauseButton = document.getElementById('play-pause');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const seekSlider = document.getElementById('seek-slider');
    const songName = document.getElementById('song-name');
    const currentTimeElement = document.getElementById('current-time');
    const totalDurationElement = document.getElementById('total-duration');

    let songs = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let player = new Audio()
    player.muted = true;
    num_init = 0

    function updateSongDetails() {
        songName.textContent = songs[currentSongIndex].name;
        player.src = chrome.runtime.getURL(songs[currentSongIndex].url);
    }

    function sendCommandToBackground(command, data = {}) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ command, ...data }, (response) => {
                if (chrome.runtime.lastError || response.status === 'error') {
                    reject(chrome.runtime.lastError || new Error(response.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

    async function init() {
       
        try {   
            //await sendCommandToBackground('createPlaybackWindow');
            chrome.runtime.sendMessage({ command: 'getSongs' }, (response) => {
                if (response) {
                    // Process the response here
                    songs = response.songs;
                    currentSongIndex = response.currentSongIndex;
                    updateSongDetails()
                    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                    num_init++;

                } else {
                    // Handle error or retry logic
                    console.error('Failed to get songs.');
                } 
            });
            
            
        } catch (error) {
            console.error('Error during initialization:', error);
        }
        
    }
    

    playPauseButton.addEventListener('click', async () => {
        try {
            if (isPlaying) {
                await sendCommandToBackground('pause');
                playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
                player.pause();
                
            } else {
                await sendCommandToBackground('play');
                playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
                player.play();
                
            }
            isPlaying = !isPlaying;
        } catch (error) {
            console.error('Error during play/pause:', error);
        }
    });

    prevButton.addEventListener('click', async () => {
        try {
            await sendCommandToBackground('prev');
            currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
            updateSongDetails();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            player.play()
        } catch (error) {
            console.error('Error during prev:', error);
        }
    });

    nextButton.addEventListener('click', async () => {
        try {
            await sendCommandToBackground('next');
            currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
            updateSongDetails();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            player.play()
        } catch (error) {
            console.error('Error during next:', error);
        }
    });

    seekSlider.addEventListener('input', async () => {
        const seekTo = player.duration * (seekSlider.value / 100);
        player.currentTime = seekTo;
        try {
            await sendCommandToBackground('seek', { seekTo });
        } catch (error) {
            console.error('Error during seek:', error);
        }
    });

    player.addEventListener('timeupdate', () => {
        const value = (player.currentTime / player.duration) * 100;
        seekSlider.value = value;
        currentTimeElement.textContent = formatTime(player.currentTime);
    });

    player.addEventListener('loadedmetadata', () => {
        totalDurationElement.textContent = formatTime(player.duration);
    });

    player.addEventListener('ended', playNextSong);

    async function playNextSong() {
        await sendCommandToBackground('next');
            currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
            updateSongDetails();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            player.play()
    }

    function updateUI(state) {
        // Update UI elements like play/pause button and seek slider
        console.log("updating state");
        if (state.isPlaying) {
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
        }
        seekSlider.value = (state.currentTime / state.totalDuration) * 100;
        // Update other UI elements as needed
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }

    init();
});
