global.$ = $;

var gui = require('nw.gui');
var win = gui.Window.get();
win.showDevTools();

var _ = require('underscore');
var config = require('config');
var mManager = require('musicManager');
var mPlayer = require('musicPlayer');
var rControl = require('remoteControl');
var sConnector = require('serverConnector');
var server_list;

var l = require('logger'); // logger





config.on('load-complete',function(){ l.log("Config carregado com sucesso"); });


mManager.on('load-list', function (){
	console.log("mManager - load-list");
	//sConnector.loadList();
});
sConnector.on('loadedlist',function( data ){ 
	mManager.loadList( data );
	console.log("Lista carregada com sucesso pelo sConnector e passada ao mManager");
});
mManager.on('loadmusic-start',function(music){ l.log('"'+music.name+'"',"carregando.");});
mManager.on('loadlist-complete',function(music){ l.log('"'+music.name+'"',"carregada com sucesso.");});
mManager.on('loadmusic-complete',function(music){ l.log('"'+music.name+'"',"carregada com sucesso.");});
mManager.on('download-completed',function(data){ l.log("Todas as músicas da nova playlist já estão carregadas."); });


// TRAY
var tray = new gui.Tray({ title: 'GRAVE PLAYER', icon: 'images/logo_16.png' });
var menu = new gui.Menu();
menu.append(new gui.MenuItem({ type: 'checkbox', label: 'Ativar' }));
tray.on('click', function(){ win.restore(); });
//win.on('blur',function(){ win.minimize(); });
tray.menu = menu;
// ENDS TRAY




//Remote control events
rControl.on('reset-lists',function(){  mManager.resetLists(); });
rControl.on('play-special',function( data ){   mManager.playSpecial( data ); });
rControl.on('nothing',function(){  /*/console.log('no orders');/*/ });



config.init();
sConnector.init(config.player, config.server);
sConnector.loadList();
mManager.init( config.player, config.server, openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024) );
rControl.init(config.player, config.server, 50000);



$(function(){
	l.log( "Player verão", config.version);
	l.init();	
	l.on('update',function(log){ $('#console').val(l.render()+$('#console').val()); });	
	
	mPlayer = new mPlayer( document );
	mPlayer.on('musicStart',function( channel, music ){ 
		$('#list').val( music.name + '\n' + $('#list').val() ); 
		console.log('musicStart event on Main');
	});
	mPlayer.on('musicPlaying',function( pos, current, total ){ 
		$('#stream div').css('width', Math.round( pos * 100 ) + "%" );
		$('#playback_stream > div').last().find('span').eq(0).html( timeFormat(current) );
		$('#playback_stream > div').last().find('span').eq(1).html( timeFormat(total) );
	});
	mPlayer.on('next-music',function (){ var music = mManager.nextMusic(); mPlayer.nextMusic(music); });
	mManager.on('next-music',function (){ var music = mManager.nextMusic(); mPlayer.nextMusic(music); });
	//mPlayer.on('next-music',function (){ console.log("Evento no main"); });
	
	
	mManager.localList( function(){ mPlayer.init();} );

	$('.commands input').eq(0).click(function(){
		mManager.localList();
		l.log("Lista de músicas atualizada.");
	});

	$('#playback_control > span').eq(0).click(function(){
		mPlayer.play();
	});
	$('#playback_control > span').eq(1).click(function(){
		mPlayer.getNextMusic();
	});
	$('#teste').click(function(){
		console.log('teste');
		mPlayer.playExtra('chamada.ogg');
	});

	$('#screens_control i').each(function(i){
		$(this).click(function(){ $('#body').animate({scrollLeft: ($(".screen").width() * i )},150);});
	});
	
	mManager.on('log',function(data){ l.log(data); });
	rControl.on('log',function(data){ l.log(data); });
	mPlayer.on('log',function(data){ l.log(data); });
});

function timeFormat(segs){
	if( !_.isNumber(segs) ){ return ( "00:00" ); }
	var mins = Math.floor( segs / 60 );
	var segs = Math.floor(segs % 60);
	mins = ( mins < 10 )? "0" + mins : mins ;
	segs = ( segs < 10 )? "0" + segs : segs ;
	return ( mins + ":" + segs );
}