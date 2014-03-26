/*****************************
	By Nathanaël KHODL
	nathanael.khodl@epfl.ch
/*****************************/

$(function(){

	$options = $('#options') ;
	$('#link-options').click(function(){
		$options.slideDown() ;
		return false ;
	});

	$('#link-options-close').click(function(){
		$options.slideUp();
		return false ;
	});

});