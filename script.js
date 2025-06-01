const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0uilsv3McF9pbIwdO_awWhgL3Kg7n09nbw5YlCM4oIaPXO6MhnS0p6KYrDxdEM_LnvktccPHctDmK/pub?gid=0&single=true&output=csv';

let player = null;

function getCurrentUtcHourTag() {
  const utcHour = new Date().getUTCHours();
  return String(utcHour); // Los tags deben ser '0', '1', ..., '23'
}

function loadCSV(url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split('\n');
      const rows = lines.slice(1); // skip header
      return rows.map(row => {
        const [videoId, title, tags, dur] = row.split(',');
        return {
          videoId: videoId.trim(),
          title: title.trim(),
          tags: tags.split(/[,;]/).map(t => t.trim()),
          duration: parseInt(dur.trim())
        };
      });
    });
}

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

  return { ...tagTracks[0], start: 0 }; // Si terminó el bloque, vuelve al primero
}

function playVideo(track) {
  if (player) {
    player.loadVideoById({ videoId: track.videoId, startSeconds: track.start });
  } else {
    player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        start: track.start,
        controls: 0,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: () => {
          setVolume(parseFloat(document.getElementById('volume').value));
        }
      }
    });
  }

  document.getElementById('info').innerText = `🎶 ${track.title} [UTC ${getCurrentUtcHourTag()}]`;
}

function setVolume(value) {
  if (player && player.setVolume) {
    player.setVolume(value * 100);
  }
}

document.getElementById('volume').addEventListener('input', (e) => {
  setVolume(parseFloat(e.target.value));
});

function onYouTubeIframeAPIReady() {
  loadCSV(SHEET_URL).then(tracks => {
    const tag = getCurrentUtcHourTag();
    const track = getTrackForCurrentTime(tag, tracks);
    if (track) {
      playVideo(track);
    } else {
      document.getElementById('info').innerText = '🎧 No hay música para esta hora.';
    }
  });
}
