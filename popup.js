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
    num_init = 0;

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
            chrome.runtime.sendMessage({ command: 'getState' }, (response) => {
                if (response) {
                    // Process the response here
                    songs = response.songs;
                    currentSongIndex = response.currentSongIndex;
                    //isPlaying = response.isPlaying ?? false;
                    updateSongDetails()
                    //playPauseButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
                    
                    num_init++;

                    if (response.currentTime !== undefined && response.duration !== undefined) {
                        const value = (response.currentTime / response.duration) * 100;
                        seekSlider.value = value;
                        currentTimeElement.textContent = formatTime(response.currentTime);
                        totalDurationElement.textContent = formatTime(response.duration);
                    }

                } else {
                    // Handle error or retry logic
                    console.error('Failed to get state.');
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


    player.addEventListener('ended', playNextSong);

    async function playNextSong() {
        await sendCommandToBackground('next');
            currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
            updateSongDetails();
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
            player.play()
    }


    function updateSlider() {
        chrome.storage.local.get(['currentTime', 'duration', 'isPlaying'], (data) => {
            if (data.currentTime !== undefined && data.duration !== undefined && data.isPlaying !== undefined) {
                console.log(data.currentTime, data.duration);
                const value = (data.currentTime / data.duration) * 100;
                seekSlider.value = value;
                currentTimeElement.textContent = formatTime(data.currentTime);
                totalDurationElement.textContent = formatTime(data.duration);
                isPlaying = data.isPlaying;
                playPauseButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
            }
        });
    }

    setInterval(updateSlider, 200);


    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsPart = Math.floor(seconds % 60);
        return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
    }

    init();
});
