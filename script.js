const player = document.getElementById("player");
const trackInfo = document.getElementById("track");

let tracks = [];

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function syncTrack() {
  if (tracks.length === 0) return;

  const now = Date.now() / 1000; // segundos desde epoch
  const total = tracks.reduce((sum, t) => sum + t.duration, 0);
  let pos = now % total;
  let idx = 0;
  while (pos >= tracks[idx].duration) {
    pos -= tracks[idx].duration;
    idx++;
  }
  const cur = tracks[idx];
  player.src = cur.url;
  player.currentTime = pos;
  trackInfo.textContent = `${cur.artist} – ${cur.title}`;
  player.play().catch(console.warn);
}

fetch('jitjot_tracks.json')
  .then(response => response.json())
  .then(data => {
    tracks = data;
    shuffleArray(tracks); // shuffle inicial opcional
    syncTrack();
    setInterval(syncTrack, 15000);
  })
  .catch(err => {
    console.error('Error cargando tracks:', err);
    trackInfo.textContent = "Error cargando tracks";
  });
