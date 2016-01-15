(function () {
	angular.module("bad-habit-catcher", [
		"bad-habit-catcher.controllers",
		"bad-habit-catcher.directives",
		"bad-habit-catcher.filters",
		"bad-habit-catcher.services",
		"ionic",
		"ngResource",
		"ionic-native-transitions"
	])

	.run(function ($ionicPlatform, Storage) {
		$ionicPlatform.ready(function () {
			if(window.cordova && window.cordova.plugins.Keyboard) {
				// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
				// for form inputs)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

				// Don't remove this line unless you know what you are doing. It stops the viewport
				// from snapping when text inputs are focused. Ionic handles this internally for
				// a much nicer keyboard experience.
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if(window.StatusBar) {
				StatusBar.styleDefault();
			}

			Storage.init();
		});
	})

	.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider) {
		$ionicConfigProvider.scrolling.jsScrolling(false);

		$ionicNativeTransitionsProvider.setDefaultOptions({
			duration: 700, // in milliseconds (ms), default 400,
			slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
			iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
			androiddelay: -1, // same as above but for Android, default -1
			winphonedelay: -1, // same as above but for Windows Phone, default -1,
			fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
			fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
			triggerTransitionEvent: "$ionicView.afterEnter", // internal ionic-native-transitions option
			backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
		});
		$ionicNativeTransitionsProvider.setDefaultTransition({
			type: "slide",
			direction: "left"
		});
		$ionicNativeTransitionsProvider.setDefaultBackTransition({
			type: "slide",
			direction: "right"
		});
		$ionicNativeTransitionsProvider.enable(true, false);

		$stateProvider
		.state("app", {
			url: "/app",
			abstract: true,
			templateUrl: "templates/abstract.html"
		})
		.state("app.main", {
			url: "/main",
			views: {
				"main": {
					templateUrl: "templates/main/index.html",
					controller: "MainController"
				}
			}
		})
		.state("app.settings", {
			url: "/settings",
			views: {
				"main": {
					templateUrl: "templates/settings/index.html",
					controller: "SettingsController"
				}
			}
		})
		.state("app.stats", {
			url: "/stats",
			views: {
				"main": {
					templateUrl: "templates/stats/index.html",
					controller: "StatsController"
				}
			}
		});

		$urlRouterProvider.otherwise("/app/main");
	});
})();