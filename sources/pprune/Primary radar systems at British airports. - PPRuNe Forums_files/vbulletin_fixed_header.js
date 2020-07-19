/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

(function(window, document, $) {

	/* Global API */
	var vB_FixedHeader = {
		init: function(options) {
			Init(options);
		},
		off: function() {
			_options.active = 0;
		},
		on: function() {
			_options.active = 1;
		},
		revertThreadRating: function(success) {
			if (success) {
				_updateThreadRating();
			}
			else {
				_threadrating = $('#tt_threadrating_options .rating-on input').val();
			}
		},
		showMenuItemsHeader: function(scrolled) {
			var header = $('header');
			if (typeof scrolled != 'undefined' && scrolled && header.hasClass('fixedcomponentwidth') && header.hasClass('smaller')) {
				return false;
			}
			if ($('#fixed_header_left_container').length > 0 && $('#fixed_header_left_container').css('width') == '0px') {
				var paddingoffsetleft =  Math.ceil(parseFloat($('#header_toolbox_left').css('padding-left'))) + Math.ceil(parseFloat($('#header_toolbox_left').css('padding-right')));
				var arrowoffset = $('#navbits_title > span:last').outerWidth( true ) + 5;
				var titlewidth = $('#header_nav_title').outerWidth( true ) + paddingoffsetleft + arrowoffset;
				$('#fixed_header_left_container').css('width', $('#header_toolbox_left').outerWidth( true ) + 'px');
				$('#fixed_header_left_container_text').css('width', titlewidth + 'px');
			}
			_showMenuItemsHeader(true);
		},
		changePageComplete: function(data) {
			if (_options.active) {
				var threadinfo = data.threadinfo;
				$('#' + _navbitstitle).html(threadinfo.crumbs);

				var urldecoded = $('<div />').html(threadinfo.show.nojs_link).text();
				$('#' + _threadsearchlinkid).attr('href', urldecoded + '#goto_threadsearch');
				$('#' + _threadtoolslinkid).attr('href', urldecoded + '#goto_threadtools');

				var threadchanged = _threadid != threadinfo.threadid;
				_updateThreadFirstUnread(threadinfo.firstunread, threadchanged);
				// If we need to update tools
				if (threadchanged) {
					_threadid = threadinfo.threadid;
					_forumid = threadinfo.forumid;
					_updateThreadTools(threadinfo);
					_updateThreadSearch(threadinfo.show.search);
					_updateSponsor(threadinfo);
				}
				_showMenuItemsHeader(true);
			}
		}
	};

	var _updateThreadFirstUnread = function(url, threadchanged) {
		var firstunreadlink = $('#viewfirstunread');
		if (url) {
			var urldecoded = $('<div />').html(url).text();
			var index = urldecoded.indexOf('#');

			if (urldecoded.indexOf('#') >= 0) {
				urldecoded = firstunreadlink.attr('href').slice(0, index) + urldecoded;
			}

			firstunreadlink.show();
			if (urldecoded.indexOf('#') == 0) {
				// same page, urldecoded has postid
				var locationOffset = $(urldecoded).position().top - $('header').height();
				firstunreadlink.attr('onclick', 'window.scrollTo(0, ' + locationOffset + ');');
				firstunreadlink.attr('href', 'javascript:void(0)');
			}
			else {
				// postid not available
				firstunreadlink.attr('href', urldecoded);
				firstunreadlink.attr('onclick', '');
			}
		}
		else if (!threadchanged && _options.viewfirstunread) {
		// If the url is empty but the thread hasn't changed  and the link should be shown
			firstunreadlink.show();
			firstunreadlink.attr('href', _options.viewfirstunreadlink);
			firstunreadlink.attr('onclick', '');
		}
		else {
			firstunreadlink.attr('href', '#').hide();
		}
	};

	var _updateSponsor = function(threadinfo) {
		var threadsponsorcontainer = $('#header_forum_sponsor');
		var threadsponsorimage = $('#header_forum_sponsor img');
		if (typeof threadinfo.sponsor_img != 'undefined' && threadinfo.sponsor_img.length > 0) {
			threadsponsorcontainer.attr('href', threadinfo.sponsor_link);
			threadsponsorcontainer.attr('title', threadinfo.sponsor_text);
			threadsponsorimage.attr('alt', threadinfo.sponsor_text + ' ' + threadinfo.sponsor_name);
			threadsponsorimage.attr('title', threadinfo.sponsor_text + ' ' + threadinfo.sponsor_name);
			threadsponsorimage.attr('src', threadinfo.sponsor_img);
			threadsponsorcontainer.show();
			threadsponsorimage.show();
		}
		else {
			threadsponsorcontainer.hide();
			threadsponsorimage.hide();
		}

		return true;
	};

	var _updateThreadSearch = function(show) {
		var threadsearchlink = $('#' + _threadsearchlinkid);

		if (!show) {
			threadsearchlink.hide();
			return false;
		}

		// Update search form and advanced search link
		var searchform = $('#' + _threadsearchid).find('form[name="threadsearchform"]');

		if (searchform.length > 0) {
			searchform[0].searchthreadid.value = _threadid;
			searchform[0].action = 'search.php?do=process&searchthreadid=' + _threadid;
			searchform.find('#threadsearchadv').attr('href', 'search.php?searchthreadid=' + _threadid);
			threadsearchlink.show();
		}

		return true;
	};

	var _updateThreadTools = function(threadinfo) {
		var threadtools = $('#' + _threadtoolsid);
		var show = threadinfo.show;
		// Update forms actions in threadtools drop
		var ratingform = threadtools.find('form[name="threadrateform"]');
		if (ratingform.length > 0) {
			ratingform[0].t.value = _threadid;
			ratingform[0].action = 'threadrate.php?t=' + _threadid;

			if (show.ratethread) {
				$('#tt_threadrate_form_rating').removeClass('hide');
				$('#tt_threadrate_form_rated').addClass('hide');

				$(document).foundation('rating', {
					form: document.getElementById('tt_threadrate_form'),
					callback: vB_AJAX_ThreadRate.prototype.form_click_submit
				});
			}
			else {
				var threadimagesrc = $('#tt_threadrate_form_rated').find('img').attr('src');
				threadimagesrc = threadimagesrc.substring(0, threadimagesrc.lastIndexOf('/') + 1) + 'rating_' + threadinfo.rating + '.gif';
				$('#tt_threadrate_form_rated').find('img').attr('src', threadimagesrc);
				$('#tt_threadrate_form_rated').removeClass('hide');
				$('#tt_threadrate_form_rating').addClass('hide');
			}

			if (show.threadrating) {
				ratingform.show();
			}
			else {
				ratingform.hide();
			}
		}

		if ($.isNumeric(threadinfo.rating)) {
			_threadrating = threadinfo.rating;
			_updateThreadRating();
		}

		var modform = threadtools.find('form[name="threadadminform"]');
		if (modform.length > 0) {
			modform[0].t.value = _threadid;
			modform[0].action = 'postings.php?t=' + _threadid;

			var threadstatusstring = threadtools.find('label[for="fixed_ao_oct"]').html();
			if (show.closethread) {
				threadtools.find('label[for="fixed_ao_oct"]').html(threadstatusstring.substring(0, threadstatusstring.indexOf('>') + 1) + ' Close Thread');
			}
			else {
				threadtools.find('label[for="fixed_ao_oct"]').html(threadstatusstring.substring(0, threadstatusstring.indexOf('>') + 1) + ' Open Thread');
			}
			var threadstatusstring = threadtools.find('label[for="fixed_ao_apr"]').html();
			if (show.approvethread) {
				threadtools.find('label[for="fixed_ao_apr"]').html(threadstatusstring.substring(0, threadstatusstring.indexOf('>') + 1) + ' Approve Thread');
			}
			else {
				threadtools.find('label[for="fixed_ao_apr"]').html(threadstatusstring.substring(0, threadstatusstring.indexOf('>') + 1) + ' Unapprove Thread');
			}

			var stickyphrasestring = threadtools.find('label[for="fixed_ao_sut"]').html();
			if (show.unstick) {
				threadtools.find('label[for="fixed_ao_sut"]').html(stickyphrasestring.substring(0, stickyphrasestring.indexOf('>') + 1) + ' Unstick Thread');
			}
			else {
				threadtools.find('label[for="fixed_ao_sut"]').html(stickyphrasestring.substring(0, stickyphrasestring.indexOf('>') + 1) + ' Stick Thread');
			}

			if (show.adminoptions) {
				modform.show();
			}
			else {
				modform.hide();
			}
		}

		// Update link tools in in threadtools drop
		var link1, link2;

		link1 = threadtools.find('a#tt_printthread');
		link1.attr('href', 'printthread.php?t=' + _threadid);

		link1 = threadtools.find('a#tt_sendtofriend');
		link1.attr('href', 'sendmessage.php?do=sendtofriend&t=' + _threadid);
		if (show.sendtofriend) {
			link1.parent().removeClass('hide');
		}
		else {
			link1.parent().addClass('hide');
		}

		link1 = threadtools.find('a#tt_removesubscription');
		link1.attr('href', 'subscription.php?do=removesubscription&t=' + _threadid);
		link2 = threadtools.find('a#tt_addsubscription');
		link2.attr('href', 'subscription.php?do=addsubscription&t=' + _threadid);
		if (show.subscribed) {
			link1.parent().removeClass('hide');
			link2.parent().addClass('hide');
		}
		else {
			link1.parent().addClass('hide');
			link2.parent().removeClass('hide');
		}

		link1 = threadtools.find('a#tt_newpoll');
		link1.attr('href', 'poll.php?do=newpoll&t=' + _threadid);
		if (show.addpoll) {
			link1.parent().removeClass('hide');
		}
		else {
			link1.parent().addClass('hide');
		}

	};

	var _scrollListener = function() {
		if (_options.active) {
			if (_timeout) {
				clearTimeout(_timeout);
			}
			_timeout = setTimeout(_stickDropdown, 30);
		}
	};

	var _stickDropdown = function() {
		// close dropdowns on scroll
		$(document).foundation('dropdown', 'close', $('.f-dropdown'));
		var oldstatus = _issmaller;
		_issmaller = $('header').hasClass('smaller');
		if (_issmaller && oldstatus != _issmaller) {
			_showMenuItemsNavbar();
			_titleOffsetPadding();
		}
	};

	var _titleOffsetPadding = function () {
		// If no navbits vertically align the title
		if ($('#header_nav_title').length == 0) {
			$('#navbits_title').css('line-height', $('#header_toolbox_right').outerHeight( true ) + 'px');
			$('#navbits_title').css('vertical-align', 'middle');
		}
		// If there are navbits fix vertical alignment for logged out users
		if ($('#header_usercp_menu2').length == 0) {
			var leftheight = $('#header_toolbox_left').outerHeight( true );
			var rightheight = $('#header_toolbox_right').outerHeight( true );
			if (leftheight > rightheight) {
				$('#header_toolbox_right').css('line-height', leftheight + 'px');
				$('#header_toolbox_right').css('vertical-align', 'middle');
			}
			_titlepadding = -1;
		}
		else {
			// fix navbits vertical alignment for logged in users
			var leftheight = $('#header_toolbox_left').outerHeight( true );
			var rightheight = $('#header_toolbox_right').outerHeight( true );
			if (leftheight < rightheight && $('#header_toolbox_left').css('padding-top') == '0px') {
				var tempoffset = (rightheight - leftheight) / 2;
				$('#header_toolbox_left').css('padding-top', tempoffset + 'px');
				_titlepadding = tempoffset;
			}
		}
	}

	var _updateThreadRating = function() {
		// update thread rating
		$('#tt_threadrating_options .rating-on').removeClass('rating-on');
		$('#tt_threadrating_options').find('label[for="fixed_vote' + _threadrating + '"]').parent('li').addClass('rating-on');
	};

	// Show/hide menu items based on widow width
	var _showMenuItemsNavbar = function(sizechanged) {
		// Top components
		var leftwidth = 0;
		var rightwidth = $('.top-nav-right').outerWidth( true );
		var windowwidth = $( window ).width();

		// Calculate width of visible .top-nav-left items
		$('.top-nav-left > ul > li:visible').each(function() {
			leftwidth += $(this).outerWidth( true );
		});

		// using boolean check oherwise sizechanged is defined for resize events
		if (sizechanged == true) {
			_resizeSearchBar(false);
			rightwidth = $('.top-nav-right').outerWidth( true );
		}

		if (leftwidth + rightwidth >= windowwidth && typeof $('.top-nav-right > ul > li.has-form').css('position') != 'fixed') {
		// Hide menu items if there is not enough space
			while (leftwidth + rightwidth >= windowwidth) {
				var lastelement = $('.top-nav-left > ul > li:visible:last');
				if (!_searchbarissmaller) {
					_resizeSearchBar(false);
					rightwidth = $('.top-nav-right').outerWidth( true );
				}
				if (lastelement.prev().length == 0 && lastelement.children('a').children('img').length > 0) {
					// at header img, should not be hidden. Instead searchbar will overlap
					var searchwidth = $('.top-nav-right > ul > li.has-form').outerWidth( true );
					$('.top-nav-right > ul > li.has-form').css('background-color', 'transparent');
					$('.top-nav-right > ul > li.has-form').css('position', 'fixed');
					$('.top-nav-right > ul > li.has-form').css('right', '0px');
					$('.top-nav-right > ul > li.has-form').css('top', '0px');
					$('.top-nav-right > ul > li.has-form').css('width', searchwidth + 'px');
					$('.top-nav-right > ul > li.has-form').css('z-index', '99999');
					break;
				}
				else if (lastelement.length > 0 && (lastelement.outerWidth( true ) + leftwidth + rightwidth >= windowwidth)) {
					// at any other element, should be hidden.
					leftwidth -= lastelement.outerWidth( true );
					lastelement.addClass('hide');
				}
				else {
					break;
				}
			}
		}
		else {
		// Show menu items if there is enough space
			while (leftwidth + rightwidth < windowwidth) {
				var lastelement = $('.top-nav-left > ul > li.hide:first');
				if (lastelement.length > 0 && (lastelement.outerWidth( true ) + leftwidth + rightwidth < windowwidth) && rightwidth > 0) {
					lastelement.removeClass('hide');
					leftwidth += lastelement.outerWidth( true );
				}
				else if (typeof $('.top-nav-right > ul > li.has-form').attr('style') != 'undefined' && $('.top-nav-right > ul > li.has-form').outerWidth( true ) + leftwidth < windowwidth) {
					// search should no longer overlap
					$('.top-nav-right > ul > li.has-form').removeAttr('style');
					break;
				}
				else if ($('.top-nav-left > ul > li.hide').length == 0 && _searchbarissmaller && _searchbardefaultwidth + leftwidth < windowwidth) {
					_resizeSearchBar(true);
					break;
				}
				else {
					break;
				}
			}
		}
	};

	var _showMenuItemsHeader = function(reset) {
		// Bottom components
		var leftwidth = 0;
		var rightwidth = $('.top-nav-right').outerWidth( true );
		var windowwidth = $( window ).width();
		var paddingoffsetleft =  Math.ceil(parseFloat($('#header_toolbox_left').css('padding-left'))) + Math.ceil(parseFloat($('#header_toolbox_left').css('padding-right')));
		var paddingoffsetright =  Math.ceil(parseFloat($('.toolbar[data-smaller-show] .toolbox.text-right').css('padding-left'))) + Math.ceil(parseFloat($('.toolbar[data-smaller-show] .toolbox.text-right').css('padding-right')));
		var arrowoffset = 0;
		var titlewidth = 0;
		if ($('header').hasClass('smaller')) {
			// reset bottom components when changing between pages and threads
			if (typeof reset != 'undefined' && reset) {
				_elementindex = 0;
				_elementswidth = [];
				_elementswidthalt = 0;

				$('#header_nav_title').removeAttr('style');
				$('#header_toolbox_left').removeAttr('style');
				$('#header_toolbox_left').css('padding-top', _titlepadding + 'px');
				if ($('#fixed_header_left_container').length > 0) {
					arrowoffset = $('#navbits_title > span:last').outerWidth( true ) + 5;
					titlewidth = $('#header_nav_title').outerWidth( true ) + paddingoffsetleft + arrowoffset;
					$('#fixed_header_left_container').css('width', $('#header_toolbox_left').outerWidth( true ) + 'px');
					$('#fixed_header_left_container_text').css('width', titlewidth + 'px');
				}
				for (i = 0; i < _elements.length; i++) {
					if (_elements[i] == 'header_navbits') {
						$('#navbits_title > a').each(function() {
							$(this).removeClass('hide-for-small-up');
						});
						$('#navbits_title > span').each(function() {
							$(this).removeClass('hide-for-small-up');
						});
					}
					else {
						$('#' + _elements[i]).removeClass('hide-for-small-up');
					}
				}
			}

			leftwidth = $('#header_toolbox_left').outerWidth( true );
			rightwidth = $('#header_toolbox_right').outerWidth( true );
			rightelements = paddingoffsetright;
			$('#header_toolbox_right > a:visible').each(function() {
				rightelements += $(this).outerWidth( true ) + 5;
			});

			var totalwidth = leftwidth + rightwidth;
			if (totalwidth > windowwidth || rightelements > windowwidth) {
				// Hide menu items if there is not enough space
				while (totalwidth > windowwidth || rightelements > windowwidth) {
					if(_elementindex == _elements.length) {
						// No elements left to hide so break out of the loop
						break;
					}
					if (_elements[_elementindex] == 'header_navbits') {
						var elementswidth = 0;
						$('#navbits_title > a:visible').each(function() {
							elementswidth += $(this).outerWidth( true );
							$(this).addClass('hide-for-small-up');
						});
						$('#navbits_title > span:visible').each(function() {
							elementswidth += $(this).outerWidth( true );
							$(this).addClass('hide-for-small-up');
						});
						$('#header_nav_title').css('clear', 'both');
						$('#header_nav_title').css('float', 'left');
						$('#header_nav_title').css('overflow', 'hidden');
						$('#header_nav_title').css('white-space', 'nowrap');
						$('#header_nav_title').css('width', '100%');
						$('#header_toolbox_left').css('width', 'calc(100% - ' + (rightwidth + 5) + 'px)');
						$('#header_toolbox_left').css('padding-top', '0px');
						$('#header_nav_title').css('line-height', $('#header_toolbox_right').outerHeight( true ) + 'px');
						$('#header_nav_title').css('vertical-align', 'middle');
						var leftheight = $('#header_toolbox_left').outerHeight( true );
						var rightheight = $('#header_toolbox_right').outerHeight( true );
						if (leftheight > rightheight) {
							$('#header_toolbox_right').css('line-height', leftheight + 'px');
							$('#header_toolbox_right').css('vertical-align', 'middle');
						}
						else {
							$('#header_nav_title').css('line-height', rightheight + 'px');
							$('#header_nav_title').css('vertical-align', 'middle');
						}

						var tempwidth = parseInt($('#header_toolbox_left').css('width'));
						if (tempwidth > 0) {
							_elementswidthalt = Math.max(tempwidth, _elementswidthalt);
						}
					}
					else {
						$('#' + _elements[_elementindex]).addClass('hide-for-small-up');
					}

					var newleftwidth = $('#header_toolbox_left').outerWidth( true );
					var oldwidth;
					if (rightelements <= windowwidth) {
						oldwidth = totalwidth;
						totalwidth = newleftwidth + $('#header_toolbox_right').outerWidth( true );
					}
					else {
						oldwidth = rightelements;
						rightelements = paddingoffsetright;
						$('	#header_toolbox_right > a:visible').each(function() {
							rightelements += $(this).outerWidth( true ) + 5;
						});
						totalwidth = rightelements;
					}
					_elementswidth[_elementindex] = oldwidth - totalwidth + 5;
					_elementindex++;
				}
			}
			else {
				// Show menu items if there is enough space
				while (totalwidth < windowwidth) {
					var checkanyway = false
					var containerhasoverflow = false;
					if (_titlepadding == 0) {
						_titleOffsetPadding();
					}
					if (_elements[_elementindex - 1] == 'header_navbits') {
						checkanyway = true;
						containerhasoverflow = ($('#fixed_header_left_container').width() > $('#header_toolbox_left').width() + paddingoffsetleft);
					}
					if(_elementindex - 1 < 0) {
						// No elements are hidden so break out of the loop
						break;
					}
					else if (_elementswidth[_elementindex - 1] + totalwidth < windowwidth || checkanyway) {
						// The width of the element to be shown plus magicbar width is less than windowwidth so show the element
						if (checkanyway && !containerhasoverflow) {
							$('#navbits_title > a').each(function() {
								$(this).removeClass('hide-for-small-up');
							});
							$('#navbits_title > span').each(function() {
								$(this).removeClass('hide-for-small-up');
							});
							$('#header_nav_title').removeAttr('style');
							$('#header_toolbox_left').removeAttr('style');
							$('#header_toolbox_left').css('padding-top', _titlepadding + 'px');

							var leftheight = $('#header_toolbox_left').outerHeight( true );
							var rightheight = $('#header_toolbox_right').outerHeight( true );
							if ($('#header_usercp_menu2').length == 0) {
								if (leftheight > rightheight) {
										$('#header_toolbox_right').css('line-height', leftheight + 'px');
										$('#header_toolbox_right').css('vertical-align', 'middle');
									}
							}
							else {
								if (leftheight < rightheight) {
									var tempoffset = (rightheight - leftheight) / 2;
									$('#header_toolbox_left').css('padding-top', tempoffset + 'px');
								}
							}
						}
						else if (!checkanyway)  {
							$('#' + _elements[_elementindex - 1]).removeClass('hide-for-small-up');
						}
						else {
							break;
						}
						_elementindex--;
					}
					else {
						break;
					}
				}
			}
		}
	};

	var _resizeSearchBar = function(restore) {
		var leftwidth = 0;
		$('.top-nav-left > ul > li:visible').each(function() {
			leftwidth += $(this).outerWidth( true );
		});

		if (restore && $('.top-nav-left > ul > li.hide').length == 0 && _searchbardefaultwidth + leftwidth < $( window ).width()) {
			$('.top-nav-right .has-form').removeAttr('style');
			$('.top-nav-right-form').removeAttr('style');
			$('.searchbox ').removeAttr('style');
			$('.searchbox-key').removeAttr('style');
			_searchbarissmaller = false;
		}
		else {
			var tempsearchbarwidth = $('<span/>').html($('.searchbox-key').attr('placeholder')).css({
				position: 'absolute',
				left: -99999,
				top: -99999
			}).appendTo('body');
			var paddingoffset = 5;
			var tempwidth = tempsearchbarwidth.width() + 5;
			_searchbarwidth = tempwidth + $('.searchbox-btn').width() + $('.searchbox-icon').width() + paddingoffset;
			$('.top-nav-right .has-form').css('width', (_searchbarwidth + $('.searchbox-icon').width()) + 'px');
			$('.top-nav-right-form').css('width', _searchbarwidth + 'px');
			$('.searchbox ').css('width', 'inherit');
			$('.searchbox-key').css('width', tempwidth + 'px');
			tempsearchbarwidth.remove();
			_searchbarissmaller = true;
		}
	};

	function Init(options) {
		_options.active = 1;
		_forumid = parseInt(options.forumid);
		_threadid = parseInt(options.threadid);

		if (options.navbits) {
			$('#' + _navbitstitle).html(options.navbits);
		}

		if (options.showfirstunread) {
			var urldecoded = $('<div />').html(options.firstunread).text();
			var index = $('#viewfirstunread').attr('href').indexOf('#');

			if (urldecoded.indexOf('#') >= 0) {
				urldecoded = $('#viewfirstunread').attr('href').slice(0, index) + urldecoded;
			}

			$('#viewfirstunread').attr('href', urldecoded).show();

			$('#viewfirstunread').show();
			_options.viewfirstunread = true;
			_options.viewfirstunreadlink = urldecoded;
		}
		else {
			_options.viewfirstunread = false;
		}

		if (options.showthreadsearch) {
			$('#' + _threadsearchlinkid).show();
		}

		_searchbardefaultwidth = $('.top-nav-right').width();
		window.addEventListener('scroll', _scrollListener, false);
		window.addEventListener('resize', _showMenuItemsNavbar, false);
		_showMenuItemsNavbar();

		if ($('#tt_threadrating_options .rating-on').length > 0) {
			_threadrating = $('#tt_threadrating_options .rating-on input').val();
		}

		$(document).on('fndtn.searchbar.click', function (e){
			var leftwidth = 0;
			$('.top-nav-left > ul > li:visible').each(function() {
				leftwidth += $(this).outerWidth( true );
			});
			if ($('.top-nav-left > ul > li.hide').length == 0 && _searchbardefaultwidth + leftwidth < $( window ).width()) {
				_resizeSearchBar(true);
			}
			else {
				_resizeSearchBar(false);
			}
			_showMenuItemsNavbar();
		});
	}

	var _timeout;
	var _options = {};
	var _forumid = 0;
	var _threadid = 0;
	var _isloggedin;
	var _latestpost = $('#latestpost');
	var _navbitstitle = 'navbits_title';
	var _threadsearchid = 'threadsearch_drop';
	var _threadsearchlinkid = 'header_threadsearch';
	var _threadtoolsid = 'threadtools_drop';
	var _threadtoolslinkid = 'header_threadtools';
	var _headerusercpmenu = 'usercp_menu';
	var _headernotificationsmenu = 'notifications_menu1';
	var _elementindex = 0;
	// Order in which lower header elements should be hidden
	var _elements = ['header_navbits','header_toolbox_left','viewfirstunread', 'header_threadtools', 'header_threadsearch', 'header_forum_sponsor', 'header_usercp_menu2', 'header_notifications_menu2'];
	// Array of the lower header element widths
	var _elementswidth = [];
	var _elementswidthalt = 0;
	var _issmaller = false;
	var _threadrating = 0;
	var _searchbarissmaller = false;
	var _searchbarwidth = 0;
	var _searchbardefaultwidth = 0;
	var _titlepadding = 0;

	window.vB_FixedHeader = vB_FixedHeader;

}(window, document, window.jQuery));
