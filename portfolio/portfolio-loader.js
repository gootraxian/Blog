// portfolio/portfolio-loader.js
(async function () {
  // Wait for DOM
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  // Helper: Load media to determine aspect ratio
  function createMediaItem(filename) {
    return new Promise((resolve) => {
      const lower = filename.toLowerCase();
      const item = document.createElement('div');
      item.className = 'grid-item';
      
      let mediaEl;
      let type = 'unknown';

      // --- HANDLE IMAGES ---
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        type = 'image';
        mediaEl = document.createElement('img');
        mediaEl.src = `portfolio/${filename}`;
        mediaEl.alt = filename.replace(/\.(png|jpe?g)$/i, '').replace(/[-_]/g, ' ');
        mediaEl.loading = 'lazy';
        mediaEl.decoding = 'async';

        // Resolve when we know dimensions
        mediaEl.onload = () => {
          const ratio = mediaEl.naturalWidth / mediaEl.naturalHeight;
          resolve({ element: item, ratio: ratio, type: 'image' });
        };
        mediaEl.onerror = () => resolve(null); // Skip broken files
        item.appendChild(mediaEl);
      } 
      
      // --- HANDLE VIDEOS ---
      else if (lower.endsWith('.mp4')) {
        type = 'video';
        mediaEl = document.createElement('video');
        mediaEl.controls = true;
        mediaEl.preload = 'metadata'; // Important for dimensions
        mediaEl.playsInline = true;

        const src = document.createElement('source');
        src.src = `portfolio/${filename}`;
        src.type = 'video/mp4';
        mediaEl.appendChild(src);

        // Resolve when metadata (dimensions) loads
        mediaEl.onloadedmetadata = () => {
          const ratio = mediaEl.videoWidth / mediaEl.videoHeight;
          resolve({ element: item, ratio: ratio || 1.77, type: 'video' }); // Fallback to 16:9
        };
        mediaEl.onerror = () => resolve(null);
        item.appendChild(mediaEl);
      } else {
        resolve(null); // Not a supported file type
      }
    });
  }

  async function loadManifest() {
    try {
      const res = await fetch('portfolio/manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch manifest: ' + res.status);
      const files = await res.json();
      if (!Array.isArray(files)) throw new Error('Manifest is not an array');

      grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Loading portfolio...</p>';

      // 1. Process all files in parallel to get their elements and ratios
      const promises = files
        .filter(f => typeof f === 'string')
        .map(filename => createMediaItem(filename));
      
      const results = await Promise.all(promises);

      // 2. Filter out failures and Sort by Aspect Ratio (Descending)
      // High ratio (> 1) = Landscape
      // Low ratio (< 1) = Portrait
      const sortedItems = results
        .filter(item => item !== null)
        .sort((a, b) => b.ratio - a.ratio); // Sorts Wide -> Tall

      // Clear loading message
      grid.innerHTML = '';

      // 3. Append to Grid
      sortedItems.forEach(item => {
        // Optional: Add a class based on orientation for CSS styling
        if (item.ratio > 1.2) item.element.classList.add('orientation-landscape');
        else if (item.ratio < 0.8) item.element.classList.add('orientation-portrait');
        else item.element.classList.add('orientation-square');

        grid.appendChild(item.element);
      });

      // 4. Add Info Count
      const info = document.createElement('div');
      info.className = 'portfolio-info';
      info.style.gridColumn = '1 / -1';
      info.style.padding = '0.5rem';
      info.style.color = 'var(--muted-color, #555)';
      info.textContent = `${sortedItems.length} items`;
      grid.insertBefore(info, grid.firstChild);

    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p>Could not load portfolio.</p>';
    }
  }

  loadManifest();
})();
