// portfolio/portfolio-loader.js
// Fetches portfolio/manifest.json and renders PNGs and MP4s into the #contact .grid-container
// Place this file in the 'portfolio' folder (or update the fetch path accordingly).

(async function () {
  // Wait for DOM
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  async function loadManifest() {
    try {
      const res = await fetch('portfolio/manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch manifest: ' + res.status);
      const files = await res.json();
      if (!Array.isArray(files)) throw new Error('Manifest is not an array');

      // Clear any placeholder content
      grid.innerHTML = '';

      files.forEach(name => {
        if (!name || typeof name !== 'string') return;
        const lower = name.toLowerCase();
        if (!(lower.endsWith('.png') || lower.endsWith('.mp4'))) return;

        const item = document.createElement('div');
        item.className = 'grid-item';

        if (lower.endsWith('.png')) {
          const img = document.createElement('img');
          img.src = `portfolio/${name}`;
          img.alt = name.replace(/\.(png)$/i, '').replace(/[-_]/g, ' ');
          img.loading = 'lazy';
          img.decoding = 'async';
          item.appendChild(img);
        } else if (lower.endsWith('.mp4')) {
          const video = document.createElement('video');
          video.controls = true;
          video.preload = 'metadata';
          video.playsInline = true;
          // Optional: add muted attribute if you want autoplaying previews later
          const src = document.createElement('source');
          src.src = `portfolio/${name}`;
          src.type = 'video/mp4';
          video.appendChild(src);
          // Add a small label for very long filenames (optional)
          item.appendChild(video);
        }

        grid.appendChild(item);
      });

      // Add an optional info line (file count)
      const info = document.createElement('div');
      info.className = 'portfolio-info';
      info.style.gridColumn = '1 / -1';
      info.style.padding = '0.25rem 0.5rem';
      info.style.fontSize = '0.9rem';
      info.style.color = 'var(--muted-color, #555)';
      info.textContent = `${files.filter(f => /\.(png|mp4)$/i.test(f)).length} items`;
      grid.insertBefore(info, grid.firstChild);
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<p>Could not load portfolio. Check portfolio/manifest.json and file paths.</p>';
    }
  }

  // Load immediately. If you prefer to load only when the contact tab is activated,
  // change this to wait for the tab activation event and call loadManifest() there.
  loadManifest();
})();
