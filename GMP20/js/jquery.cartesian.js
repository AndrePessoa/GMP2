$(function(){
	$.fn.cartesian = function( options ) {
	 
		var defaults = {
			pin: ".pin",
			animate: 500,
			x: 0,
			y: 0,
			pX: 0,
			pY: 0
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
				x: settings.x,
				y: settings.y,
				pX: settings.pX,
				pY: settings.pY,
				elem: elem.find(settings.pin)
			};

	        elem.val = function( val ){
	        	
	        	if( val.pX !== undefined ){
	        		pin.pX = val.pX;
	        		pin.x  = val.pX * elem.width();
	        		
	        		pin.pY = val.pY ;	  
					pin.y  = val.pY * elem.height();	        		      		

	        		move( pin.elem, { top: pin.y, left: pin.x } );
	        	}else if( val.x !== undefined ){
	        		pin.x = val.x;
	        		pin.pX = val.x / elem.width();

	        		pin.y = val.y ;
	        		pin.pY = val.y / elem.height();

	        		move( pin.elem, { top: pin.y, left: pin.x } );
	        	}
	    		var result = { 
	    			x: pin.x, 
	    			y: pin.y, 
	    			pX: (pin.x/elem.width()), 
	    			pY: (pin.y/elem.height())
	    		};

	    		return result;
	    	};

			elem.val( pin );// pos the init
			console.log("CARTESIAN",pin);

	        elem.click(function(e){
				var posX = $(this).offset().left, posY = $(this).offset().top;
				pin.x = (e.pageX - posX);
				pin.y = (e.pageY - posY);

				var result = elem.val( { x: pin.x, y: pin.y } );

				//{ x: pin.x, y: pin.y, pX: (pin.x/elem.width()), pY: (pin.y/elem.height()) };

				elem.trigger( jQuery.Event( "change", result ) );
	        });

	 
	    });
	 
	};
});