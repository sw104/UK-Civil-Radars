/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

(function(window, document, $, undefined) {

	/* Global API */
	var vB_InfiniteScroll = {
		init: Init,
		off: function() {
			_options.active = 0;
		},
		on: function() {
			_options.active = 1;
		}
	};

	var MAIN_CONTENT_ID = 'main-content',
		MAX_PAGE_LOAD = 5;

	var _showPage = function(threadid, pagenum, adjust, delayed, forced) {
		var scrollTop = $(window).scrollTop(),
			newpage = document.getElementById('posts-' + threadid + '-' + pagenum),
			itemheight;

		var loader = $('#loadpost'),
			loadermsg = $(loader).find('#loadtext'),
			msg;

		var _doShowPage = function() {
			loader.hide();
			loadermsg.empty;
			$(newpage).removeAttr('style');

			// Check if we are loading the IS page limit
			if ($(newpage).data('pagelimit')) {
				_showBottom();
			}

			if (adjust) {
				// adjust scroll
				itemheight = $(newpage).height();
				window.scrollTo(0, scrollTop + itemheight);
			}

			// Run all the necessary JS on PostBits
			PostBit_Init(fetch_object('posts-' + threadid + '-' + pagenum));

			// Hook
			$(document).trigger('InfiniteScroll.ShowPageComplete', [threadid, pagenum]);
		};

		if (newpage && newpage.style.display == 'none') {
			if (delayed || forced) {
				var delay = 0;
				if (_delaytimeout) {
					clearTimeout(_delaytimeout);
				}

				if (delayed) {
					msg = $(loadermsg).data('thread') || '';
					delay = _options.delay;
				}
				else if (forced) {
					msg = $(loadermsg).data('post') || '';
				}
				loadermsg.html(msg);
				loader.show();

				_delaytimeout = setTimeout(_doShowPage, delay);
			}
			else {
				_doShowPage();
			}
		}
	};

	var _showBottom = function(visible) {
		visible = (typeof visible === 'undefined' ? true : visible);

		if (MASTERSTYLEID != -2 && MASTERSTYLEID != -4) {
			return;
		}

		if (visible) {
			$('footer').show();
			$('#debuginfo').show();
		}
		else {
			$('footer').hide();
			$('#debuginfo').hide();
		}
	};

	var _topPosition = function(e) {
		if (!e) {
			return 0;
		}
		return e.offsetTop + _topPosition(e.offsetParent);
	};

	var _mostlyVisible = function(element) {
		// if ca 75% of element is visible
		var isvisible = (element.style.display != 'none');
		if (isvisible) {
			var scrollPos = $(window).scrollTop(),
				windowHeight = window.innerHeight, //Using innerHeight to take into factor of padding (magicbar)
				eHeight = $(element).height(),
				eTop = $(element).offset().top,
				eBottom = eTop + eHeight;

			if (eHeight < windowHeight) {
				isvisible = (eBottom < scrollPos + windowHeight) && (eTop > scrollPos);
			}
			else {
				isvisible = (eBottom > (scrollPos + 0.75 * windowHeight)) && (eTop < (scrollPos + 0.25 * windowHeight));
			}
		}

		return isvisible;
	};

	var _scrollListener = function() {
		if (_options.active) {
			if (_timeout) {
				clearTimeout(_timeout);
			}
			_timeout = setTimeout(_handlescroll, 50);
		}
	};

	var _handlescroll = function() {
		// Use documentElement.scrollTop if in strict mode and body.scrollTop if in quirks mode
		var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
			node = document.getElementById('posts'),
			postop = _topPosition(node) - scrollTop,
			posbtm = postop + node.offsetHeight,
			posmid = postop + (node.offsetHeight / 2),
			winheight = window.innerHeight,
			winmid = winheight / 2,
			pagebtm = document.documentElement.scrollHeight,
			prevpage, nextpage, x, t, p, triggerdata = {};
			triggerdata.scrolldir = 'down';

		// We show next page when we reach the page's middle or bottom point
		if (scrollTop > _lastscrolltop && ((posmid > 0 && posmid < winmid) || (posbtm > 0 && posbtm < window.innerHeight))) {
			// downscroll: scrollTop > _lastscrolltop
			if (node.nextSibling && node.nextSibling.id) {
				nextpage = node.nextSibling.id.match(/posts-(\d+-\d+)/);
				if (nextpage) {
					x = nextpage[1].split('-');
					t = parseInt(x[0]);
					p = parseInt(x[1]);
					_showPage(t, p, false, (_options.delay && _threadid !== t));
				}
			}
		}

		// We show previous page when we reach the page's middle or top points
		if (scrollTop < _lastscrolltop && (postop > 0 || scrollTop <= 0 || posmid > winmid)) {
			// upscroll: scrollTop < _lastscrolltop
			if (node.previousSibling && node.previousSibling.id) {
				prevpage = node.previousSibling.id.match(/posts-(\d+-\d+)/);
				if (prevpage) {
					x = prevpage[1].split('-');
					t = parseInt(x[0]);
					p = parseInt(x[1]);
					_showPage(t, p, true);
					triggerdata.scrolldir = 'up';
				}
			}
		}
		_lastscrolltop = scrollTop;

		var arr = $(_maincontent).find('div[id^="posts"]');
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].id != 'posts' && _mostlyVisible(arr[i])) {
				// Change page and update url
				x = arr[i].id.substr(6).split('-');
				t = parseInt(x[0]);
				p = parseInt(x[1]);
				node.id = 'posts-' + _threadid + '-' + _currentpage;
				arr[i].id = 'posts';
				_threadinfo = window.vB_Thread_Store.fetch_threadinfo(t, p);
				$('#lastpost').attr('id', 'lastpost-' + _threadid + '-' + _currentpage);
				$('#lastpost-' + t + '-' + p).attr('id', 'lastpost');
				_pushPageState();
				if (_threadinfo) {
					_primeCache();
				}

				// Mark the page as read
				if (_threadinfo.displayed_dateline > _threadinfo.threadview) {
					window.vB_Thread_Store.mark_thread_read(_threadid, _threadinfo.forumid, _threadinfo.displayed_dateline);
				}

				// Record Thread View
				window.vB_Thread_Store.record_thread_view(_threadid);

				// Hook
				triggerdata.threadinfo = _threadinfo;
				triggerdata.threadlist = _threadlist;
				// Trigger Fixed Header events for changePageComplete if fixed header is enabled
				if (typeof window.vB_FixedHeader !== 'undefined') {
					window.vB_FixedHeader.changePageComplete(triggerdata);
				}
				// Trigger Magic Bar events for changePageComplete
				if (typeof vB_Magicbar !== 'undefined' && typeof React == 'undefined') {
					window.vB_Magicbar.changePageComplete(triggerdata);
				}
				$(document).trigger('InfiniteScroll.ChangePageComplete', [triggerdata]);
				break;
			}
		}

		// Show next page if user reaches the bottom
		_checkWindowBottom();
	};

	var _checkWindowBottom = function() {
		var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
			winheight = window.innerHeight,
			pagebtm = document.documentElement.scrollHeight,
			distance = pagebtm - (scrollTop + winheight); // distance to bottom

		if (distance <= _options.bottomthreshold) {
			// load next page
			var node = document.getElementById('posts'),
			details, x, t, p;

			var searchLastPage = function(current) {
				var next = current.nextSibling;
				if (next && next.id && next.id.indexOf('posts') >= 0) {
					if (next.style.display == 'none') {
						return next;
					}
					return searchLastPage(next);
				}
				return null;
			}

			var nextpage = searchLastPage(node);

			if (nextpage) {
				details = nextpage.id.match(/posts-(\d+-\d+)/);
				x = details[1].split('-');
				t = parseInt(x[0]);
				p = parseInt(x[1]);

				_showPage(t, p, false, (_options.delay && _threadid !== t), true);
			}
		}
	}

	var _pushPageState = function() {
		var urldecoded = $('<div />').html(_threadinfo.url).text(),
			titledecoded = $('<div />').html(_threadinfo.title).text();

		history.replaceState(null, null, urldecoded);

		window.vB_Analytics = window.vB_Analytics || [];
		window.vB_Analytics.push(['pageview', urldecoded]);

		window.ibtracker = window.ibtracker || [];
		window.ibtracker.push(['pageView', {
			eventText: document.title
		}]);

		// Update QR variables
		allow_ajax_qr = _threadinfo.show.allow_ajax_qr;

		// Update browser title
		var prefix = _threadinfo.titleprefix,
			title = [(prefix ? prefix + ' ' : '') + titledecoded];
		if (_threadinfo.page > 1) {
			title.push('Page ' + _threadinfo.page);
		}
		if (_options.bbtitle) {
			title.push(_options.bbtitle);
		}
		document.title = title.join(' - ');

		// Update Mobile header title
		if (window.Header !== undefined)
		{
			window.Header.setTitle(title[0]);
		}
	};

	var _pageCompare = function(page1, page2) {
		var pg1 = page1.split('-'),
			pg2 = page2.split('-'),
			t1 = parseInt(pg1[0]),
			p1 = parseInt(pg1[1]),
			t2 = parseInt(pg2[0]),
			p2 = parseInt(pg2[1]);

		if (t1 == t2) {
			return p1 - p2;
		}

		var index1 = _threadlist.map(function(obj){ return obj.threadid; }).indexOf(t1),
			index2 = _threadlist.map(function(obj){ return obj.threadid; }).indexOf(t2);
		return index1 - index2;
	};

	var _loadPage = function(threadinfo) {
		var page = threadinfo.threadid + '-' + threadinfo.page,
			current = _threadid + '-' + _currentpage,
			newpage = document.getElementById('posts-' + page),
			posts, postdiv, i;

		if (!newpage && threadinfo) {
			// Prepare page to insert
			posts = threadinfo.posts;
			postdiv = $('<div id="posts-' + page + '"></div>');
			postdiv.css('display', 'none');

			for (i = 0; i < posts.length; i++) {
				postdiv.append(posts[i].message);
			}
			postdiv.append('<div id="lastpost-' + page + '"></div>');

			if (_options.similar) {
				// if index == 0, current thread is first and there is no more before it
				var index = _threadlist.map(function(obj){ return obj.threadid; }).indexOf(threadinfo.threadid);
				if (index > 0 && threadinfo.page == 1 && threadinfo.titleparsed) {
					postdiv.prepend(threadinfo.titleparsed);
				}
			}

			// Is there additional content at the end of the thread?
			if (threadinfo.belowposts) {
				postdiv.append(threadinfo.belowposts);
			}

			// Define the IS page limit
			var lastthread = _threadlist[_threadlist.length - 1];
			if (threadinfo.threadid == lastthread.threadid && threadinfo.page >= lastthread.pages) {
				postdiv.data('pagelimit', 1);
			}

			// Find where to insert new page
			var arr = $(_maincontent).find('div[id^="posts"]'),
				pagesarr = [], x, t, p;

			for (i = 0; i < arr.length; i++) {
				x = arr[i].id.substr(6);
				if (x.length == 0) {
					x = current;
				}
				pagesarr.push(x);
			}

			var lo = 0,
				hi = pagesarr.length - 1,
				mid, pivot, pivotpage, result;
			while (lo <= hi) {
				mid = ((lo + hi) >> 1);
				result = _pageCompare(pagesarr[mid], page);
				if (result < 0) {
					lo = mid + 1;
				}
				else if (result > 0) {
					hi = mid - 1;
				}
				else {
					break;
				}
			}

			pivotpage = pagesarr[mid];
			pivot = document.getElementById(pivotpage == current ? 'posts' : 'posts-' + pivotpage);

			// Insert new page
			result = _pageCompare(pivotpage, page);
			if (result > 0) {
				postdiv.insertBefore(pivot);
			}
			else if (result < 0) {
				postdiv.insertAfter(pivot);
			}

			// Remove pages, re-using x and mid
			var pagerem, pagemove, pagevisible;
			pagesarr.push(page);
			pagesarr.sort(_pageCompare);
			if (pagesarr.length > MAX_PAGE_LOAD) {
				x = (MAX_PAGE_LOAD >> 1);
				mid = pagesarr.indexOf(current);
				pagesarr.splice(mid - x, MAX_PAGE_LOAD);
				for (i = 0; i < pagesarr.length; i++) {
					pagerem = $('#posts-' + pagesarr[i]);
					pagemove = $(window).scrollTop() - pagerem.height();
					pagevisible = pagerem.is(':visible');

					// Hide bottom content if removing IS page limit
					if (pagerem.data('pagelimit')) {
						_showBottom(false);
					}

					// Hook
					$(document).trigger('InfiniteScroll.RemovePageComplete', [pagesarr[i]]);

					pagerem.remove();
					// Adjust if scrolling down.
					if (pagevisible && _pageCompare(pivotpage, pagesarr[i]) > 0) {
						window.scrollTo(0, pagemove);
					}
				}
			}

			if (_options.shortpagecheck) {
				checkShortPage().then(function(isshort){
					if (isshort &&
						(threadinfo.threadid == _threadid && threadinfo.page == _currentpage + 1) ||
						(threadinfo.threadid != _threadid && threadinfo.page == 1)
					){
						_options.shortpagecheck = 0;
						_handlescroll();
					}
				});
			}
		}
	};

	var _primeCache = function() {
		var totalposts = parseInt(_threadinfo.totalposts),
			prevpage, nextpage, loadinfo,
			prevthread, prevthreadpage, x;

		_threadid = parseInt(_threadinfo.threadid);
		_currentpage = parseInt(_threadinfo.page);
		_totalpages = Math.ceil(totalposts/parseInt(_threadinfo.perpage));

		prevpage = _currentpage;
		nextpage = _currentpage;

		var index = _threadlist.map(function(obj){ return obj.threadid; }).indexOf(_threadid);
		// Let's load the 2 previous and 2 next pages
		for (var i = 0; i < 2; i++) {
			prevpage--;
			nextpage++;

			loadinfo = false;
			if (prevpage > 0) {
				loadinfo = window.vB_Thread_Store.fetch_threadinfo(_threadid, prevpage, _loadPage);
			}
			else if (index > 0) {
				// if index == 0, current thread is first and there is no more before it
				// if index < 0, error: current thread not in the list, should not be possible
				x = _threadlist[index - 1].pages + prevpage;
				if (x > 0) {
					loadinfo = window.vB_Thread_Store.fetch_threadinfo(_threadlist[index - 1].threadid, x, _loadPage);
				}
			}
			if (loadinfo) {
				_loadPage(loadinfo);
			}

			loadinfo = false;
			if (nextpage <= _totalpages) {
				loadinfo = window.vB_Thread_Store.fetch_threadinfo(_threadid, nextpage, _loadPage);
			}
			else if (index >= 0 && typeof _threadlist[index + 1] !== 'undefined') {
				// if index < 0, error: current thread not in the list, should not be possible
				var pagenum = nextpage - _totalpages;
				if (pagenum <= _threadlist[index + 1].pages) {
					loadinfo = window.vB_Thread_Store.fetch_threadinfo(_threadlist[index + 1].threadid, pagenum, _loadPage);
				}
			}
			if (loadinfo) {
				_loadPage(loadinfo);
			}
		}
	};

	function checkShortPage() {
		return new Promise(function(resolve, reject){
			resolve(($(document).height() <= $(window).height()));
		});
	}

	function Init(options) {
		_threadinfo = window.vB_Thread_Store.fetch_threadinfo();
		_maincontent = document.getElementById(MAIN_CONTENT_ID);
		_options.active = 1;
		_options.bbtitle = '';
		_options.delay = 0;
		_options.bottomthreshold = 400;
		_options.shortpagecheck = 1;
		$.extend(_options, options);

		if (_threadinfo) {
			var totalposts = parseInt(_threadinfo.totalposts),
				totalpages = Math.ceil(totalposts/parseInt(_threadinfo.perpage));

			// Object { threadid, title, forumtitle, forumid, pages }
			_threadlist.push({
				'threadid': parseInt(_threadinfo.threadid),
				'pages': Math.ceil(_threadinfo.totalposts / _threadinfo.perpage)
			});
			_threadlist = _threadlist.concat(_threadinfo.similar);
			_options.similar = (_threadlist.length > 1);

			// Is the current page, the IS limit page?
			if (!_options.similar && _threadinfo.page >= totalpages) {
				$('#posts').data('pagelimit', 1);
			}

			_primeCache();
			window.addEventListener('scroll', _scrollListener, false);
		}
	}

	var _threadlist = [];
	var _threadinfo;
	var _threadid = 0;
	var _currentpage = 0;
	var _totalpages = 0;
	var _maincontent;
	var _timeout;
	var _delaytimeout;
	var _lastscrolltop = 0;
	var _options = {};

	window.vB_InfiniteScroll = vB_InfiniteScroll;

}(window, document, window.jQuery));
