let currentSong = new Audio();
const play = document.querySelector("#play"); // Ensure this element exists
let hamburger = document.querySelector(".hamburger");
let close = document.querySelector(".close");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");
let range = document.querySelector(".range").getElementsByTagName("input")[0];
let songs;
let currFolder;

function timeDurationUpdate(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs() {
  let song = await fetch("http://127.0.0.1:3002/Spotify/songs/");
  let response = await song.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let songs = div.getElementsByTagName("a");

  let mySongs = [];
  for (let element of songs) {
    if (element.href.endsWith(".mp3")) {
      mySongs.push(element.href.split("/Spotify/songs/")[1]);
    }
  }
  return mySongs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/Spotify/songs/" + track;
  if (!pause) {
    currentSong.play();
    play.src = "./Assests/pause.svg";
  }
  document.querySelector(".song-duration").innerHTML = "00:00 / 00:00";
  document.querySelector(".song-track").innerHTML = decodeURI(track);
};

async function main() {
  songs = await getSongs();
  if (songs.length === 0) return;

  playMusic(songs[0], true);

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = songs
    .map(
      (song) => `
            <li>
                <img src="./Assests/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                </div>
                <div class="playnow">
                    <img src="./Assests/play.svg" alt="play button icon">
                </div>
            </li>`
    )
    .join("");

  // Play song on list item click
  document.querySelectorAll(".songList li").forEach((li, index) => {
    li.addEventListener("click", () => playMusic(songs[index]));
  });

  // Play/Pause Button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./Assests/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./Assests/play.svg";
    }
  });

  // Time Duration update
  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      const progressBar = document.querySelector(".progress-bar");
      const circle = document.querySelector(".circle");

      const progress = (currentSong.currentTime / currentSong.duration) * 100;

      document.querySelector(
        ".song-duration"
      ).innerHTML = `${timeDurationUpdate(
        currentSong.currentTime
      )} / ${timeDurationUpdate(currentSong.duration)}`;

      circle.style.left = progress + "%";
      progressBar.style.background = `linear-gradient(to right, black ${progress}%, #ccc ${progress}%)`;
    }
  });

  // Seek functionality
  document.querySelector(".progress-bar").addEventListener("click", (e) => {
    const progressBar = e.currentTarget; // Ensures we get the progress bar element
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    if (!isNaN(currentSong.duration)) {
      currentSong.currentTime = clickPosition * currentSong.duration;

      document.querySelector(".circle").style.left = clickPosition * 100 + "%";
      progressBar.style.background = `linear-gradient(to right, black ${
        clickPosition * 100
      }%, #ccc ${clickPosition * 100}%)`;
    }
  });

  // Adding event listener for hamburger
  hamburger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Adding event listener for close button
  close.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= length) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event listener to valume rocker
  range.addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });
}

main();
