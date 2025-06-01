
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0uilsv3McF9pbIwdO_awWhgL3Kg7n09nbw5YlCM4oIaPXO6MhnS0p6KYrDxdEM_LnvktccPHctDmK/pub?gid=0&single=true&output=csv';

let tracks = [];
let currentTag = "";
let currentTrack = null;
let player = null;

function getCurrentTag(tags) {
  const utcHour = new Date().getUTCHours();
  return tags[utcHour % tags.length];
}

function loadCSV(url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split('\n');
      const rows = lines.slice(1);
      return rows.map(row => {
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

function playTrack(track) {
  if (player) {
    player.loadVideoById({
      videoId: track.videoId,
      startSeconds: track.start
    });
  } else {
    player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        start: track.start,
        mute: 1
      },
      events: {
        onReady: () => {
          setVolume(parseFloat(document.getElementById('volume').value));
        }
      }
    });
  }

  document.getElementById('info').innerText = `🎶 ${track.title} [${currentTag}]`;
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
  // Se llama automáticamente cuando la API está lista
}

loadCSV(SHEET_URL).then(allTracks => {
  tracks = allTracks;
  const uniqueTags = [...new Set(tracks.flatMap(t => t.tags))];
  currentTag = getCurrentTag(uniqueTags);
  currentTrack = getTrackForCurrentTime(currentTag, tracks);
  if (currentTrack) {
    playTrack(currentTrack);
  } else {
    document.getElementById('info').innerText = 'No hay música disponible para esta hora 😢';
  }

  setInterval(() => {
    const newTag = getCurrentTag(uniqueTags);
    if (newTag !== currentTag) {
      currentTag = newTag;
      currentTrack = getTrackForCurrentTime(currentTag, tracks);
      if (currentTrack) {
        playTrack(currentTrack);
      }
    }
  }, 60 * 1000);
});
