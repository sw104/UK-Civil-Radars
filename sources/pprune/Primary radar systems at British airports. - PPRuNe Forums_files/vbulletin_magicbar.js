/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

(function(window, document, $) {

	/* Global API */
	var vB_Magicbar = {
		init: Init,
		off: function() {
			_options.active = 0;
		},
		on: function() {
			_options.active = 1;
		},
		multiquote_count: function() {
			_updateMultiquoteCount();
		},
		qr_prepare_submit: function(formobj, minchars) {
			// Update form thread info
			// ToDo: this update should be done on changePageComplete
			formobj.qr_threadid.value = _threadinfo.threadid;
			formobj.action = 'newreply.php?do=postreply&t=' + _threadinfo.threadid;

			return qr_prepare_submit(formobj, minchars);
		},
		form_submit: function(formobj, formid, formaction) {
			var formvalue = '',
				formscript;

			switch(formaction) {
				case 'inlinemod':
					formscript = 'inlinemod.php?threadid=';
					break;
				case 'postings':
					formscript = 'postings.php?threadid=';
					break;
				default:
					formscript = '';
			}

			if (typeof formobj['do'].value == 'undefined') {
				formvalue = formobj.querySelector('input[name=do]:checked').value;
			}
			else if (formobj['do'].value !== '') {
				formvalue = formobj['do'].value;
			}
			if (formvalue !== '') {
				// Change inline moderation form do value
				$('#' + formid).find('input[name=do]').val(formvalue);
				// Update the threadid
				$('#' + formid).attr('action', formscript + _threadinfo.threadid);
				$('#' + formid).find('input[name=threadid]').val(_threadinfo.threadid);
				// Submit inline moderation form
				$('#' + formid).submit();
			}
			return false;
		},
		gotopage: function(formobj) {
			var pagenum = parseInt(formobj.page.value);
			if (pagenum > 0) {
				window.location = 'showthread.php?t=' + _threadinfo.threadid + '&page=' + pagenum;
			}
			return false;
		},
		addQR: function() {
			_addQR(_threadinfo);
		},
		changePageComplete: function(data) {
			_threadinfo = data.threadinfo;
			_title = (_threadinfo.titleprefixrich ? _threadinfo.titleprefixrich + ' ' : '') + _threadinfo.title;

			// Update reply button link
			$('#' + MAGICBAR_REPLY_ID).attr('href', 'newreply.php?do=newreply&noquote=1&t=' + _threadinfo.threadid);

			// Update closed button link
			$('#' + MAGICBAR_CLOSED_ID).attr('href', 'newreply.php?do=newreply&noquote=1&t=' + _threadinfo.threadid);

			// Update page navigation
			_updateNav(_threadinfo);

			// Update reply button if thread is open/closed and different from previous page
			var hideclass = (MASTERSTYLEID == -2) ? 'm-hidden' : 'hide';
			if ($('#' + MAGICBAR_ID).find('#' + MAGICBAR_REPLY_ID).hasClass(hideclass) == _threadinfo.threadopen) {
				$('#' + MAGICBAR_ID).find('#' + MAGICBAR_REPLY_ID).toggleClass(hideclass);
				$('#' + MAGICBAR_ID).find('#' + MAGICBAR_CLOSED_ID).toggleClass(hideclass);
			}

			if (MASTERSTYLEID == -2) {
				// Update Mobile Magicbar Item Display States
				_showMobileMagicbarItems();
			}
			else {

				// Update reply title
				$('#' + MAGICBAR_ID).find('#qr_threadtitle').html(_title);

				// Update forum jump parent
				$('#' + MAGICBAR_FORUMJUMP_ID).find('select[name=f]').val(_threadinfo.forumid);

				// Events when scrolling into different thread
				if (_threadid != _threadinfo.threadid) {
					// Close magicbar quick reply editor when switching between threads
					if (typeof qr_magicbar !== 'undefined' && qr_magicbar) {
						vB_Editor[qr_magicbar].close_editor(true, _threadinfo);
					}

					// remove check from quote message in reply and disable
					$('#qr_quickreply').prop('checked', false);
					$('#qr_quickreply').prop('disabled', true);

					// update pagination go to thread
					$('#' + MAGICBAR_PAGINATION_ID).find('form').find('input[type="hidden"]').val('showthread.php?t=' + _threadinfo.threadid);
				}

				// Hide/show quick reply button if thread is open/closed and different from previous page
				if ($('#' + MAGICBAR_ID).find('#mb_quickreply').hasClass('hide') == _threadinfo.threadopen) {
					$('#' + MAGICBAR_ID).find('#mb_quickreply').toggleClass('hide');
				}
			}

			_threadid = _threadinfo.threadid;
		}
	};

	var MAIN_CONTENT_ID = 'main-content',
		MAGICBAR_ID = 'magicbar',
		MAGICBAR_MQCOUNT_ID = 'mb_mqcount',
		MAGICBAR_REPLY_ID = 'mb_reply',
		MAGICBAR_CLOSED_ID = 'mb_closed',
		MAGICBAR_FORUMJUMP_ID = 'mb_forumjump',
		MAGICBAR_PAGE = 'mb_page',
		MAGICBAR_PAGE_CURRENT = 'mb_page_current',
		MAGICBAR_PAGE_TOTAL = 'mb_page_total',
		MAGICBAR_QR_CONTAINER = 'qrcontent';

	// Additional ids for mobile template
	var MAGICBAR_PAGINATION_ID = 'mb_pagination',
		MAGICBAR_PAGENAV_ID = 'mb_pagenav',
		MAGICBAR_MENU_ID = 'mb_menu',
		MAGICBAR_MENUNAV_ID = 'mb_menunav',
		MAGICBAR_MENUNAV_TEXT = 'mb_menunav_text',
		MAGICBAR_MENUNAV_EXPANDED = 'mb_menunav_expanded',
		MAGICBAR_MENUNAV_COLLAPSED = 'mb_menunav_collapsed',
		MAGICBAR_REPLY_TEXT = 'mb_reply_text',
		MAGICBAR_CLOSED_TEXT = 'mb_closed_text',
		MAGICBAR_ACTION_ID = 'mb_action';

	var _scrollListener = function() {
		if (_options.active) {
			if (_timeout) {
			    clearTimeout(_timeout);
			}
			_timeout = setTimeout(_stickMagicbar, 30);
		}
	};

	var _stickMagicbar = function() {
		$('.cke_panel').removeClass('fixzindex');
		// If the quick reply editor is open and is the ck editor then close the color chooser popup on scroll if it is open
		if ($('#' + MAGICBAR_QR_CONTAINER).css("display") != 'none' && $('.cke_panel').css('display') != 'none' && $('#' + MAGICBAR_QR_CONTAINER + ' .cke_button__textcolor').hasClass('cke_button_on')) {
			//focus on another button so that the color picker gets closed
			$('#' + MAGICBAR_QR_CONTAINER + ' .cke_button__bbquote').focus();

		}
	};

	var _updateNav = function(threadinfo) {
		// Update the pagenav links and x/y display when a new page is loaded
		var totalposts = threadinfo.totalposts,
			currentpage = threadinfo.page,
			totalpages = Math.ceil(totalposts / threadinfo.perpage);

		if (totalpages === 1) {
			$('#' + MAGICBAR_ID + '_gotopage :input').prop("disabled", true);
		}
		else {
			$('#' + MAGICBAR_ID + '_gotopage :input').prop("disabled", false);
		}

		$('#' + MAGICBAR_PAGE).find('#' + MAGICBAR_PAGE_CURRENT).text(currentpage);
		$('#' + MAGICBAR_PAGE).find('#' + MAGICBAR_PAGE_TOTAL).text(totalpages);

		// Updating pagination links
		var prevThread, nextThread, urldecoded;

		// First and Previous links
		if (currentpage > 1) {
			prevThread = window.vB_Thread_Store.fetch_threadinfo(threadinfo.threadid, currentpage - 1);
			if (prevThread) {
				urldecoded = $('<div />').html(prevThread.url).text();
				$('#' + MAGICBAR_PAGE + 'prev').attr('href', urldecoded).removeClass('disabled');
			}

			$('#' + MAGICBAR_PAGE + 'first').attr('href', 'showthread.php?t=' + threadinfo.threadid).removeClass('disabled');
		}
		else {
			$('#' + MAGICBAR_PAGE + 'first').addClass('disabled');
			$('#' + MAGICBAR_PAGE + 'first').attr('href', 'javascript:void(0)');
			$('#' + MAGICBAR_PAGE + 'prev').addClass('disabled');
			$('#' + MAGICBAR_PAGE + 'prev').attr('href', 'javascript:void(0)');
		}

		// Next and Last links
		if (currentpage < totalpages) {
			nextThread = window.vB_Thread_Store.fetch_threadinfo(threadinfo.threadid, currentpage + 1);
			if (nextThread) {
				urldecoded = $('<div />').html(nextThread.url).text();
				$('#' + MAGICBAR_PAGE + 'next').attr('href', urldecoded).removeClass('disabled');
			}

			$('#' + MAGICBAR_PAGE + 'last').attr('href', 'showthread.php?t=' + threadinfo.threadid + '&page=' + totalpages).removeClass('disabled');
		}
		else {
			$('#' + MAGICBAR_PAGE + 'next').addClass('disabled');
			$('#' + MAGICBAR_PAGE + 'next').attr('href', 'javascript:void(0)');
			$('#' + MAGICBAR_PAGE + 'last').addClass('disabled');
			$('#' + MAGICBAR_PAGE + 'last').attr('href', 'javascript:void(0)');
		}

		// Go To Pagination
		$('#' + MAGICBAR_PAGINATION_ID).find('form').find('input[type="number"]').prop('placeholder', currentpage);
	};

	var _updateMultiquoteCount = function() {
		var cookie_ids = fetch_cookie(COOKIE_PREFIX + 'vbulletin_multiquote');
		if (cookie_ids !== null && cookie_ids !== '') {
			cookie_ids = cookie_ids.split(',');
		}
		else {
			cookie_ids = [];
		}

		// only show the count if it is greater than 0
		if (cookie_ids.length > 0) {
			$('#' + MAGICBAR_MQCOUNT_ID).text('(' + cookie_ids.length + ')');
		}
		else {
			$('#' + MAGICBAR_MQCOUNT_ID).text('');
		}
	};

	// Show/hide magicbar items based on widow width
	var _showMagicbarItems = function() {
		var windowwidth = $( window ).width();
		var totalwidth = 0;
		var leftwidth = $('#' + MAGICBAR_ID + ' .bar-left').outerWidth( true );
		var rightwidth = $('#' + MAGICBAR_ID + ' .bar-right').outerWidth( true );

		// Hide elements
		if (leftwidth + rightwidth > windowwidth) {
			while (leftwidth + rightwidth > windowwidth) {
				if (!$('#' + _elements[_elementindex]).hasClass('hide')) {
					_elementswidth[_elementindex] = leftwidth + rightwidth;
					$('#' + _elements[_elementindex]).addClass('hide');
					leftwidth = $('#' + MAGICBAR_ID + ' .bar-left').outerWidth( true );
					rightwidth = $('#' + MAGICBAR_ID + ' .bar-right').outerWidth( true );
					_elementswidth[_elementindex] -= leftwidth + rightwidth;
					_elementindex++;
				}
				if(_elementindex == _elements.length) {
					// No elements left to hide so break out of the loop
					break;
				}
			}
		}
		// Show elements
		else {
			while (leftwidth + rightwidth < windowwidth) {
				if(_elementindex - 1 < 0) {
					// No elements are hidden so break out of the loop
					break;
				}
				else if (_elementswidth[_elementindex - 1] + leftwidth + rightwidth < windowwidth) {
					// The width of the element to be shown plus magicbar width is less than windowwidth so show the element
					$('#' + _elements[_elementindex - 1]).removeClass('hide');
					_elementindex--;
				}
				else {
					break;
				}
				leftwidth = $('#' + MAGICBAR_ID + ' .bar-left').outerWidth( true );
				rightwidth = $('#' + MAGICBAR_ID + ' .bar-right').outerWidth( true );
			}
		}
	};

	var _fixZindex = function() {
		if (!$('#' + MAGICBAR_ID + ' .cke_button__textcolor').hasClass('eventadded')) {
			$('#' + MAGICBAR_ID + ' .cke_button__textcolor').on('click', function(){
				$('.cke_panel').addClass('fixzindex');
			});
			$('#' + MAGICBAR_ID + ' .cke_button__textcolor').addClass('eventadded');
		}
	};

	// Function to expand/collapse pagination feature ON MOBILE
	var _displayMobilePagination = function() {
		if ($('#' + MAGICBAR_PAGINATION_ID).css('display') == 'none') {
			// Collapse menu
			$('#' + MAGICBAR_MENU_ID).hide();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_TEXT).html('More');
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_EXPANDED).hide();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_COLLAPSED).show();
			
			$('#' + MAGICBAR_PAGINATION_ID).show();
		}
		else {
			$('#' + MAGICBAR_PAGINATION_ID).hide();
		}
	}

	// Funtion to expand/collapse menu ON MOBILE
	var _displayMobileMenu = function() {
		if ($('#' + MAGICBAR_MENU_ID).css('display') == 'none') {
			// Collpase pagination
			$('#' + MAGICBAR_PAGINATION_ID).hide();

			$('#' + MAGICBAR_MENU_ID).show();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_TEXT).html('Less');
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_COLLAPSED).hide();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_EXPANDED).show();
		}
		else {
			$('#' + MAGICBAR_MENU_ID).hide();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_TEXT).html('More');
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_EXPANDED).hide();
			$('#' + MAGICBAR_MENUNAV_ID).find('#' + MAGICBAR_MENUNAV_COLLAPSED).show();
		}
	}

	var _showMobileMagicbarItems = function() {
		var windowWidth = $(window).width(),
			replyWidth = $('#' + MAGICBAR_ACTION_ID).outerWidth(),
			pagenavWidth = $('#' + MAGICBAR_PAGENAV_ID).outerWidth(),
			menunavWidth = $('#' + MAGICBAR_MENUNAV_ID).outerWidth(),
			magicbarWidth = replyWidth + pagenavWidth + menunavWidth;

		if (magicbarWidth > windowWidth || replyWidth != menunavWidth) {
			$('#' + MAGICBAR_MENUNAV_TEXT).hide();
			$('#' + MAGICBAR_REPLY_TEXT).hide();
			$('#' + MAGICBAR_CLOSED_TEXT).hide();
		}
		else {
			$('#' + MAGICBAR_MENUNAV_TEXT).show();
			$('#' + MAGICBAR_REPLY_TEXT).show();
			$('#' + MAGICBAR_CLOSED_TEXT).show();
		}
	}

	function Init() {
		_options.active = 1;
		_threadinfo = window.vB_Thread_Store.fetch_threadinfo();
		_threadid = _threadinfo.threadid;
		_title = (_threadinfo.titleprefixrich ? _threadinfo.titleprefixrich + ' ' : '') + _threadinfo.title;

		// Update inline moderation counters
		if (typeof inlineMod !== 'undefined') {
			inlineMod.set_output_counters();
		}

		// Update the multiquote counters
		_updateMultiquoteCount();

		// Fix Quick reply zIndex on CK Editor
		$('#mb_quickreply').click(_fixZindex);

		// Add event listeners for Mobile Magicbar
		if (MASTERSTYLEID == -2) {
			$('#' + MAGICBAR_PAGE).on('click', function(evt) {
				_displayMobilePagination();
			});
			$('#' + MAGICBAR_MENUNAV_ID).on('click', function(evt) {
				_displayMobileMenu();
			});
		}

		window.addEventListener('scroll', _scrollListener, false);
		if (MASTERSTYLEID == -2) {
			_showMobileMagicbarItems();
		}
		else {
			window.addEventListener('resize', _showMagicbarItems, false);
			_showMagicbarItems();

			// If the ckeditor mentions/autocomplete is clicked, do not close
			$(document).foundation('magicbar', 'reflow', {'noclose':'li.cke_autocomplete_selected'});
		}
	}

	var _timeout;
	var _threadinfo;
	var _threadid;
	var _options = {};
	var _magicpagenav = $('.magicpagenav');
	var _elementindex = 0;
	// Order in which magicbar elements should be hidden
	var _elements = ['mb_forumjumplink', 'mb_share', 'mb_seperator', 'mb_imod', 'magicbar_gotopage', 'mb_pagefirst', 'mb_pagelast', 'mb_pageprev', 'mb_pagenext', 'mb_quickreply', 'mb_page'];
	// Array of the magicbar element widths
	var _elementswidth = [];
	var _title = '';

	window.vB_Magicbar = vB_Magicbar;

}(window, document, window.jQuery));
