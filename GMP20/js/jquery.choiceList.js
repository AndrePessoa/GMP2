$(function(){
    $.fn.choiceList = function( options ) {
     
        var defaults = {
            template:"<li></li>"
        };

        var settings = $.extend({}, defaults, options);

        var self = this;
  
        // Iterate and reformat each matched element.
        //return this.each(function() {
     
        var sel = false;

        list = [];
        elem = $( this );

        elem.addItem = function( e, data ){
            // if(!(e instanceof jQuery)){
            //     var el = $(settings.template);
            //     el.html( e );
            //     e = $(el);
            // }

            elem.append(e);
            list.push({ elem: e, data: data });

            e.on('click',function(){
                elem.children().removeClass('selecionado');
                $(this).addClass('selecionado');
                self.sel = data;
                elem.trigger( "mudou", self.sel );
            });

            if( list.length == 1 ){ e.click(); }
            
            return e;
        };

        elem.val = function(){
            return selected;
        };
 
        return elem;

        //});
     
    };
});