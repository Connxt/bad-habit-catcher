(function () {
	angular.module("bad-habit-catcher", [
		"bad-habit-catcher.controllers",
		"bad-habit-catcher.directives",
		"bad-habit-catcher.filters",
		"bad-habit-catcher.services",
		"ionic",
		"ngResource",
		"ngCordova",
		"chart.js"
	])

	.run(function ($ionicPlatform, Storage, SessionService) {
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

			Storage.init().then(function () {
				Storage.sessions.getCurrent().then(function (currentSession) {
					SessionService.init(currentSession);
					if(Object.keys(currentSession).length >= 1) {
						SessionService.noSession = false;
					}
					else {
						SessionService.noSession = true;
					}
				});
			});
		});
	})

	.config(function ($compileProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, ChartJsProvider) {
		var isProduction = false;
		if(isProduction) {
			$compileProvider.debugInfoEnabled(false);
		}

		$ionicConfigProvider.scrolling.jsScrolling(false);
		$ionicConfigProvider.views.forwardCache(true);

		ChartJsProvider.setOptions({ responsive: true });
		// $ionicNativeTransitionsProvider.setDefaultOptions({
		// 	duration: 300, // in milliseconds (ms), default 400,
		// 	slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
		// 	iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
		// 	androiddelay: -1, // same as above but for Android, default -1
		// 	winphonedelay: -1, // same as above but for Windows Phone, default -1,
		// 	fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
		// 	fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
		// 	triggerTransitionEvent: "$ionicView.afterEnter", // internal ionic-native-transitions option
		// 	backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
		// });
		// $ionicNativeTransitionsProvider.setDefaultTransition({
		// 	type: "slide",
		// 	direction: "left"
		// });
		// $ionicNativeTransitionsProvider.setDefaultBackTransition({
		// 	type: "slide",
		// 	direction: "right"
		// });
		// $ionicNativeTransitionsProvider.enable(true, false);

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
		})
		.state("app.bad-habit-stats", {
			url: "/bad-habit-stats/:badHabitId/:badHabitName",
			cache: false,
			views: {
				"main": {
					templateUrl: "templates/stats/bad-habit-stats.html",
					controller: "BadHabitStatsController"
				}
			}
		});

		$urlRouterProvider.otherwise("/app/main");
	})

	.constant("StorageConfig", {
		name: "bad_habit_catcher.db",
		version: "1.0",
		description: "asd",
		tables: [{
			name: "bad_habits",
			columns: [
				{ name: "id", type: "integer primary key" },
				{ name: "name", type: "text" }
			],
			data: [
				{ id: "1", name: "anger" },
				{ id: "2", name: "slander" },
				{ id: "3", name: "lustful thoughts" },
				{ id: "4", name: "physical violence" },
				{ id: "5", name: "breaking promises" },
				{ id: "6", name: "lying" }
			]
		}, {
			name: "sessions",
			columns: [
				{ name: "id", type: "integer primary key" },
				{ name: "bad_habit_id", type: "integer" },
				{ name: "date_started", type: "text" },
				{ name: "date_finished", type: "text" }
			]
		}, {
			name: "taps",
			columns: [
				{ name: "id", type: "integer primary key" },
				{ name: "session_id", type: "integer" },
				{ name: "date_tapped", type: "text" }
			]
		}, {
			name: "settings",
			columns: [
				{ name: "id", type: "integer primary key" },
				{ name: "vibrate_on_tap", type: "integer" },
				{ name: "exit_on_tap", type: "integer" }
			],
			data: [
				{ id: "1", vibrate_on_tap: "1", exit_on_tap: "0" }
			]
		}]
	})

	.constant("DefaultSettings", {
		vibrateOnTap: true,
		exitOnTap: false,
		key: "bad-habit-catcher.settings"
	})

	.constant("DaysPerSession", 7);
})();