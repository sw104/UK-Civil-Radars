/*======================================================================*\
|| #################################################################### ||
|| # vBulletin [#]version[#]
|| #################################################################### ||
\*======================================================================*/

// #############################################################################
// vB_Photoswipe_Container
// call using:
// vBulletin.register_control("vB_Photoswipe_Container", photoswipe_container_id, photoswipe_trigger_events)
// #############################################################################

vBulletin.events.systemInit.subscribe(function()
{
	if (vBulletin.elements["vB_Photoswipe_Container"])
	{
		for (var i = 0; i < vBulletin.elements["vB_Photoswipe_Container"].length; i++)
		{
			var element = vBulletin.elements["vB_Photoswipe_Container"][i];
			init_postbit_photoswipe(element[0], element[1]);
		}
		vBulletin.elements["vB_Photoswipe_Container"] = null;
	}
});

/**
* Global variables for photoswipe
*
* @var	array	Collection of all vB_Photoswipe objects
* @var	object	Window overlay element - created in init_postbit_photoswipe()
* @var	object	Window overlay intersecting <select> handler (vB_Select_Overlay_Handler)
* @var	integer	Default for the photoswipe event initialisation
*/
var Photoswipe_items = new Array();
var Photoswipe_items_ids = new Array();
var Photoswipe_event_default = null;

// =============================================================================

/**
* Activates an attachment thumbnail to have photoswipe functionality
*
* @param	object	Attachmnent Link
* @param	integer	Unique ID for the page
* @param	integer	Bitfield indicating what events to add
*/
function vB_Photoswipe(element, uniqueid, events)
{
	/**
	* Main class variables
	*
	* @var	integer	Bitmask for click event
	* @var	object	Link that would normally open the image, to which events are attached
	* @var	object	Timeout handler for hover countdown
	* @var	object	Javascript Image object for preloading photoswipe image
	* @var	integer	Status counter - increases value as status is closer to photoswipe ready for display
	*
	*/
	this.event_click = 0x1;
	this.element = element;
	this.timeout = null;
	this.imageloader = null;
	this.status = 0;
	this.cursor = null;
	this.imageid = '';

	this.uniqueid = uniqueid;

	// click event
	if (events & this.event_click)
	{
		jQuery(this.element).unbind('click').on('click', (this.image_click).bind(this));
	}
}

/**
* Sets the internal status of the object
*
* @param	integer	Status
*/
vB_Photoswipe.prototype.set_status = function(status, caller)
{
	console.log("vB_Lightbox :: Set status = %d (%s)", status, caller);
	this.status = status;
}

/**
* Checks the internal status of the object
*
* @param	integer	Status (checks for >= status)
*
* @return	boolean
*/
vB_Photoswipe.prototype.check_status = function(status)
{
	if (this.status >= status)
	{
		return true;
	}
	else
	{
		console.warn("Checked status for %d, found %d", status, this.status);
		return false;
	}
}

/**
* Click trigger to start the photoswipe process
*/
vB_Photoswipe.prototype.image_click = function(e)
{
	if (e.ctrlKey || e.shiftKey)
	{
		// ctrl or shift clicked -> let browser handle
		return true;
	}

	this.load_photoswipe(e);
}

/**
* Loads the photoswipe AJAX request to get info about the attachment
*/
vB_Photoswipe.prototype.load_photoswipe = function(e)
{
	//if (this.check_status(0) && !YAHOO.util.Connect.isCallInProgress(this.ajax_req))
	if (this.check_status(0))
	{
		this.set_status(2, "load_photoswipe 1");

		e = e || window.event;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;

		if (this.timeout)
		{
			clearTimeout(this.timeout);
			this.element.style.cursor = this.cursor;
		}

		this.imageid = e.currentTarget.getAttribute('id');
		this.set_status(3, "load_photoswipe 2");
		this.show_photoswipe();
	}
}

/**
* Shows, sizes and positions the photoswipe
*/
vB_Photoswipe.prototype.show_photoswipe = function()
{
	if (this.check_status(3))
	{
		var pswpElement = document.querySelectorAll('.pswp')[0],
			gallery,
			options,
			size,
			item,
			itemid,
			itemindex = 0,
			items = [],
			elem,
			src;

		if (typeof pswpElement == 'undefined')
		{
			return false;
		}

		if (typeof vB_LazyLoad != 'undefined')
		{
			vB_LazyLoad.load_images();
		}

		for (var i = 0; i < Photoswipe_items.length; i++)
		{
			elem = Photoswipe_items[i].element;
			itemid = Photoswipe_items[i].element.getAttribute('id');

			switch (elem.tagName.toUpperCase())
			{
				case 'PICTURE':
					elem = elem.getElementsByTagName('IMG')[0];
					src = elem.getAttribute('src');
					var picsize = elem.getAttribute('data-size');
					if (picsize)
					{
						picsize = picsize.split('x');
						picsize = scale_picture(parseInt(picsize[0]), parseInt(picsize[1]), elem.naturalWidth, elem.naturalHeight);
						size = picsize.width + 'x' + picsize.height;
					}
					break;
				case 'A':
					src = elem.getAttribute('href');
					size = elem.getAttribute('data-size');
					break;
				case 'IMG':
					src = elem.getAttribute('src');
					size = (elem.naturalWidth > 0 && elem.naturalHeight > 0) ? elem.naturalWidth + 'x' + elem.naturalHeight : '';
					break;
			}

			if (size)
			{
				size = size.split('x');
			}
			else
			{
				continue;
			}

			item = {
				src: src,
				w: parseInt(size[0], 10),
				h: parseInt(size[1], 10)
			};

			if (itemid == this.imageid)
			{
				itemindex = items.length;
			}

			items.push(item);
		}

		if (items.length > 0)
		{
			options = { index: itemindex };

			// Pass data to PhotoSwipe and initialize it
			gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
		}
	}
}

/**
* Scales image or picture size
*
* @param	integer	Proposed width
* @param	integer	Proposed height
* @param	integer	Original width
* @param	integer	Original height
*
* @return	object	New dimensions
*/
function scale_picture(width, height, orig_width, orig_height)
{
	if (orig_width == 0 || orig_height == 0)
	{
		return {'width': width , 'height': height};
	}

	var new_width = Math.ceil(orig_width * height / orig_height);
	var new_height = Math.ceil(width * orig_height / orig_width);

	if (width != new_width && height != new_height)
	{
		var ratio = (orig_height/orig_width) - (height/width);
		if (ratio < 0)
		{
			height = new_height;
		}
		else
		{
			width = new_width;
		}
	}

	return {'width': width , 'height': height};
}

/**
* Checks that the element passed is a valid link, picture, or image
*
* @param	integer	Index
* @param	object	Attachment <a> link
*/
function get_photoswipe_elements(selector)
{
	var elems = jQuery(selector).find('a[rel^=Photoswipe], picture[rel^=Photoswipe], img[class=post_inline_image]:not(.inlineimg)')
				.filter(function(index, elem){
					// elem cannot be in a signature or <img> that is a child of <picture>
					return ($(elem).parents('.signature').length == 0 && (elem.tagName.toUpperCase() != 'IMG' || elem.parentElement.nodeName.toUpperCase() != 'PICTURE'));
				})
				.get();

	return elems;
}

/**
* Creates the window overlay and hunts for attachment links to turn into photoswipe boxes
*
* @param	mixed	Element/elementid containing attachment links
*/
function init_postbit_photoswipe(elem, events)
{
	if (typeof elem == 'string')
	{
		elem = fetch_object(elem);
	}

	// set a global default in case the value isn't present in a subsequent call (like quickedit)
	if (Photoswipe_event_default === null)
	{
		Photoswipe_event_default = events;
	}

	if (typeof(events) == 'undefined' || events === false)
	{
		// click event + hover event is the default
		events = (Photoswipe_event_default ? Photoswipe_event_default : 0x1 + 0x2);
	}

	var totalitems = Photoswipe_items_ids.length;
	var elements = get_photoswipe_elements(elem);

	for (var i = 0; i < elements.length; i++)
	{
		if (elements[i].id == '')
		{
			elements[i].id = 'inline' + (totalitems + i);
		}

		// Check if the element already exists, if the element already exists we remove it so that it is added back.
		// if we don't remove it will be duplicated, if we don't add it back it won't open in photoswipe
		var item_location = jQuery.inArray(elements[i].id, Photoswipe_items_ids);
		if (item_location > -1)
		{
			Photoswipe_items_ids.splice(item_location, 1);
			Photoswipe_items.splice(item_location, 1);
		}

		// Add the element to photoswipe list
		var uniqueid = Photoswipe_items.length;

		Photoswipe_items_ids[uniqueid] = elements[i].id;
		Photoswipe_items[uniqueid] = new vB_Photoswipe(elements[i], uniqueid, events);
	}
}
