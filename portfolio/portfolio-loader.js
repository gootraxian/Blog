(async function () {
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }

  const grid = document.querySelector('#contact .grid-container');
  if (!grid) return;

  async function processAndAppend(filename) {
    try {
      const itemData = await createMediaItem(filename);
      if (!itemData) return;

      const { element, ratio } = itemData;

      // Apply orientation classes
      if (ratio > 1.2) element.classList.add('orientation-landscape');
      else if (ratio < 0.8) element.classList.add('orientation-portrait');
      else element.classList.add('orientation-square');

      grid.appendChild(element);
    } catch (e) {
      console.error("Error loading:", filename, e);
    }
  }

  function createMediaItem(filename) {
    return new Promise((resolve) => {
      const lower = filename.toLowerCase();
      const item = document.createElement('div');
      item.className = 'grid-item';
      
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const img = new Image();
        img.src = `portfolio/${filename}`;
        img.loading = 'lazy'; // Native browser optimization
        img.onload = () => resolve({ element: item, ratio: img.naturalWidth / img.naturalHeight });
        img.onerror = () => resolve(null);
        item.appendChild(img);
      } 
      else if (lower.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = `portfolio/${filename}`;
        
        // --- FIX: Video Playback ---
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true; // Required for mobile
        video.controls = false;   // Cleaner portfolio look, but change to true if you want bars
        
        // --- FIX: Loading Bottleneck ---
        video.preload = 'auto'; 

        video.onloadedmetadata = () => {
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
      const res = await fetch('portfolio/manifest.json');
      const files = await res.json();
      grid.innerHTML = ''; 

      // We process them in sequence or small batches to avoid the "6-file limit"
      for (const filename of files) {
        await processAndAppend(filename);
      }
    } catch (err) {
      grid.innerHTML = '<p>Could not load portfolio.</p>';
    }
  }

  loadManifest();
})();
