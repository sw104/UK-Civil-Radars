/* ============================================================
 * Plugin Core Init
 * ============================================================ */
var heroSwiper; 
(function($) {
    
    // Handle mega menu clicks
    $('.mega-menu-close').click(function () {
        $('.menu > li').removeClass('open');
        $('body').removeClass('mega-menu-open');
    });
    
    //Intialize Slider
    if (Swiper) {
        var slider = new Swiper('#hero', {
            paginationClickable: true,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',
            parallax: false,
            speed:1000
        });
    }

	// Initialise new search
	$('#search-close-btn').click(function(e) {
		e.preventDefault();
		$('#search-overlay').fadeOut();
		$('#search-btn').show();
	});

	$('.utils-menu .icon.search a, .search-toggle').click(function(e) {
		e.preventDefault();
		$('#search-overlay').fadeIn();
		$('#search-text').focus();
	});	
    
    // Initialize Search
    $('[data-pages="search"]').search({
        // Bind elements that are included inside search overlay
        searchField: '#overlay-search',
        closeButton: '.overlay-close',
        // Callback that will be run when you hit ENTER button on search box
        onSearchSubmit: function(searchString) {
            console.log("Search for: " + searchString);
        },
        // Callback that will be run whenever you enter a key into search box. 
        // Perform any live search here.  
        onKeyEnter: function(searchString) {
            //console.log("Live search for: " + searchString)
            var searchField = $('#overlay-search');
            
            if ($('#prevsearchstring').val() == searchField.val()) {
                return;
            }
            
            var searchResults = $('.site-search-results');
            var searching = $('.site-searching');
            
            $('#prevsearchstring').val(searchField.val());
            
            // Set Timeout
            clearTimeout($.data(this, 'timer'));

            if (searchField.val().length > 2) {
            
                searchResults.fadeOut("fast"); // hide previously returned results until server returns new results
                searchResults.html('');
                searching.removeClass('hide').fadeIn("fast");
                
                var wait = setTimeout(function() {

                    $.ajax({
                        dataType: 'json',
                        url: searchAjaxURL,
                        data: {'format': 'json', 's': searchString},
                        success: function (data) {
                            
                            searchResultsHtml =  '<p class="bold">Search Results</p>';
                            searchResultsHtml += '<div class="list_article col-md-12 col-sm-12 col-xs-12 p-t-10 p-b-10">';
                            searchResultsHtml += '  <div class="row">';
                            
                            if (!data.posts.length) {
                                
                                    searchResultsHtml += '    <div class="list_article_post border-none col-md-12 col-sm-12 no-padding m-b-10">';
                                    searchResultsHtml += '        <div class="row">';
                                            
                                    searchResultsHtml += '            <div class="col-md-12 col-sm-12 p-b-15">';
                                    searchResultsHtml += '            <p class="m-b-0">Sorry, no results match your search.</p>';
                                    searchResultsHtml += '            </div>';
                                            
                                    searchResultsHtml += '        </div>';
                                    searchResultsHtml += '    </div>';                                    
                                    
                            } else {
                            
                                for (i in data.posts) {
                                    //console.log(data.posts[i]);
                                        
                                    searchResultsHtml += '    <div class="list_article_post col-md-12 col-sm-12 no-padding m-b-10">';
                                    searchResultsHtml += '        <div class="row">';
                                            
                                    searchResultsHtml += '            <div class="col-md-12 col-sm-12 p-b-15">';
                                    searchResultsHtml += '                <a href="'+data.posts[i].post_gs_link+'">';
                                    searchResultsHtml += '                    <h3>'+data.posts[i].post_title+'</h3>';
                                    searchResultsHtml += '                    '+data.posts[i].post_excerpt+'';
                                    searchResultsHtml += '                </a>';
                                    searchResultsHtml += '            </div>';
                                            
                                    searchResultsHtml += '        </div>';
                                    searchResultsHtml += '    </div>';
                                        
                                }
                                
                            }
                                
                            searchResultsHtml += '  </div>';
                            searchResultsHtml += '</div>';
                                
                            searchResults.html(searchResultsHtml);
                            
                            searching.addClass('hide').fadeOut("fast");
                            searchResults.removeClass('hide').fadeIn("fast"); // reveal updated results
                            
                        }
                    });
    
                }, 500);
                $(this).data('timer', wait);
                
            } else {
                searching.addClass('hide').fadeOut("fast");
            }
            
            /*

            // Timeout is used for DEMO purpose only to simulate an AJAX call
            clearTimeout($.data(this, 'timer'));
            searchResults.fadeOut("fast"); // hide previously returned results until server returns new results
            var wait = setTimeout(function() {

                searchResults.find('.result-name').each(function() {
                    if (searchField.val().length != 0) {
                        $(this).html(searchField.val());
                        searchResults.fadeIn("fast"); // reveal updated results
                    }
                });
            }, 500);
            $(this).data('timer', wait);
            
            */

        }
    });
    
})(jQuery);


/*================================================== NAV MENU */
(function ($) {
/*================================================== Main Callback */
var Main = {
	run: function () {
		supportNav.init();
		swiperSlider.init();
        videoPlay.init();
        videoPlayAutoplay.init();
		//mainNav.init();
		topScroll.init();
		if (!$('body').hasClass('ie9')) {
            mainSlider.init();
        }
		articleSticky.init();
        ArticleLength.init();
	}

};

//	Set client specific settings
var ClientSettings = {
	bpLap: 768, // 768PX Ipad
	bpDesk: 1165 // 992px Desktop
};

	var filterCheck = {
		init: function () {
			var $element = $('.radio-filter .label-wrap');
			$element.click(function (event) {
				var $radio = $(this).find('input[type="radio"]');
				event.preventDefault();
				if ($radio.is(':checked')) {
					$radio.prop('checked', false);
				} else {
					$radio.prop('checked', true);
				}
			});
		}
	};


	/*================================================== Support Nav */
	var supportNav = {

		mainPanel: '.support-nav-panel',
		element: '[data-link]',
		panel: '.content-panel',
		searchIcon: 'icon-search',
		searchInput: '#search_desktop',

		rolloverTimer: '',

		init: function () {
			this.tooltips();
			this.toggleFilter();
			
			var currentOpenPanel = false;
			var $mainPanel = $('.support-nav-panel');
			var element = $('.list-support-nav a[data-link]');
			var elementFilter =  $('.list-support-nav a[data-filter]');
			var elementList = $('.list-support-nav > li');
			var panel = '.content-panel';
			element.bind( "click touch", function(e) {
				e.preventDefault();
                
                $(this).parent().siblings().removeClass('active');
                $(this).parent().toggleClass('active');
                
                /*
				var calcRight = $(this).siblings(panel).css("right");

				if (currentOpenPanel) {
					$(panel).stop(true).css({"right": '0',"opacity": 0, "visibility": "hidden"});
					elementList.removeClass('active');
					$(this).parents().toggleClass('active');
				}
				
				if (calcRight == '60px') {
					$mainPanel.css('height','auto');
					$(this).siblings(panel).css('visibility', 'hidden').animate({"right": '0',"opacity": 0}, 100);
					$(this).parents().toggleClass('active');
					$(this).siblings(panel).fadeOut();
					currentOpenPanel = false;
				}
				else {
					$mainPanel.css('height','102%');
					$(this).siblings(panel).css('visibility', 'visible').animate({"right": '60px',"opacity": 1}, 100);
					$(this).parents().toggleClass('active');
					$(this).siblings(panel).fadeIn();					
					currentOpenPanel = true;
				}
				*/
				
			});			
			
		},

		//	Binding
		bindButtonHover: function () {
			//$('.list-support-nav').bind('mouseenter', this.eventListMouseEnter);
			//$('.list-support-nav').bind('mouseleave', this.eventListMouseLeave);
			//$(this.element).bind('click', this.eventButtonClick);
			$(this.element).bind('c', this.eventButtonMouseEnter);
			$(this.element).parents('li').bind('mouseleave', this.eventButtonMouseLeave);
		},
		bindInputBlur: function ($input) {
			$input.bind('blur.search', this.eventInputBlur);
		},

		//	Unbinding
		unbindInputBlur: function ($input) {
			$input.unbind('blur.search');
		},

		//	Events
		eventButtonClick: function (e) {
			e.preventDefault();
		},
		eventButtonMouseEnter: function () {
			var $this = $(this);
			supportNav.rolloverTimer = setTimeout(function () {
				supportNav.openPanel($this);
			}, 150);
			// supportNav.focusInput();
		},
		eventButtonMouseLeave: function () {
			clearTimeout(supportNav.rolloverTimer);
			var $this = $(this).find('[data-link]');
			supportNav.closePanel($this);
		},
		eventInputBlur: function (e) {
			var $input = $(e.currentTarget),
				$button = $input.parents(supportNav.panel).siblings(supportNav.element);
			supportNav.closePanel($button);
			supportNav.unbindInputBlur($input);
		},
		eventListMouseEnter: function () {
			$(supportNav.mainPanel).addClass('active');
		},
		eventListMouseLeave: function () {
			$(supportNav.mainPanel).removeClass('active');
		},

		//	Panels
		openPanel: function ($this) {
			var $parent = $this.parents('li'),
				$panel = $this.siblings(supportNav.panel),
				callback = $this.hasClass(supportNav.searchIcon) ? supportNav.focusInput : null;
			supportNav.animatePanel($panel, 'open', callback);
			$parent.addClass('active');
		},
		closePanel: function ($this) {
			var $parent = $this.parents('li'),
				$panel = $this.siblings(supportNav.panel);
			supportNav.animatePanel($panel, 'close', null);
			$parent.removeClass('active');
		},

		animatePanel: function ($panel, intent, callback) {
			if (intent === 'open') {
				$panel.css('visibility', 'visible');
			} else {
				$panel.stop();
			}
			$panel.animate({
				right: intent === 'open' ? 60 : -370
			}, 150, 'easeInOutCirc', function () {
				if (intent === 'close') $panel.css('visibility', 'hidden');
				if (typeof callback === 'function') callback();
			});
		},
		focusInput: function () {
			$(supportNav.searchInput).focus();
			supportNav.bindInputBlur($(supportNav.searchInput));
		},

		toggleFilter: function () {
			$('a[data-filter]').bind("click", function (e) {
				e.preventDefault();
                var el = $(this);
				$('ul.list-support-nav > li.active').each(function () {
					//$(this).find('.content-panel').stop(true).css({"right": '0',"opacity": 0, "visibility": "hidden"});
					$(this).removeClass('active');
                });
                
                el.parent().toggleClass('active');
                

                
                $('.hero-filter-module').parents('.col-md-9').toggleClass('full-width').promise().done(function(){
                    var count = 0;
                    var resizeFix = setInterval(function () {
                        if (count < 301) {
                            $(window).trigger('resize');
                            $('.swiper-container-stories').each(function () {
                                $(this).find('.swiper-slide').width($(this).width());
                                $(this)[0].swiper.slideTo(0);
                                $(this)[0].swiper.update();
                            });                            
                            //console.log('re-scale fix ' + count);
                        } else {
                            clearInterval(resizeFix);
                            //console.log('re-scale ended');
                        }
                        count++;
                    }, 1);
                });
                
                /*
                removeClass('active');
				// $(supportNav.panel).stop(true).animate({
				// 	"right": '0',
				// 	"opacity": 0
				// }, 100).fadeOut();
				$(this).parent().toggleClass('active');
				// $('#filterMain').toggleClass('hiddenDiv');
				$('.hero-filter-module').parents('.col-md-9').toggleClass('full-width');
				// $('#filter-section').toggleClass('bg_nats_black');
				e.preventDefault();*/
			});
		},

		tooltips: function () {

			// Top utils nav
			$('.utils-menu a').tooltip({placement: 'bottom'});

			// Bottom utils nav
			$('.footer-utils-menu a').tooltip({placement: 'top'});			

		}		
	};

	/*================================================== Swiper carousel */
	var swiperSlider = {
		init: function () {
			if ($('body').hasClass('ie9')) return;
			/* Generic Swiper Desktop*/
			var swiper = new Swiper('.swiper-container-general', {
				pagination: '.swiper-pagination',
				nextButton: '.swiper-feature-button-next',
				prevButton: '.swiper-feature-button-prev',
				slidesPerView: 'auto',
				simulateTouch: false,
				paginationClickable: true,
				spaceBetween: 1
			});

			var swiper = new Swiper('.swiper-container-blog', {
				pagination: '.swiper-pagination2',
				nextButton: '.swiper-feature-button-next2',
				prevButton: '.swiper-feature-button-prev2',
				slidesPerView: 'auto',
				simulateTouch: false,
				paginationClickable: false,
				spaceBetween: 0
			});

			var swiper = new Swiper('.swiper-container-blog-issue', {
				pagination: '.swiper-pagination',
				nextButton: '.swiper-feature-button-next',
				prevButton: '.swiper-feature-button-prev',
				slidesPerView: 'auto',
				simulateTouch: false,
				paginationClickable: true,
				spaceBetween: 1
			});

			var swiper = new Swiper('.swiper-container-article', {
				pagination: '.swiper-pagination',
				paginationClickable: true,
				simulateTouch: false,
				slidesPerView: 'auto',
				nextButton: '.swiper-article-next',
				prevButton: '.swiper-article-prev',
				spaceBetween: 1
			});

		}
	};

	/*================================================== Navigation Menu */
	var filterTag = {
			init: function () {
				var element = $('.filter-wrapper .text-post-tag');
				element.bind('click', function (e) {
					e.preventDefault();
					$(this).toggleClass('active');
				});
			}
		}
		/*================================================== Navigation Menu */
var mainNav = {
	init: function () {
		var windowSize = $(window).width();
         if (windowSize >= ClientSettings.bpDesk) {
			$('.menu > li > a').on('mouseenter', function(e) {
			   $(this).parent().toggleClass('open').siblings().removeClass('open');
			}); 
			$('.menu > li').on('mouseleave', function(e) {
				 $('.menu > li').removeClass('open');
			});
		 } else {
		 	$('.menu > li > a').on('click', function(e) {
                $(this).parent().toggleClass('open').siblings().removeClass('open');
                $(this).parent().siblings().toggleClass('hidden');
                var menuValue = $(this).attr('data-text');
                if($(this).parent().hasClass('open')){
                    $(this).text("Back");
                }
                else{
                    $(this).text(menuValue);
                }
            });
		 }
	}
};

/*================================================== Scroll Top Menu */
var topScroll = {
	init: function () {
		var offset = 300, // browser window scroll (in pixels)
		offset_opacity = 1200, //browser window scroll
		scroll_top_duration = 700, //duration (in ms)
		$back_to_top = $('.btn-top'); //grab the "back to top" link
		
	//hide or show the "back to top" link
	$(window).scroll(function(){
		( $(this).scrollTop() > offset ) ? $back_to_top.addClass('btn-is-visible') : $back_to_top.removeClass('btn-is-visible btn-fade-out');
	});
	//smooth scroll to top
	$back_to_top.on('click', function(event){
		event.preventDefault();
		$('body,html').animate({
			scrollTop: 0 ,
		 	}, scroll_top_duration
		);
	});
	}
}

var mainSlider = {
	init: function () {
		window.mainSwiper;
		var windowSize = $(window).width();
		if (windowSize < ClientSettings.bpDesk){
			mainSlider._globalSetting.slidesPerView = mainSlider._mobile.slidesPerView;
			mainSlider._globalSetting.slidesPerColumn = mainSlider._mobile.slidesPerColumn;
			mainSlider._s(mainSlider._globalSetting);
		}
		else {
			mainSlider._globalSetting.slidesPerView = mainSlider._desktop.slidesPerView;
			mainSlider._globalSetting.slidesPerColumn = mainSlider._desktop.slidesPerColumn;			
			mainSlider._s(mainSlider._globalSetting);
		}		
		// Resize 
	},
	_globalSetting : {
		nextButton: '.hero-swiper-button-next',
		prevButton: '.hero-swiper-button-prev',
		paginationClickable: true,
		simulateTouch: false,
		resizeReInit: true,
		resizeFix: true
	},
	_desktop : {
		slidesPerView: 1,
		slidesPerColumn: 3
	},
	_mobile : {
		
		slidesPerView: 'auto',
		slidesPerColumn: 1
	},
	resize: function () {
        if (typeof mainSwiper === 'undefined') {
            return;
        }
		var windowSize = $(window).width();
		if (windowSize < ClientSettings.bpDesk) {
			if (mainSwiper.destroy) {
                mainSwiper.destroy();
            }
			$(".hero-swiper-container .swiper-wrapper").removeAttr('style');
			$(".hero-swiper-container .swiper-wrapper li").removeAttr('style');
			mainSlider._globalSetting.slidesPerView = mainSlider._mobile.slidesPerView;
			mainSlider._globalSetting.slidesPerColumn = mainSlider._mobile.slidesPerColumn;
			mainSlider._s(mainSlider._globalSetting);
		} else {
			if (mainSwiper.destroy) {
                mainSwiper.destroy();
            }
			$(".hero-swiper-container .swiper-wrapper").removeAttr('style');
			$(".hero-swiper-container .swiper-wrapper li").removeAttr('style');
			mainSlider._globalSetting.slidesPerView = mainSlider._desktop.slidesPerView;
			mainSlider._globalSetting.slidesPerColumn = mainSlider._desktop.slidesPerColumn;			
			mainSlider._s(mainSlider._globalSetting);
		}
	},
	_s: function(_settings) {
			mainSwiper = new Swiper('.hero-swiper-container', _settings);
	}
	};


	var videoPlay = {
		init: function () {
			var element = $('.video-img-wrapper');
			var videoheight = element.height();

            element.click(function () {
                if ($(this).siblings('.video-container').size() > 0) {
                    //$(this).siblings('.video-container').find('iframe').height();
                    $(this).fadeOut(1);
                    $(this).siblings('.video-container').fadeIn('slow');
                    //$(this).hide();
                    /*
                    var player = $(this).parent().find('iframe');
                    var playerOrigin = '*';
                    var data = {
                      method: 'play'
                    };                
                    player[0].contentWindow.postMessage(data, playerOrigin);
                    */
                }
            });

		}
	};
    
	var videoPlayAutoplay = {
		init: function () {
			var element = $('.video-img-wrapper-autoplay');
            var videoURL = $(element).attr('data-video-url');
			var videoheight = element.height();
            var iframe = $('.video-container iframe');

            element.click(function () {
                if ($(this).siblings('.video-container').size() > 0) {
                    //$(this).siblings('.video-container').find('iframe').height();
                    iframe.attr('src', videoURL);
                    $(this).fadeOut(1);
                    $(this).siblings('.video-container').fadeIn('slow');
                    //$(this).hide();
                    /*
                    var player = $(this).parent().find('iframe');
                    var playerOrigin = '*';
                    var data = {
                      method: 'play'
                    };                
                    player[0].contentWindow.postMessage(data, playerOrigin);
                    */
                }
            });

		}
	};    

	// var articleNavigation = {
	// 	init: function () {
	// 		var element = $(".article-nav-wrapper a");
	// 		element.hover(function () {
	// 			$(this).find(".article-pagination").slideToggle('fast');
	// 		});
	// 	}

	// }

	var articleSticky = {
		init: function () {
			var windowSize = $(window).width();
			if (windowSize >= 900) {
				$(window).scroll(function () {
                    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
					var heroModule = $('.module-hero-article');
					var totalHeight = $(document).height() - $(".footer-wrapper").height();
					var maintotalHeight = totalHeight - windowHeight;
					var scrTop = $(document).scrollTop();
					var articleNav = $('.article-nav-wrapper');
					var backToTop = $('[data-back-to-top]');
					if (maintotalHeight < scrTop + 60) {
						var topCalc = -(scrTop - maintotalHeight) - 60;
						heroModule.css('top', topCalc);
						articleNav.css('bottom', Math.abs(maintotalHeight - scrTop - 60));
						backToTop.css('position', 'absolute');
					} else {
						heroModule.css('top', 0);
						articleNav.css('bottom', 0);
						backToTop.css('position', 'fixed');
					}
				});
			}

		}
	}

	var ArticleLength = {

		selector: '[data-article-progress]',
		article: '[data-article]',

		articleHeight: 0,

		init: function() {
			if ($(this.selector).length) {
				this.getLayout();
				this.eventScroll();
				this.bindScroll();
				this.bindResize();
			}
		},

		//	setup
		getLayout: function() {
			ArticleLength.articleHeight = ($(ArticleLength.article).height() + $(ArticleLength.article).offset().top) - $(window).innerHeight();
		},

		//	bindings
		bindScroll: function() {
			$(window).on('scroll', throttle(this.eventScroll, 100));
		},
		bindResize: function() {
			$(window).on('resize', throttle(this.eventResize, 500));
		},

		//	events
		eventScroll: function() {
			var percentage = ArticleLength.calculatePercentageRead();
			$(ArticleLength.selector).css('width', percentage + '%');
		},
		eventResize: function () {
			ArticleLength.getLayout();
		},

		//	utils
		calculatePercentageRead: function() {
			var scrollTop = $(window).scrollTop();
			return Math.min(scrollTop / ArticleLength.articleHeight * 100, 100).toFixed(1);
		}
	};    
    

	/*================================================== Load Main Run */
	Main.run(); //invoke app
	
	// Window Resize
    $( window ).resize(function() {
        //swiperSlider.init();
        //heroSwiper.update();
        mainSlider.resize();
    });
    
	function throttle(fn, threshhold, scope) {
		threshhold || (threshhold = 250);
		var last,
			deferTimer;
		return function() {
			var context = scope || this;

			var now = +new Date,
				args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function() {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}    
		
})(jQuery);
