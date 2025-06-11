// Lista de tracks de prueba con metadatos manuales
const tracks = [
  {
    title: "Camino",
    artist: "Maia Basso",
    duration: 200, // duracion en segundos
    url: "https://drive.google.com/uc?export=download&id=TU_ID_DE_CAMINO"
  },
  {
    title: "Ramas",
    artist: "Maia Basso",
    duration: 180,
    url: "https://drive.google.com/uc?export=download&id=TU_ID_DE_RAMAS"
  }
];

const player = document.getElementById("player");
const trackInfo = document.getElementById("track");

function syncTrack() {
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

// sincroniza cada 15 seg
syncTrack();
setInterval(syncTrack, 15000);
