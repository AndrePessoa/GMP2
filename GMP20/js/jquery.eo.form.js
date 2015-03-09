$(function(){
	$.fn.eoForm = function( options ) {
	 
		var defaults = {
		};

		var settings = $.extend({}, defaults, options);


	    // Iterate and reformat each matched element.
	    //return this.each(function() {
	 
        var elem = $( this );
 
        elem.save = function(){
        	var res = {};
        	elem.find('input').each(function(){
        		var name = $(this).attr("name") || $(this).attr("id");
        		switch($(this).attr('type')){
        			case "button":
        			case "submit":
        			break;
        			case "checkbox":
        			break;
        			case "radio":
        			break;
        			default:
        				res[name] = $(this).val();
        		}
        	});
        	return res;
        };

        elem.load = function(vars){
        	for( obj in vars ){
        		
        		var input = elem.find("[name="+obj+"]") || elem.find("#"+obj);
        		if(input.length){
	        		switch(input.attr('type')){
	        			case "button":
	        			case "submit":
	        			break;
	        			case "checkbox":
	        			break;
	        			case "radio":
	        			break;
	        			default:
	        				input.val( vars[obj] );
	        		}
	        	}
        		console.log( input );

        	}
        }

        return elem;
	 
	   // });
	 
	};
});