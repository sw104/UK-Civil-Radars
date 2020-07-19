/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

(function(window, document, $, undefined) {

	/* Global API */
	var vB_Analytics = {
		init: Init,
		push: function(params) {
			if (params === 'undefined') {
				params = [];
			}
			return _push(params)
		},
	};

	function _push(params)
	{
		if (params[0] === 'undefined') {
			params[0] = params;
		}
		if (params[1] === 'undefined') {
			params[1] = '';
		}
		switch (params[0]) {
			case 'pageview':
				_trackPageView(params[1]);
				break;

			case 'event':
				_trackEvent(params[1]);
				break;
		}
	}

	function _trackPageView(params) {
		switch(_options.type) {
			case 1:
				if (typeof _gaq !== 'undefined')
				{
					_gaq.push(['_trackPageview', params]);
				}
				break;

			case 2:
				if (typeof ga !== 'undefined')
				{
					// Temp fix since the path must start with a /.
					// We are also doing this to easily identify the infinite scroll pageviews
					var str = '/';
					params = str.concat(params);
					// End temp fix

					ga('set', 'page', params);
					ga('send', 'pageview');
				}
				break;
		}
	}

	function _trackEvent(params) {
		var category = action = label = value = '', noninteraction = false;

		if (params.category !== 'undefined') {
			category = params.category;
		}
		if (params.action !== 'undefined') {
			action = params.action;
		}
		if (params.label !== 'undefined') {
			label = params.label;
		}
		if (params.value !== 'undefined') {
			value = params.value;
		}
		if (params.noninteraction !== 'undefined') {
			noninteraction = params.noninteraction;
		}

		switch(_options.type) {
			case 1:
				if (typeof _gaq !== 'undefined')
				{
					_gaq.push(['_trackEvent', category, action, label, value, noninteraction]);
				}
				break;

			case 2:
				if (typeof ga !== 'undefined')
				{
					ga('send', 'event', category, action, label, value, {'nonInteraction': noninteraction});
				}
				break;
		}
	}

	function Init(options) {
		_options.type = 0;
		$.extend(_options, options);
	}

	var _options = {};

	window.vB_Analytics = vB_Analytics;

}(window, document, window.jQuery));
