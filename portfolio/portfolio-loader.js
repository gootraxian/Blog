(async function () {
  if (document.readyState === 'loading') {
    await new Promise(r =>
      document.addEventListener('DOMContentLoaded', r, { once: true })
    );
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  function createMediaItem(filename) {
    return new Promise((resolve) => {
      const lower = filename.toLowerCase();
      const item = document.createElement('div');
      item.className = 'grid-item';
      const path = `portfolio/${filename}`;

      // ---------- IMAGES ----------
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const img = new Image();
        img.src = path;
        img.loading = 'lazy';

        // IMPORTANT: resolve immediately
        resolve({ element: item, ratio: 1 });

        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;

          item.classList.remove(
            'orientation-landscape',
            'orientation-portrait',
            'orientation-square'
          );

          if (ratio > 1.2) item.classList.add('orientation-landscape');
          else if (ratio < 0.8) item.classList.add('orientation-portrait');
          else item.classList.add('orientation-square');
        };

        img.onerror = () => item.remove();
        item.appendChild(img);
      }

      // ---------- VIDEOS ----------
      else if (lower.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = path;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
          const ratio = video.videoWidth / video.videoHeight || 1.77;
          resolve({ element: item, ratio });
          video.play().catch(() => {});
        };

        video.onerror = () => resolve(null);
        item.appendChild(video);
      }

      else {
        resolve(null);
      }
    });
  }

  async function loadManifest() {
    try {
      const res = await fetch('portfolio/manifest.json', { cache: 'no-cache' });
      const files = await res.json();

      grid.innerHTML = '';

      const chunkSize = 5;

      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);

        const results = await Promise.all(
          chunk.map(file => createMediaItem(file))
        );

        results.forEach(item => {
          if (!item) return;

          const { element, ratio } = item;

          // Videos get orientation immediately
          if (ratio > 1.2) element.classList.add('orientation-landscape');
          else if (ratio < 0.8) element.classList.add('orientation-portrait');
          else element.classList.add('orientation-square');

          grid.appendChild(element);
        });
      }

    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p>Could not load portfolio.</p>';
    }
  }

  loadManifest();
})();
