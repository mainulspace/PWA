<?php
add_action('wp_footer', 'install_service_worker');
function install_service_worker() { ?>
    <script>
        if (!window.Promise) {
            window.Promise = Promise;
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js?VER=11')
                .then(reg => {
                    console.log('Service worker registered!', reg);
                })
                .catch(err => {
                    console.log('Service worker registration failed: ', err);
                });
            });
        }
    </script>

<?php } ?>