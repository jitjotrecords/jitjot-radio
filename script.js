const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0uilsv3McF9pbIwdO_awWhgL3Kg7n09nbw5YlCM4oIaPXO6MhnS0p6KYrDxdEM_LnvktccPHctDmK/pub?gid=0&single=true&output=csv';

let tracks = [];
let currentIndex = 0;

function loadCSV(url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split('\n');
      const rows = lines.slice(1);
      return rows.map(row => {
        const [videoId, title, dur] = row.split(',');
        return {
          videoId: videoId.trim(),
          title: title.trim(),
          duration: parseInt(dur.trim())
        };
      });
    });
}

function playTrack(index) {
  const track = tracks[index];
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1`;
  iframe.allow = 'autoplay';
  iframe.id = 'ytplayer';
  document.getElementById('player').innerHTML = '';
  document.getElementById('player').appendChild(iframe);

  document.getElementById('info').innerText = `🎶 ${track.title}`;

  // Programar el próximo track
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % tracks.length;
    playTrack(currentIndex);
  }, track.duration * 1000);
}

function setVolume(value) {
  const iframe = document.getElementById('ytplayer');
  if (!iframe) return;
  const message = {
    event: 'command',
    func: 'setVolume',
    args: [value * 100]
  };
  iframe.contentWindow.postMessage(JSON.stringify(message), '*');
}

document.getElementById('volume').addEventListener('input', (e) => {
  setVolume(parseFloat(e.target.value));
});

loadCSV(SHEET_URL).then(allTracks => {
  if (allTracks.length === 0) {
    document.getElementById('info').innerText = 'No hay temas para reproducir 😢';
    return;
  }
  tracks = allTracks;
  playTrack(currentIndex);
});
