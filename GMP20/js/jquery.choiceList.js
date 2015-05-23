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

        elem.getList = function(){
            return list;
        }

        elem.setById = function( id ){
            if( list[id] ){
                elem.children().removeClass('selecionado');
                list[id].elem.addClass('selecionado');
                self.sel = list[id].data;
                elem.trigger( "mudou", self.sel );
                return true;
            } 
            return false;
        }

        elem.setChoice = function( data ){
            for (var i = list.length - 1; i >= 0; i--) {
                if( list[i].data == data ){
                    elem.children().removeClass('selecionado');
                    list[i].elem.addClass('selecionado');
                    self.sel = data;
                    elem.trigger( "mudou", self.sel );
                    return true;
                } 
            };
            return false;
        }
 
        return elem;

        //});
     
    };
});