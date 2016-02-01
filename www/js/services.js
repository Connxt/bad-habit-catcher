(function () {
	angular.module("bad-habit-catcher.services", [])

	.factory("Storage", function ($q, $ionicPlatform, $cordovaSQLite, $cordovaVibration, StorageConfig, DaysPerSession, Settings) {
		var db;

		return {
			init: function () {
				var deferred = $q.defer();

				if(window.cordova) {
					db = $cordovaSQLite.openDB({ name: StorageConfig.name, androidDatabaseImplementation: 2, androidLockWorkaround: 1});
				}
				else {
					db = window.openDatabase(StorageConfig.name, StorageConfig.version, StorageConfig.description, 2 * 1024 * 1024);
				}

				db.transaction(function (tx) {
					for(var i = 0; i < StorageConfig.tables.length; i++) {
						var createTablesSql = "CREATE TABLE IF NOT EXISTS " + StorageConfig.tables[i].name + " (",
							columns = StorageConfig.tables[i].columns;

						for(var j = 0; j < columns.length; j++) {
							createTablesSql += columns[j].name + " " + columns[j].type;

							if(j === (columns.length - 1)) {
								createTablesSql += "); ";
							}
							else {
								createTablesSql += ", ";
							}
						}
						tx.executeSql(createTablesSql);

						var data = StorageConfig.tables[i].data;
						if(data) {
							for(var j = 0; j < data.length; j++) {
								var insert = "INSERT INTO '" + StorageConfig.tables[i].name + "' (",
									values = "VALUES (";

								for(var key in data[j]) {
									insert += key + ", ";
									values += "'" + data[j][key] + "', "
								}

								insert = insert.substring(0, insert.length - 2) + ") ";
								values = values.substring(0, values.length - 2) + ") ";

								tx.executeSql(insert + values);
							}
						}
					}

					return deferred.resolve(true);
				});

				return deferred.promise;
			},
			badHabits: {
				getAll: function () {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM bad_habits", [], function (tx, results) {
							var data = [];
							for(var i = 0; i < results.rows.length; i++) {
								data.push(results.rows.item(i));
							}

							deferred.resolve(data);
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				get: function (id) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM bad_habits WHERE id=" + id, [], function (tx, results) {
							deferred.resolve(results.rows.item(0));
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				}
			},
			sessions: {
				getAll: function () {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM sessions", [], function (tx, results) {
							var data = [];
							for(var i = 0; i < results.rows.length; i++) {
								data.push(results.rows.item(i));
							}

							deferred.resolve(data);
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				get: function (id) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM sessions WHERE id=" + id, [], function (tx, results) {
							deferred.resolve(results.rows.item(0));
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				getCurrent: function () {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM sessions WHERE date_finished IS NULL OR date_finished=''", [], function (tx, results) {
							if(results.rows.length >= 1) {
								deferred.resolve(results.rows.item(0));
							}
							else {
								deferred.resolve({});
							}
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				getByBadHabitId: function (badHabitId) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM sessions WHERE (date_finished IS NOT NULL OR date_finished!='') AND bad_habit_id=" + badHabitId, [], function (tx, results) {
							var data = [];
							for(var i = 0; i < results.rows.length; i++) {
								data.push(results.rows.item(i));
							}

							deferred.resolve(data);
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				add: function (badHabitId) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT MAX(id) as max_id FROM sessions", [], function (tx, results) {
							var maxId = results.rows.item(0).max_id;

							tx.executeSql("UPDATE sessions SET date_finished='" + new Date().getTime() + "' WHERE id=" + maxId, [], function (tx) {
								tx.executeSql("INSERT INTO sessions (bad_habit_id, date_started) VALUES ('" + badHabitId + "','" + new Date().getTime() + "') ", [], function (tx, results) {
									deferred.resolve(results.insertId);
								}, function (tx, error) {
									deferred.reject(error);
								});
							}, function (tx, error) {
								deferred.reject(error);
							});
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				end: function (withForce) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						if(withForce) {
							tx.executeSql("SELECT * FROM sessions WHERE date_finished IS NULL OR date_finished=''", [], function (tx, results) {
								var session = results.rows.item(0);
								
								tx.executeSql("DELETE FROM sessions WHERE id=" + session.id, [], function () {
									deferred.resolve(true);
								})
							}, function (tx, error) {
								deferred.reject(error);
							});
						}
						else {
							tx.executeSql("SELECT MAX(id) as max_id FROM sessions", [], function (tx, results) {
								var maxId = results.rows.item(0).max_id;

								tx.executeSql("UPDATE sessions SET date_finished='" + new Date().getTime() + "' WHERE id=" + maxId, [], function (tx) {
									deferred.resolve(true);
								}, function (tx, error) {
									deferred.reject(error);
								});
							}, function (tx, error) {
								deferred.reject(error);
							});
						}
					});

					return deferred.promise;
				}
			},
			taps: {
				getAll: function () {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM taps", [], function (tx, results) {
							var data = [];
							for(var i = 0; i < results.rows.length; i++) {
								data.push(results.rows.item(i));
							}

							deferred.resolve(data);
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				get: function (id) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM taps WHERE id=" + id, [], function (tx, results) {
							deferred.resolve(results.rows.item(0));
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				getBySessionId: function (sessionId) {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM taps WHERE session_id=" + sessionId, [], function (tx, results) {
							var data = [];
							for(var i = 0; i < results.rows.length; i++) {
								data.push(results.rows.item(i));
							}

							deferred.resolve(data);
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				},
				add: function () {
					var deferred = $q.defer();
					console.log(self);

					db.transaction(function (tx) {
						tx.executeSql("SELECT MAX(id) as max_id FROM sessions", [], function (tx, results) {
							var maxId = results.rows.item(0).max_id;

							tx.executeSql("INSERT INTO taps (session_id, date_tapped) VALUES ('" + maxId + "','" + new Date().getTime() + "') ", [], function (tx, results) {
								deferred.resolve(results.insertId);

								if(Settings.get().vibrateOnTap) {
									if(window.cordova) $cordovaVibration.vibrate(200);
								}

								if(Settings.get().exitOnTap) {
									window.close();
								}
							}, function (tx, error) {
								deferred.reject(error);
							});
						}, function (tx, error) {
							deferred.reject(error);
						});
					});

					return deferred.promise;
				}
			}
		};
	})

	.factory("SessionService", function ($interval, Storage, DaysPerSession) {
		var session = {},
			currentSession = {},
			timer,
			millisLeft = 0;

		return {
			init: function (session) {
				var self = this;
				currentSession = session;

				if(Object.keys(currentSession).length >= 1) {
					millisLeft = 0;
					timer = $interval(function () {
						var sessionEndDate = new Date(Number(currentSession.date_started) + (DaysPerSession * (1000 * 60 * 60 * 24))).getTime();
						// var sessionEndDate = new Date(Number(currentSession.date_started) + 5000).getTime();
						self.timeLeft.set(Date.now() - sessionEndDate);
						
						if(Date.now() >= sessionEndDate) {
							Storage.sessions.end().then(function () {
								self.end();
								self.noSession = true;

								Storage.sessions.getCurrent().then(function (currentSession) {
									self.init(currentSession);
								});
							});
						}
					}, 1000);
				}
			},
			end: function () {
				$interval.cancel(timer);
				currentSession = {};
				this.init(currentSession);
			},
			timeLeft: {
				set: function (millis) {
					if(millis >= 0) {
						millisLeft = millis;
					}
					else {
						millisLeft = millis * -1;
					}
				},
				get: function () {
					var milliseconds = millisLeft;

					var seconds = Math.floor(milliseconds / 1000);
					milliseconds = milliseconds % 1000;

					var minutes = Math.floor(seconds / 60);
					seconds = seconds % 60;

					var hours = Math.floor(minutes / 60);
					minutes = minutes % 60;

					return {
						hours: hours,
						minutes: minutes,
						seconds: seconds,
						totalMillis: millisLeft
					};
				}
			},
			noSession: false
		};
	})

	.factory("Settings", function (DefaultSettings) {
		var settings = window.localStorage[DefaultSettings.key];

		if(!settings) {
			window.localStorage[DefaultSettings.key] = angular.toJson(DefaultSettings);
			settings = window.localStorage[DefaultSettings.key];
		}

		return {
			set: function (obj) {
				window.localStorage[DefaultSettings.key] = angular.toJson(obj);
				settings = window.localStorage[DefaultSettings.key];
			},
			get: function () {
				if(settings) {
					return angular.fromJson(settings);
				}
				else {
					return {};
				}
			}
		};
	});
})();