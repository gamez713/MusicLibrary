let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer;

let curr_track = document.createElement('audio');

let track_list = [
  {
    name: "bad habit",
    artist: "steve lacy",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/song1image.jpg?sp=r&st=2022-11-07T05:13:30Z&se=2022-12-31T13:13:30Z&spr=https&sv=2021-06-08&sr=b&sig=nsVGXHdW%2F2IwczY0kKEzdSVLoMFwF0Su%2BygKxqr89k0%3D",
    path: "https://musiclibraryproj.blob.core.windows.net/songs/S_d4be2204_hellllooo.mp3?sv=2021-06-08&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2022-12-01T13:53:29Z&st=2022-11-10T05:53:29Z&spr=https,http&sig=YnY6LK53ySqznX%2FWwahpLa3gP3Dnb6J%2FdS%2FAXO6asSY%3D"
  },
  {
    name: "i like you",
    artist: "post malone",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/ilikeyouimage.jpg?sp=r&st=2022-11-07T05:24:25Z&se=2022-12-31T13:24:25Z&spr=https&sv=2021-06-08&sr=b&sig=9yGzQ5u%2BIdN3yHN4yp9MEnngFsicIrPceGi%2BykGkV7I%3D",
    path: "https://musicplayeruh.blob.core.windows.net/newcontainer/ilikeyou.mp3?sp=r&st=2022-11-07T05:25:22Z&se=2022-12-31T13:25:22Z&spr=https&sv=2021-06-08&sr=b&sig=KGzmvJhVrv8WBUl3M3i6vasatyAljbqNBvEWsJQ19EU%3D"
  },
  {
    name: "as it was",
    artist: "harry styles",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/asitwasimage.jpg?sp=r&st=2022-11-07T05:27:47Z&se=2022-12-31T13:27:47Z&spr=https&sv=2021-06-08&sr=b&sig=j1TzaF3q8HN9sSEZ5IQGw%2BLosmzJ9%2Btba9pj3g%2BPlkk%3D",
    path: "https://musicplayeruh.blob.core.windows.net/newcontainer/asitwas.mp3?sp=r&st=2022-11-07T05:26:47Z&se=2022-12-31T13:26:47Z&spr=https&sv=2021-06-08&sr=b&sig=Jax6P0pWqd9NLSAOdbQs%2BuBy1he0Cm3mFn8icvtsGqw%3D"
  },
  {
    name: "wait for u",
    artist: "future",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/waitforu.jpeg?sp=r&st=2022-11-07T05:45:39Z&se=2023-11-07T13:45:39Z&spr=https&sv=2021-06-08&sr=b&sig=LhtU7XxfDBtzN0Fwz%2BQ5AvyfUizIJAQhFwd%2FDZcixKU%3D",
    path: "https://musicplayeruh.blob.core.windows.net/newcontainer/waitforu.mp3?sp=r&st=2022-11-07T05:44:51Z&se=2023-11-07T13:44:51Z&spr=https&sv=2021-06-08&sr=b&sig=dEvhN6jkbgOLt5uppPS8tHphOgA5%2FiEohWjxPpGW4yM%3D"
  },
  {
    name: "sunroof",
    artist: "nicki youre",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/sunroof.jpeg?sp=r&st=2022-11-07T05:46:26Z&se=2023-11-07T13:46:26Z&spr=https&sv=2021-06-08&sr=b&sig=PCbkLGhh33ofYOiJE6I05WRdX3QOLpKL4y%2FXR3xSWBM%3D",
    path: "https://musicplayeruh.blob.core.windows.net/newcontainer/sunroof.mp3?sp=r&st=2022-11-07T05:46:06Z&se=2023-11-07T13:46:06Z&spr=https&sv=2021-06-08&sr=b&sig=BwqZ0P1xzEiYONrj9lHluzZjY0xWJSLmyItiRQ4yBgQ%3D"
  },
  {
    name: "star walkin",
    artist: "lil nas x",
    image: "https://musicplayeruh.blob.core.windows.net/newcontainer/starwalkin.jpeg?sp=r&st=2022-11-07T05:47:05Z&se=2023-11-07T13:47:05Z&spr=https&sv=2021-06-08&sr=b&sig=jiomwMDshl0Jbhyd%2Fkoz%2BhF%2BBwqfHciZ%2B0fCV%2F0FpWc%3D",
    path: "https://musicplayeruh.blob.core.windows.net/newcontainer/starwalkin.mp3?sp=r&st=2022-11-07T05:46:45Z&se=2023-11-07T13:46:45Z&spr=https&sv=2021-06-08&sr=b&sig=SN42YMABIGnuBSJS08bamAD%2B%2BJTXBkZJnematKibVIg%3D"
  }
  
];

function random_bg_color() {

  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";
  document.body.style.background = bgColor;

}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';;
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}



