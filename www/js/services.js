(function () {
	angular.module("bad-habit-catcher.services", [])

	.factory("Storage", function ($q, $ionicPlatform) {
		var deferred = $q.defer(),
			db;

		$ionicPlatform.ready(fuction () {
			if(window.cordova) {
				db = $cordovaSQLite.openDB({ name: "kreyb.db", androidDatabaseImplementation: 2, androidLockWorkaround: 1});
			}
			else {
				db = window.openDatabase("kreyb.db", "1.0", "kreyb database", 2 * 1024 * 1024);				
			}

			db.transaction(function (sqlite) {
				sqlite.executeSql("CREATE TABLE IF NOT EXISTS ")
			});
		});

		return {
			clicks: {

			},
			accountabilities: {

			}
		};
	});
})();