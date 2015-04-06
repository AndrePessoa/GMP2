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

sConnector.on('loadedlist',function( data ){ 
	mManager.loadList( data );
	console.log("Lista carregada com sucesso pelo sConnector e passada ao mManager");
});
mManager.on('loadmusic-start',function(music){ l.log('"'+music.name+'"',"carregando.");});
mManager.on('loadlist-complete',function(music){ l.log('"'+music.name+'"',"carregada com sucesso.");});
mManager.on('loadmusic-complete',function(music){ l.log('"'+music.name+'"',"carregada com sucesso.");});
mManager.on('download-completed',function(data){ 
	l.log("Todas as músicas da nova playlist já estão carregadas."); 
	toggleBotaoAtualizar( true );
	mManager.makeUpdateAvaiable();
});
mManager.on('autoupdate',function(data){ 
	mPlayer.play();
});
mManager.on('start',function(data){ 
	mPlayer.play();
});
mManager.on('play-chamada', function(data){ 
	console.log(data);
	mPlayer.playChamada(data);
});

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



config.on('loadcomplete',function(){ 
	l.log("Config carregado com sucesso"); 
	$('h1').text(config.player.client);
});

config.init();
sConnector.init(config.player, config.server);
sConnector.loadList();
mManager.init( config.player, config.server, openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024) );
rControl.init(config.player, config.server, 50000);



$(function(){
	l.log( "Player versão", config.version);
	if(config.status=='loaded')$('h1').text(config.player.client);
	l.init();	
	l.on('update',function(log){ $('#console').val(l.render()+$('#console').val()); });	
	
	mPlayer = new mPlayer( document );
	mPlayer.on('musicStart',function( channel, music ){ 
		//$('#list').val( music.name + '\n' + $('#list').val() ); 
		adicionarMusicaTabela( music );
	});
	mPlayer.on('next-music',function( channel, music ){
		callNext();
		console.log('chamou outra musica');
	});
	
	mPlayer.on('musicPlaying',function( pos, current, total ){ 
		$('#stream div').css('width', Math.round( pos * 100 ) + "%" );
		$('#playback_stream > div').last().find('span').eq(0).html( timeFormat(current) );
		$('#playback_stream > div').last().find('span').eq(1).html( timeFormat(total) );
	});
	mManager.on('ready-to-start',function (){  callNext(); });
	mManager.on('just-one',function (){ l.log( "Somente uma música da playlist atende aos requesitos. "); });
	mManager.on('new-playlists',function (arr_playlists){ 
		for(i=0;i<arr_playlists.length;i++){
			playlists.addItem($('<li><i class="fa fa-play"></i>'+arr_playlists[i].playlist+'</li>'), arr_playlists[i]);
		}
	});
	

	/* VIEWS */

	var moods = $('#moods').cartesian({pin:"#moodLpin", animate: 0});
	moods.on('change',function(e){
		mManager.setSelectedPoint(e);
	});

	var playlists = $("#playlists_screen ul").choiceList();
	playlists.on('mudou', function( e, playlist ){
		mManager.setSelectedPlaylist(playlist);
	});	
	
	var configForm = $('#config_screen form').eoForm();
	//configForm.load( config.player );
	configForm.submit(
		function(){ 
			//console.log();
			config.player = configForm.save();
			config.save();

			var def = $('#config_screen form [type=submit]').val();
			$('#config_screen form [type=submit]').val('salvo !');
			setTimeout(function(){ $('#config_screen form [type=submit]').val(def); },1500);
			return false;
		}
	);

	/*$('.commands input').eq(0).click(function(){
		mManager.localList();
		l.log("Lista de músicas atualizada.");
	});*/

	$('#bt-update').add("#play_screen form.commands button").click(function(){
		mManager.updateLocalList();
		toggleBotaoAtualizar(false);
		l.log("Atualizou lista de músicas com as musicas do servidor");
	});

	$('#bt-play').click(function(){
		mPlayer.play();
	});
	$('#bt-forward').click(function(){
		callNext();
	});
	$('#bt-teste').click(function(){
		mManager.playSpecial('chamada.ogg');
	});

	$('#screens_control li').each(function(i){
		$(this).click(function(){ $('#body').animate({scrollLeft: ($(".screen").width() * i )},150);});
	});

	$('[name="irDebbug"]').click(function(){ $('#body').animate({scrollLeft: ($(".screen").width() * 3 )},150);});
	
	mManager.on('log',function(data){ l.log(data); });
	rControl.on('log',function(data){ l.log(data); });
	mPlayer.on('log',function(data){ l.log(data); });
});

function toggleBotaoAtualizar( forceShow ){
	$("#play_screen form button").toggleClass( 'hide', !forceShow );
}

function adicionarMusicaTabela(music){
	var linha = $('<tr></tr>');
	linha.append($('<td></td>').text(music.name));
	linha.append($('<td></td>').text(music.band || music.artist));
	$('#list tbody').prepend( linha ); 
	$('#list tbody tr').eq(5).remove();
	console.log('musicStart event on Main');
}

function timeFormat(segs){
	if( !_.isNumber(segs) ){ return ( "00:00" ); }
	var mins = Math.floor( segs / 60 );
	var segs = Math.floor(segs % 60);
	mins = ( mins < 10 )? "0" + mins : mins ;
	segs = ( segs < 10 )? "0" + segs : segs ;
	return ( mins + ":" + segs );
}

function callNext(){
	function a(b){
		mPlayer.nextMusic(b);
	}
	mManager.nextMusic(a);
}