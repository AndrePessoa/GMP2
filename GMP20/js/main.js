global.$ = $;

var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();

var _ = require('underscore');
var config = require('config');
var mManager = require('musicManager');
var mPlayer = require('musicPlayer');

var l = require('logger'); // logger

config.on('load-complete',function(){ l.log("Config carregado com sucesso"); });
mManager.on('loadlist-complete',function(data){ 
	l.log("Lista carregada com sucesso");
	this.downloadMusics();
});
mManager.on('loadmusic-start',function(music){ l.log('"'+music.name+'"',"carregando.");});
mManager.on('loadmusic-complete',function(music){ l.log('"'+music.name+'"',"carregada com sucesso.");});
mManager.on('loadmusic-allcomplete',function(data){ l.log("Todas as músicas atualizadas."); });

// TRAY
var tray = new gui.Tray({ title: 'GRAVE PLAYER', icon: 'images/logo_16.png' });
var menu = new gui.Menu();
menu.append(new gui.MenuItem({ type: 'checkbox', label: 'Ativar' }));
tray.on('click', function(){ win.restore(); });
//win.on('blur',function(){ win.minimize(); });
tray.menu = menu;
// ENDS TRAY

config.init();
mManager.init( config.player, config.server, openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024) );


$(function(){
	l.log( "Player verão", config.version);
	l.init();	
	l.on('update',function(log){ $('#console').val(l.render()+$('#console').val()); });	

	mPlayer = new mPlayer( document );
	mPlayer.on('musicStart',function( channel, music ){ $('#list').val( music.name + '\n' + $('#list').val() ); });
	mPlayer.on('musicPlaying',function( pos, current, total ){ 
		$('#stream div').css('width', Math.round( pos * 100 ) + "%" );
		$('#playback_stream > div').last().find('span').eq(0).html( timeFormat(current) );
		$('#playback_stream > div').last().find('span').eq(1).html( timeFormat(total) );
	});
	mManager.localList( function(list){ mPlayer.init(list);} );

	$('.commands input').eq(0).click(function(){
		mManager.updateList(function(){mManager.localList(function(list){ mPlayer.resetList(list);});});
		l.log("Lista de músicas atualizada.");
	});

	$('#playback_control > span').eq(1).click(function(){
		mPlayer.nextMusic();
	});

	$('#screens_control i').each(function(i){
		$(this).click(function(){ $('#body').animate({scrollLeft: ($(".screen").width() * i )},150);});
	});
});

function timeFormat(segs){
	if( !_.isNumber(segs) ){ return ( "00:00" ); }
	var mins = Math.floor( segs / 60 );
	var segs = Math.floor(segs % 60);
	mins = ( mins < 10 )? "0" + mins : mins ;
	segs = ( segs < 10 )? "0" + segs : segs ;
	return ( mins + ":" + segs );
}