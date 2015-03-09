$(function(){
	$.fn.cartesian = function( options ) {
	 
		var defaults = {
			pin: ".pin",
			animate: 500
		};

		var settings = $.extend({}, defaults, options);
		var move;
		if(settings.animate){
			move = function(e, d){ 
				e.animate(d,settings.animate);
			};
		}else{
			move = function(e, d){ 
				e.css(d);
			};
		}

	    // Iterate and reformat each matched element.
	    return this.each(function() {
	 
	        var elem = $( this );
	 
	        var pin = {
				x: 0,
				y: 0,
				elem: elem.find(settings.pin)
			};

	        elem.click(function(e){
				var posX = $(this).offset().left, posY = $(this).offset().top;
				pin.x = (e.pageX - posX);
				pin.y = (e.pageY - posY);

				move( pin.elem, { top: pin.y, left: pin.x } );

				var result = { x: pin.x, y: pin.y, pX: (pin.x/elem.width()), pY: (pin.y/elem.height()) };

				elem.trigger( jQuery.Event( "change", result ) );
	        });

	        elem.val = function(){
	    		var result = { x: pin.x, y: pin.y, pX: (pin.x/elem.width()), pY: (pin.y/elem.height()) };
	    		return result;
	    	};
	 
	    });
	 
	};
});