<script>
    var deferredPrompt;
    if (!window.Promise) {
        window.Promise = Promise;
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('Service worker registered!', reg);
                })
                .catch(err => {
                    console.log('Service worker registration failed: ', err);
                });
        });
    }

    window.addEventListener('beforeinstallprompt', function(event) {
        console.log('beforeinstallprompt fired');
        event.preventDefault();
        deferredPrompt = event;
        return false;
    });
</script>
