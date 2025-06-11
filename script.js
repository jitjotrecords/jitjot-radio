fetch('jitjot_tracks.json')
  .then(res => res.json())
  .then(tracks => {
    const player = document.getElementById('player');
    player.src = tracks[0].url;
    player.play().catch(e => console.error('Error reproduciendo:', e));
    console.log('Reproduciendo:', tracks[0].title);
  })
  .catch(err => {
    console.error('Error cargando tracks:', err);
  });
