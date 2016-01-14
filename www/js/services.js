(function () {
	angular.module("bad-habit-catcher.services", [])

	.factory("StorageConfig", function () {
		return {
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
					{ name: "date_tapped", type: "text" },
				]
			}]
		};
	})

	.factory("Storage", function ($q, $ionicPlatform, StorageConfig) {
		var deferred = $q.defer(),
			db;

		return {
			init: function () {
				if(window.cordova) {
					db = $cordovaSQLite.openDB({ name: StorageConfig.name, androidDatabaseImplementation: 2, androidLockWorkaround: 1});
				}
				else {
					db = window.openDatabase(StorageConfig.name, StorageConfig.version, StorageConfig.description, 2 * 1024 * 1024);
				}

				db.transaction(function (sqlite) {
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
						sqlite.executeSql(createTablesSql);

						if(StorageConfig.tables[i].data) {
							var insertDataSql = "INSERT INTO '" + StorageConfig.tables[i].name + "' ",
								data = StorageConfig.tables[i].data;

							for(var j = 0; j < data.length; j++) {
								if(j === 0) {
									insertDataSql += "SELECT " +
										"'" + data[j].id + "' AS 'id', " +
										"'" + data[j].name + "' AS 'name' ";
								}
								else {
									insertDataSql += "UNION ALL SELECT " +
										"'" + data[j].id + "', " +
										"'" + data[j].name + "' ";
								}
							}
							sqlite.executeSql(insertDataSql);
						}
					}
				});
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
				add: function () {
					var deferred = $q.defer();

					db.transaction(function (tx) {
						tx.executeSql("SELECT MAX(id) as max_id FROM sessions", [], function (tx, results) {
							var maxId = results.rows.item(0).max_id;
							
							tx.executeSql("INSERT INTO taps (session_id, date_tapped) VALUES ('" + maxId + "','" + new Date().getTime() + "') ", [], function (tx, results) {
								deferred.resolve(results.insertId);
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
})();