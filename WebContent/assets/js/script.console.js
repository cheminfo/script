/*****************************
	By Nathanaël KHODL
	nathanael.khodl@epfl.ch
/*****************************/


/* CONSOLE */

	var $tabs = null ;
	var $writeConsole = function(text) {} ;
	var $clearConsole = function() {} ;
	var $displayConsole = function(){} ;
	var $displayHelp = function(){} ;
	var $alertOrConsole = function() {};
	var $adaptPanelHeight = function() {};



	$(function(){

		var $consoleLines = [] ;
		var $consoleBlock = $('#console') ;
		
		$writeConsole = function(text){
			function formatTwoDigits(n) {
				return n > 9 ? "" + n: "0" + n;
			}
			$newLine = $('<div>').addClass("console-line").append(text) ;
			d = new Date();
			$hour = $('<span>').addClass("console-time") ;
			$hour.append(formatTwoDigits(d.getHours()) + ":" + formatTwoDigits(d.getMinutes()) + ":" + formatTwoDigits(d.getSeconds())) ;
			$newLine.prepend($hour) ;
            $consoleBlock.append($newLine);
			$newLine.hide(0,function(){$newLine.fadeIn(1,function(){

                $consoleBlock.each( function() {
                    $(this).scrollTop(this.scrollHeight) ;
                });

            })}) ;

			//$consoleLines.push($newLine) ;
			$displayConsole() ;
		}
		
		$clearConsole = function(){
			$displayConsole() ;
			$clear = $('<span>').append("Console cleared").delay(1000).fadeOut(1000) ;
			$consoleBlock.html($clear) ;
		}

		$alertOrConsole = function($text) {
			if($currentProjectNode)
				$writeConsole($text);
			else
				$alert($text);
		}

	}); 

/* TABS */

	$(function(){


		function adaptConsoleHeight(divH){
			$margin = 103 ;
			$('#console').height(divH-$margin) ;
		}
		function adaptHelpHeight(divH){
			//$margin = 62 ;
			$margin = 102 ;
			$('#help-text').height(divH-$margin) ;
		}

      $adaptPanelHeight = function(){
      	$("#right-panel").height($("#editor-panel").height());

      	$hei = $("#right-panel").outerHeight() ;
      	adaptConsoleHeight($hei) ;
      	adaptHelpHeight($hei);

      }
      
      $tabs = $("#side-tabs") ;
      $tabs.tabs({
        //event: "mouseover",
        heightStyleType : "fill"
      });

      function setCurrentTab(i){
      	$tabs.tabs({active:i});
      }

      $displayConsole = function(){
      	setCurrentTab(0);
      }

      $displayHelp = function(){
      	setCurrentTab(1);
      }

      /*
      $adaptPanelHeight();
      $(window).resize(function() {
			adaptPanelHeight() ;
		});
*/



    });