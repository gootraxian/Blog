(async function () {
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  function createMediaItem(filename) {
    return new Promise((resolve) => {
      const lower = filename.toLowerCase();
      const item = document.createElement('div');
      item.className = 'grid-item';
      const path = `portfolio/${filename}`;
      
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const img = new Image();
        img.src = path;
        img.loading = 'lazy';
        img.onload = () => resolve({ element: item, ratio: img.naturalWidth / img.naturalHeight });
        img.onerror = () => resolve(null);
        item.appendChild(img);
      } 
      else if (lower.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = path;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata'; // Get size first

        video.onloadedmetadata = () => {
          // Once we have dimensions, tell the video to start playing
          video.play().catch(() => {}); 
          resolve({ element: item, ratio: video.videoWidth / video.videoHeight || 1.77 });
        };
        video.onerror = () => resolve(null);
        item.appendChild(video);
      } else {
        resolve(null);
      }
    });
  }

  async function loadManifest() {
    try {
      const res = await fetch('portfolio/manifest.json', { cache: 'no-cache' });
      const files = await res.json();
      grid.innerHTML = ''; 

      // --- THE FIX: Process in chunks of 5 ---
      // This prevents the "Traffic Jam" that stops images from appearing.
      const chunkSize = 5;
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        
        // Load this batch of 5 in parallel
        const results = await Promise.all(chunk.map(file => createMediaItem(file)));

        // Append them as soon as the batch is ready
        results.forEach(item => {
          if (item) {
            const { element, ratio } = item;
            if (ratio > 1.2) element.classList.add('orientation-landscape');
            else if (ratio < 0.8) element.classList.add('orientation-portrait');
            else element.classList.add('orientation-square');
            grid.appendChild(element);
          }
        });
      }

    } catch (err) {
      grid.innerHTML = '<p>Could not load portfolio.</p>';
    }
  }

  loadManifest();
})();
