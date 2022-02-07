var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then(function() {
			console.log('Service worker registered!');
		})
		.catch(function(err) {
			console.log(err);
		});
}

window.addEventListener('beforeinstallprompt', function(event) {
	console.log('beforeinstallprompt fired');
	event.preventDefault();
	deferredPrompt = event;
	return false;
});

function displayConfirmNotification() {
	if('serviceWorker' in navigator) {
		var options = {
			body: 'You have Successfully subscribed to our Notification service!',
			icon: '/src/images/icons/app-icon-96x96.png',
			image: '/src/images/sf-boat.jpg',
			dir: 'ltr',
			lang: 'en-US', // BCP 47
			vibrate: [100, 50, 200],
			badge: 'src/images/icons/app-icon-96x96.png',
			tag: 'confirm-notification',
			renotify: true,
			actions: [
				{ action: 'confirm', title: 'Okay', icon: 'src/images/icons/app-icon-96x96.png' },
				{ action: 'cancel', title: 'Cancel', icon: 'src/images/icons/app-icon-96x96.png' }
			]
		};

		navigator.serviceWorker.ready
		 .then(function(swreg) {
		 	swreg.showNotification('Successfully subscribed (from SW)!', options);
		 });


		// navigator.serviceWorker.register('sw.js')
		//   .then(function(swreg) {
		//   	swreg.showNotification('Successfully subscribed (from SW)!', options);
		//   });

	}
}

function configurePushSub() {
	if(!('serviceWorker' in navigator)) {
		return;
	}
	var reg;
	navigator.serviceWorker.ready
	 .then(function(swreg) {
	 	reg = swreg;
	 	return swreg.pushManager.getSubscription();
	 })
	 .then(function(sub) {
	 	if(sub === null) {
	 		// Create a new subscription
	 		reg.pushManager.subscribe({
	 			userVisibleOnly: true
	 		});
	 	} else {
	 		// We have a subscription
	 	}

	 });
}

// Ask permission to user to get the notification 
function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
    	// configurePushSub();
    	displayConfirmNotification();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}

// if ('Notification' in window) {
//   for (var i = 0; i < enableNotificationsButtons.length; i++) {
//     enableNotificationsButtons[i].style.display = 'inline-block';
//     enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
//   }
// }


// Unregister Service Worker
// navigator.serviceWorker.getRegistrations().then(function(registrations) {
//  for(let registration of registrations) {
//   	registration.unregister()
//   } 
// });

// var promise = new Promise(function(resolve, reject) {
//   setTimeout(function() {
//   	// resolve('This is executed once the timer is done!');
//   	reject({code: 500, message: 'An error occured!'});
//   	// console.log('This is executed once the timer is done!');
//   }, 3000);	
// });


// // Traditional Ajax request

// var xhr = new XMLHttpRequest();
// xhr.open('GET', 'http://httpbin.org/ip');
// xhr.responseType = 'json';

// xhr.onload = function() {
// 	console.log(xhr.response);
// };

// xhr.onerror = function() {
// 	console.log('Error!');
// };

// xhr.send();



// fetch('http://httpbin.org/ip')
// 	.then(function(response) {
// 		console.log(response);
// 		return response.json();
// 	})
// 	.then(function(data) {
// 		console.log(data);
// 	})
// 	.catch(function(err) {
// 		console.log(err);
// 	});

// fetch('http://httpbin.org/post', {
// 	method: 'POST',
// 	headers: {
// 		'Content-Type': 'application/json',
// 		'Accept': 'application/json' 
// 	},
// 	mode: 'cors',
// 	body: JSON.stringify({message: 'Does this work?'})
// })
// 	.then(function(response) {
// 		console.log(response);
// 		return response.json();
// 	})
// 	.then(function(data) {
// 		console.log(data);
// 	})
// 	.catch(function(err) {
// 		console.log(err);
// 	});

// // promise.then(function(text) {
// // 	return text;
// // }, function(err) {
// // 	console.log(err.code, err.message)
// // }).then(function(newText) {
// // 	console.log(newText);
// // });

// promise.then(function(text) {
// 	return text;
// }).then(function(newText) {
// 	console.log(newText);
// }).catch(function(err) {
// 	console.log(err.code, err.message);
// });


// console.log('This is executed right after setTimeout()');