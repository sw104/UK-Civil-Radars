/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

/*
 * Showthread Page Controller
 */

(function(window, document, $, undefined) {

	/* Auxiliary Storage */
	var Storage = {
		_data: {},
		setItem: function(id, val) {
			this._data[id] = String(val);
			return this._data[id];
		},
		getItem: function(id) {
			return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
		},
		removeItem: function(id) {
			return delete this._data[id];
		},
		clear: function() {
			this._data = {};
			return this._data;
		}
	};

	// Allow Incognito / Private browsing to still function in Safari
	function isLocalStorage() {
		var item = 'localStoragePollyfill';
		try {
			window.localStorage.setItem(item, item);
			window.localStorage.removeItem(item);
			return true;
		}
		catch (e) {
			return false;
		}
	}

	/* Global API */
	var vB_Thread_Store = {
		// Main entry point.
		init: function(options) {
			return _instance || new StoreLoader(options);
		},
		fetch_threadinfo: function(threadid, page, callback) {
			return _fetchThreadInfo(threadid, page, callback);
		},
		mark_thread_read: function(threadid, forumid, time) {
			return _markThreadRead(threadid, forumid, time);
		},
		record_thread_view: function(threadid) {
			return _recordThreadView(threadid);
		}
	};

	// Private Functions
	var _clearStorage = function() {
		var arr = [],
			prefix = COOKIE_PREFIX + 't',
			prefix_length = COOKIE_PREFIX.length + 1,
			i;

		if (_localstorage) {
			// Iterate over localStorage and insert the keys that meet the condition into arr
			for (i = 0; i < window.localStorage.length; i++) {
				if (window.localStorage.key(i).substring(0, prefix_length) == prefix) {
					arr.push(window.localStorage.key(i));
				}
			}

			// Iterate over arr and remove the items by key
			for (i = 0; i < arr.length; i++) {
				window.localStorage.removeItem(arr[i]);
			}
		}
		else {
			Storage.clear();
		}
	};

	var _fetchThreadInfo = function(threadid, page, callback) {
		var threadid, page;

		if (isNaN(threadid) && isNaN(page)) {
			return _threadinfo;
		}
		else if (isNaN(threadid)) {
			threadid = _threadinfo.threadid;
		}
		else if (isNaN(page)) {
			page = _threadinfo.page;
		}

		var localinfo;
		if (_localstorage) {
			localinfo = window.localStorage.getItem(COOKIE_PREFIX + 't' + threadid + '-' + page);
		}
		else {
			localinfo = Storage.getItem(COOKIE_PREFIX + 't' + threadid + '-' + page);
		}

		if (localinfo) {
			return window.JSON.parse(localinfo);
		}
		else {
			_requestThreadPage(threadid, page, callback);
		}
		return false;
	};

	var _requestThreadPage = function(threadid, pagenum, callback) {

		var requrl = _requesturl
						.replace('{tid}', threadid)
						.replace('{page}', pagenum);

		$.ajax({
			url: requrl,
			method: "POST",
			data: {
				ajax: 1,
				t: threadid,
				page: pagenum,
				securitytoken: SECURITYTOKEN
			},
			dataType: "json",
			timeout: 20000,
		})
		.then(function (response) {
			var respage = parseInt(response.page);

			// Update if page requested is not the same as the response
			if (pagenum != respage) {
				pagenum = respage;
			}

			// Save in browser storage
			if (_localstorage) {
				window.localStorage.setItem(COOKIE_PREFIX + 't' + threadid + '-' + pagenum, window.JSON.stringify(response));
			}
			else {
				Storage.setItem(COOKIE_PREFIX + 't' + threadid + '-' + pagenum, window.JSON.stringify(response));
			}

			// Update QR last post time
			if (typeof ajax_last_post != "undefined") {
				ajax_last_post['t' + threadid] = response.effective_lastpost;
			}

			// Set if threadinfo is null
			if (!_threadinfo) {
				_threadinfo = response;
			}

			if (callback != undefined) {
				callback(response);
			}
		})
		.fail(function (err) {
			console.error(err.toString())
		});
	};

	var _markThreadRead = function(threadid, forumid, time) {
		$.ajax({
			url: "ajax.php?do=markthreadread",
			method: "POST",
			data: {
				ajax: 1,
				threadid: threadid,
				forumid: forumid,
				time: time,
				securitytoken: SECURITYTOKEN
			},
			dataType: "json",
			timeout: 1000,
		});
	};

	var _recordThreadView = function(threadid) {
		$.ajax({
			url: "ajax.php?do=recordthreadview",
			method: "POST",
			data: {
				ajax: 1,
				threadid: threadid,
				securitytoken: SECURITYTOKEN
			},
			dataType: "json",
			timeout: 500,
		});
	};

	/* Constructor */
	function StoreLoader(options) {
		// Check if local storage is available
		_localstorage = isLocalStorage();
		// Clear the local storage
		// To clear all: window.localStorage.clear();
		_clearStorage();

		var tid = parseInt(options.threadid),
			page = parseInt(options.page);

		_requesturl = options.requesturl || 'showthread.php?t={tid}&page={page}';

		// Save in the local storage the short version of thread info
		if (tid > 0) {
			_threadinfo = options;

			// Request and save in the local storage the complete version of thread info
			_fetchThreadInfo(tid, page, function(response){
				_threadinfo = response;
			});
		}

	}

	/* Private variables */
	var _instance; //Singleton
	var _threadinfo;
	var _localstorage;
	var _requesturl;

	// Expose Thread Store as a global variable
	window.vB_Thread_Store = vB_Thread_Store;

}(window, document, window.jQuery));
