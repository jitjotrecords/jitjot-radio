const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0uilsv3McF9pbIwdO_awWhgL3Kg7n09nbw5YlCM4oIaPXO6MhnS0p6KYrDxdEM_LnvktccPHctDmK/pub?gid=0&single=true&output=csv';

let tracks = [];
let player = null;

// Obtener la hora UTC actual como tag
function getCurrentUtcHourTag() {
  return String(new Date().getUTCHours());
}

// Cargar CSV desde Google Sheets
function loadCSV(url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split('\n');
      return lines.slice(1).map(row => {
        const [videoId, title, tags, dur] = row.split(',');
        return {
          videoId: videoId.trim(),
          title: title.trim(),
          tags: tags.toLowerCase().split(/[,;]/).map(t => t.trim()),
          duration: parseInt(dur.trim())
        };
      });
    });
}

// Obtener track correspondiente a esta hora
function getTrackForCurrentTime(tag, trackList) {
  const now = new Date();
  const startOfHour = new Date(now);
  startOfHour.setUTCMinutes(0, 0, 0);
  const secondsIntoBlock = Math.floor((now - startOfHour) / 1000);

  const tagTracks = trackList.filter(t => t.tags.includes(tag));
  if (tagTracks.length === 0) return null;

  let total = 0;
  for (const track of tagTracks) {
    if (total + track.duration > secondsIntoBlock) {
      return { ...track, start: secondsIntoBlock - total };
    }
    total += track.duration;
  }
  return { ...tagTracks[0], start: 0 };
}

// Inicializa el reproductor cuando la API de YouTube está lista
function onYouTubeIframeAPIReady() {
  loadCSV(SHEET_URL).then(allTracks => {
    tracks = allTracks;
    const tag = getCurrentUtcHourTag();
    const track = getTrackForCurrentTime(tag, tracks);

    if (!track) {
      document.getElementById('info').innerText = '🎧 No hay música para esta hora.';
      return;
    }

    player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        start: track.start
      },
      events: {
        onReady: (event) => {
          const volume = parseFloat(document.getElementById('volume').value) * 100;
          event.target.setVolume(volume);
        }
      }
    });

    document.getElementById('info').innerText = `🎶 ${track.title} [UTC ${tag}]`;
  });
}

// Control de volumen
document.getElementById('volume').addEventListener('input', e => {
  if (player && player.setVolume) {
    player.setVolume(parseFloat(e.target.value) * 100);
  }
});
