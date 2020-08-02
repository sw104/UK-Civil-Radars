/*================================================== NAV MENU */
(function ($) {

	var Main = {

		run: function () {
			Interactions.navMenu();
		}

	};

	var Interactions = {
		
		navMenu: function () {
			
			$('#nav_left li.no_children a').on('click touchstart', function () {
				$('#nav_left a.focus').removeClass('focus');
				$(this).toggleClass('focus');
			});	

			$('#nav_left a').each(function () {
			
				var el = $(this);
				var rtl = $('body').hasClass('rtl');
				
				if (el.siblings('ul.children').length) {
					
					el.append('<div class="nav-ctrl" style="cursor: pointer; position: absolute; ' + (rtl ? 'left' : 'right') + ': 0; top: 0; height: 27px; width: 27px;">&nbsp;</div>');
					
				}			
			});
			
			$('#nav_left a.clickable').click(
				function (e) {
					e.preventDefault();
				
					var el = $(this);
					
					// Mark with class
					if (el.siblings('ul.children').length) {
						if (el.siblings('ul.children').css('display') == 'block') {
							//el.removeClass('closed').addClass('open');
							el.removeClass('open').addClass('closed');
						} else {
							//el.removeClass('open').addClass('closed');
							el.removeClass('closed').addClass('open');
						}
					}
					
					// Show/hide child menu
					el.siblings('ul.children').slideToggle();

					return false;
				}					
			);
			
			$('#nav_left a div').click(
				function (e) {
					e.preventDefault();
				
					var el = $(this).parent();
					
					// Mark with class
					if (el.siblings('ul.children').length) {
						if (el.siblings('ul.children').css('display') == 'block') {
							//el.removeClass('closed').addClass('open');
							el.removeClass('open').addClass('closed');
						} else {
							//el.removeClass('open').addClass('closed');
							el.removeClass('closed').addClass('open');
						}
					}
					
					// Show/hide child menu
					el.siblings('ul.children').slideToggle();

					return false;
				}					
			);
			
		}
		
	};

	Main.run(); //invoke app

})(jQuery);