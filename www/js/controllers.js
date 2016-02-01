(function () {
	angular.module("bad-habit-catcher.controllers", [])

	.controller("MainController", function ($scope, $ionicPopup, Storage, SessionService) {
		$scope.sessionService = SessionService;
		$scope.tap = function () {
			Storage.taps.add();
		};
	})

	.controller("SettingsController", function ($scope, $ionicPopup, Storage, DaysPerSession, SessionService, Settings) {
		$scope.selected = {};
		$scope.sessionService = SessionService;
		$scope.settings = {
			vibrateOnTap: Settings.get().vibrateOnTap,
			exitOnTap: Settings.get().exitOnTap
		};

		$scope.$watchCollection("settings", function (newValue, oldValue) {
			Settings.set(newValue);
		});

		Storage.badHabits.getAll().then(function (badHabits) {
			$scope.badHabits = badHabits;
		});

		if(!SessionService.noSession) {
			Storage.badHabits.getAll().then(function (badHabits) {
				Storage.sessions.getCurrent().then(function (currentSession) {
					for(var i = 0; i < badHabits.length; i++) {
						if(badHabits[i].id === currentSession.bad_habit_id) {
							$scope.currentBadHabit = badHabits[i];
							break;
						}
					}
				});
			});
		}

		$scope.addSession = function () {
			Storage.sessions.add($scope.selected.badHabit.id).then(function () {
				Storage.sessions.getCurrent().then(function (currentSession) {
					SessionService.init(currentSession);
					SessionService.noSession = false;
					$scope.currentBadHabit = {
						id: $scope.selected.badHabit.id,
						name: $scope.selected.badHabit.name
					}
				});
			});
		};

		$scope.endSession = function () {
			var confirmEndSession = $ionicPopup.confirm({
				title: "End Session",
				template: "<strong>Warning</strong>: Your data for this session will not be recorded.<br /><br />Are you sure you want to end this session?"
			});

			confirmEndSession.then(function (result) {
				if(result) {
					Storage.sessions.end(true).then(function () {
						SessionService.end();
						SessionService.noSession = true;
					});
				}
			});
		};
	})

	.controller("StatsController", function ($scope, $timeout, Storage) {
		$scope.refresh = function () {
			Storage.badHabits.getAll().then(function (badHabits) {
				$scope.badHabits = badHabits;
			});
		};
		$scope.refresh();
	})

	.controller("BadHabitStatsController", function ($scope, $stateParams, $ionicModal, Storage, DaysPerSession) {
		$scope.viewTitle = $stateParams.badHabitName;
		$scope.sessionsData = {};
		$scope.selectedSessionData = {};

		var getOrdinal = function (number) {
			var s = ["th", "st", "nd", "rd"],
				v  = number % 100;

			return number + (s[(v-20)%10]||s[v]||s[0]);
		};

		Storage.sessions.getByBadHabitId($stateParams.badHabitId).then(function (sessions) {
			var sessionsData = {
					ids: [],
					labels: [],
					series: [],
					data: [[]]
				},
				asyncCounter = 0;

			for(var i = 0; i < sessions.length; i++) {
				Storage.taps.getBySessionId(sessions[i].id).then(function (taps) {
					sessionsData.ids.push(sessions[asyncCounter].id);
					sessionsData.labels.push(getOrdinal(sessions.length - asyncCounter));
					sessionsData.data[0].push(taps.length);

					if(asyncCounter === (sessions.length - 1)) {
						$scope.sessionsData = sessionsData;
					}
					asyncCounter++;
				});
			}
		});

		$ionicModal.fromTemplateUrl("templates/stats/session-viewer-modal.html", {
			scope: $scope,
			animation: "jelly"
		}).then(function (modal) {
			$scope.sessionViewerModal = modal;
		});

		$scope.$on("modal.hidden", function () {
			$scope.selectedSessionData = {
				labels: [],
				series: [],
				data: [[]]
			};
		});

		$scope.openSessionViewer = function (points, event) {
			var selectedSessionData = {
				labels: [],
				series: [],
				data: [[]]
			};

			for(var i = 0; i < $scope.sessionsData.labels.length; i++) {
				if($scope.sessionsData.labels[i] === points[0].label) {
					selectedSessionData.id = $scope.sessionsData.ids[i];
					break;
				}
			}

			Storage.sessions.get(selectedSessionData.id).then(function (session) {
				var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
					dateStarted = new Date(Number(session.date_started)),
					dateFormatOptions = {
						year: "numeric",
						month: "short",
						day: "numeric"
					};

				Date.prototype.addDays = function (days) {
					this.setDate(this.getDate() + parseInt(days));
					return this;
				};

				Storage.taps.getBySessionId(selectedSessionData.id).then(function (taps) {
					for(var i = 0; i < DaysPerSession; i++) {
						var dateWithAddedDays = dateStarted.addDays(i).toLocaleDateString(dateFormatOptions).split(" ").join("-");
						selectedSessionData.labels.push(dateWithAddedDays);
						selectedSessionData.data[0][i] = 0;

						for(j = 0; j < taps.length; j++) {
							var dateTapped = new Date(Number(taps[j].date_tapped)).toLocaleDateString(dateFormatOptions).split(" ").join("-");

							if(dateWithAddedDays === dateTapped) {
								selectedSessionData.data[0][i] += 1;
							}
						}
						$scope.selectedSessionData = selectedSessionData;
					}
				});
			});

			$scope.sessionViewerModal.show();
		};

		$scope.closeSessionViewer = function () {
			$scope.sessionViewerModal.hide();
		};
	})
})();