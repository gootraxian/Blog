// portfolio/portfolio-loader.js
(async function () {
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  // New Helper: Appends item immediately once it's ready
  async function processAndAppend(filename) {
    const itemData = await createMediaItem(filename);
    if (!itemData) return;

    const { element, ratio } = itemData;

    // Apply orientation classes
    if (ratio > 1.2) element.classList.add('orientation-landscape');
    else if (ratio < 0.8) element.classList.add('orientation-portrait');
    else element.classList.add('orientation-square');

    // Add a small fade-in effect via CSS if you have one
    grid.appendChild(element);
  }

  async function loadManifest() {
    try {
      const res = await fetch('portfolio/manifest.json', { cache: 'no-cache' });
      const files = await res.json();

      grid.innerHTML = ''; // Clear loading message immediately

      // Launch all requests simultaneously, but don't 'await' the group!
      // This lets them finish and append in whatever order they download.
      files.forEach(filename => processAndAppend(filename));

    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p>Could not load portfolio.</p>';
    }
  }

  // --- Keep your createMediaItem mostly the same, but add these small tweaks ---
  function createMediaItem(filename) {
    return new Promise((resolve) => {
      const lower = filename.toLowerCase();
      const item = document.createElement('div');
      item.className = 'grid-item';
      
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const mediaEl = new Image();
        mediaEl.src = `portfolio/${filename}`;
        mediaEl.loading = 'lazy';
        mediaEl.onload = () => resolve({ element: item, ratio: mediaEl.naturalWidth / mediaEl.naturalHeight });
        mediaEl.onerror = () => resolve(null);
        item.appendChild(mediaEl);
      } 
      else if (lower.endsWith('.mp4')) {
        const mediaEl = document.createElement('video');
        mediaEl.muted = true; // High priority for faster loading
        mediaEl.playsInline = true;
        mediaEl.preload = 'metadata';
        
        const src = document.createElement('source');
        src.src = `portfolio/${filename}`;
        src.type = 'video/mp4';
        mediaEl.appendChild(src);

        mediaEl.onloadedmetadata = () => resolve({ element: item, ratio: mediaEl.videoWidth / mediaEl.videoHeight || 1.77 });
        mediaEl.onerror = () => resolve(null);
        item.appendChild(mediaEl);
      } else {
        resolve(null);
      }
    });
  }

  loadManifest();
})();
