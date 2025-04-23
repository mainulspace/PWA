<script>
  // 1. Register the Service Worker with explicit scope
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(registration => {
          console.log('[SW] Registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('[SW] Registration failed:', err);
        });
    });
  }

  // 2. Capture the install prompt and defer it
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt fired');

    // Optionally, show your custom install button now
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'inline-block';
      installBtn.addEventListener('click', async () => {
        // Hide the install button, show the prompt
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User response to the install prompt:', outcome);
        deferredPrompt = null;
      });
    }
  });

  // 3. Listen for the appinstalled event
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    // You can hide your install button here if it’s still visible
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.style.display = 'none';
  });
</script>