<?php 
$custom_folder = array();
$dir = $_SERVER['DOCUMENT_ROOT'].'/custom_folder/';
$custom_folder = '/custom_folder/';
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if(!in_array($file,array(".",".."))){
                $custom_folder[] = $custom_folder.$file;
            }

        }
        closedir($dh);
    }
}

$custom_folder = implode(",", $custom_folder);

?>

<!-- Registering service worker at the bottom of the index page -->

<script>
     var custom_folder = <?php echo json_encode($custom_folder); ?>;

     var deferredPrompt;

    if (!window.Promise) {
        window.Promise = Promise;
    }

    if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js?custom_folder=' + custom_folder)
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