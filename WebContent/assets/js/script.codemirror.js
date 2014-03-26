/*****************************
	By Nathanaël KHODL
	nathanael.khodl@epfl.ch
/*****************************/
	
	var $setCMContent = function(text){} ;
	var $getCMContent = function(){return "" ;};
	var $setCMSaved = function(){return true ;};
	var $setCMChanged = function(){return true ;};
	var $parseCMError = function(){return false ;};
	var $isCodeSaved = function(){return true;};
	var $adaptCMHeight = function(){return true;};
	var $cm = null ;
	var server;
	var help;
	$(function(){
	
		$textarea = $("#code-editor") ;
		$statusSave = $('#save-script') ;
		$isCMSaved = true ;
		
		var defs=[];
		(function(){
			var files = [/*"./assets/help/ecma5.json",*/addresses().help];
			for(var i=0; i<files.length;i++){
				$.ajax({
					url: files[i],
					dataType: "json",
					async: false,
					success: function(data){
						defs.push(data);
						if(files[i]==addresses().help) help=data;
					}
				});		
			}
		})();
		
		function addEditor(){
			CodeMirror.commands.autocomplete = function(cm) {
				server.getHint(cm, function(data){
				});
		        //CodeMirror.showHint(cm, HELP.javascriptHint);
		    };
			$cm = CodeMirror.fromTextArea($textarea[0], {
				mode: "javascript",
				//onCursorActivity:function(cm) { console.log("onCursorActivity"); HELP.showHints(cm, hints);}, // HELP.showHints(cm, hints)
				lineNumbers: true,
				tabMode: "indent",
				autofocus: false,
				extraKeys: {
					"Ctrl-Space": function(cm) { server.complete(cm); },
					"Ctrl-Q": function(cm) { server.rename(cm); }
					},
				matchBrackets: true,
				highlightSelectionMatches: {showToken: /\w/},
			});
			
			server = new CodeMirror.TernServer({
				defs: defs,
				/*workerScript: "./assets/js/codemirror/addon/tern/worker.js",
				workerDeps: ["../../../tern/acorn.js","../../../tern/acorn-loose.js",
				             "../../../tern/walk.js","../../../tern/signal.js",
				             "../../../tern/tern.js","../../../tern/def.js",
				             "../../../tern/infer.js","../../../tern/comment.js",
				             "../../../tern/condense.js"],
				useWorker: false*/
			});
		}
		
		$isCodeSaved = function(){
			return $isCMSaved ;
		};
		
		$adaptCMHeight = function(a){
			if(! a)
				a = false ;
			$margin = 85 ;
			// Responsive height
			
			$plus = $('#editor-div').outerHeight() - $cm.getScrollInfo().height ; // $(".CodeMirror").outerHeight();
			$h = $(window).height()-$plus-$margin ;
			$cm.setSize(null, $h);
			$adaptPanelHeight() ;
			if(! a) $adaptCMHeight(true);
		
		};
		addEditor() ;
		
		var displayHelpCM = function(cm) {
			$displayHelp();
			HELP.showHints(cm, $('#help-text'));
		};
		
		$cm.on("cursorActivity", function(cm) {
			server.updateArgHints(cm);
			displayHelpCM(cm);
		});

		$cm.on("change", function(cm) {
			$setCMChanged() ;
		});

		$cm.on("focus",displayHelpCM);

/*		var currentCursorPosition = $cm.getCursor();
		var checkIfCursorChanged = function(cm){
			var nc = cm.getCursor();
			if(nc.line != currentCursorPosition.line || nc.ch != currentCursorPosition.ch){
				displayHelpCM(cm) ;
			}
			currentCursorPosition = nc ;
		};

		$cm.on("update",checkIfCursorChanged);*/

		$setCMContent = function(text){
			$result = $cm.setValue(text) ;
			$setCMSaved() ;
			return $result ;
		};
		$getCMContent = function(){
			return $cm.getValue() ;
		};
		$classUnsaved = "btn-danger" ;
		$setCMSaved = function(){
			$isCMSaved = true ;
			$statusSave.removeClass($classUnsaved) ;
			return true ;
		};
		
		$setCMChanged = function(){
			$isCMSaved = false ;
			$statusSave.addClass($classUnsaved) ;
			return true ;
		};
		$parseCMError = function(text){
			patt = new RegExp("([0-9]+)$");
			res = patt.exec(text);
			if(res){
				line = res[0] ;
				$number = $('<a>').append(line);
				$number.click(function(){
					$cm.setSelection({line:line-1,ch:0},{line:line,ch:0}) ;
				});
			}
		};
		$(window).bind('beforeunload', function(){
			messageQuit = "Script has changed since the last time you saved." ;
			if(! $isCodeSaved())
				return messageQuit ;
            return;
		});
		
	});