document.addEventListener('DOMContentLoaded', function() {
  const playPauseButton = document.getElementById('play-pause');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const seekSlider = document.getElementById('seek-slider');
  const songName = document.getElementById('song-name');
  const currentTimeElement = document.getElementById('current-time');
  const totalDurationElement = document.getElementById('total-duration');

  const songs = [
    { name: 'Kay Nakayama - Body and Mind', url: 'songs/BodyAndMind.mp3'},
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
  let player = new Audio();

  function loadSong(index) {
    player.src = songs[index].url;
    songName.textContent = songs[index].name;
    player.load();
    player.currentTime = 0; // Ensure currentTime is set to 0 after loading
    player.onloadedmetadata = () => {
      totalDurationElement.textContent = formatTime(player.duration);
    };
    // Reset slider and current time to the beginning
    seekSlider.value = 0;
    currentTimeElement.textContent = formatTime(0);
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Set to play icon by default
  }

  function playPause() {
    if (player.paused) {
      player.play();
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      player.pause();
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
    loadSong(currentSongIndex);
    player.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Change icon to pause
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
    loadSong(currentSongIndex);
    player.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Change icon to pause
  }

  function updateSeekSlider() {
    const value = (player.currentTime / player.duration) * 100;
    seekSlider.value = value;
    currentTimeElement.textContent = formatTime(player.currentTime);
  }

  function seekSong() {
    const seekTo = player.duration * (seekSlider.value / 100);
    player.currentTime = seekTo;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsPart = Math.floor(seconds % 60);
    return `${minutes}:${secondsPart < 10 ? '0' : ''}${secondsPart}`;
  }

  function playNextSong() {
    nextSong();
  }

  playPauseButton.addEventListener('click', playPause);
  prevButton.addEventListener('click', prevSong);
  nextButton.addEventListener('click', nextSong);
  seekSlider.addEventListener('input', seekSong);
  player.addEventListener('timeupdate', updateSeekSlider);

  // Automatically play next song when current song ends
  player.addEventListener('ended', playNextSong);

  // Initialize the first song
  loadSong(currentSongIndex);
});
