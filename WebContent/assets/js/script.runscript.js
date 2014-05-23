/*****************************
	By Nathanael KHODL
	nathanael.khodl@epfl.ch
/*****************************/

	var $logFatal = 100 ; // Log level 

	var $visualizerFullLink = null ;
	var $currentResults = null ;
	var $saveScript = function(){} ;
	var $setResultsFromFile = function(){} ;
	var $visualizerRelease = "current" ;
	var $regexScriptName = new RegExp("^[a-zA-Z0-9_-]+$",""); // UNDERSCORE ?

/* SCRIPT EDITION */

	var $scriptName = "" ;
	var $getScriptName = function(){
		return $.trim($('#script-name').val());
	};

	$(function(){
	
		$saveScript = function($onSuccess) {
			$scriptName = $getScriptName() ;
			
			if($regexScriptName.test($scriptName)){
				
				$fileName = "" + $currentProjectNode.getKeyPath() + "/" +  $scriptName + ".js" ;
				$fileContent = $getCMContent() ;
				
				// SAVE TO HISTORY
				if(! $isCodeSaved()){
    				var historyName = "" + $currentProjectNode.getKeyPath()
    									+ "/"+ addresses().historyPath
    									+ "/" + new Date().getTime() + "."
    									+  $scriptName + ".js" ;
    				
    				commandServer(getDataSaveFileCommand(historyName,$fileContent),function(){ });
				}
				
				commandServer(getDataSaveFileCommand($fileName,$fileContent),function(){
					$refreshNode($currentProjectNode) ;
					$setCMSaved() ;
					$writeConsole("Script <i>"+ $scriptName +"</i> saved") ;
					if($onSuccess)
						$onSuccess();

				});
			}else{
				$alert("Please only use alphanumerical symbols in the filename ") ;
			}
		};
	
		$('#save-script').click(function(){
			$saveScript() ;
			return false ;
		}) ;
	
		$('#clear-console').click(function(){
			$clearConsole() ;
		}) ;
		
	});


/* RUN SCRIPT */

	$(function(){
		
		var $versionSelector = $('<select>',{'data-style':"btn-primary"}).addClass('selectpicker') ;

		function generateVisualizerLink(openWhenOver){

			if(! $currentResults) return ;

			jsonResults = $currentResults ;
			$.get(addresses().run,
			{
				dataURL: jsonResults._dataFilename,
				viewURL: jsonResults._viewFilename,
				results: jsonResults._dataFilename.replace(/[^\/]*\/[^\/]*$/,""),
				views: jsonResults._viewFilename.replace(/[^\/]*\/[^\/]*$/,""),
				action: "GetKeys"
			},
			function(data) {
				if (data.result) {

					res = data.result ;
					branchName = $('#script-name').val() ; 
					views = encodeURIComponent(res.views.revisionWriteURL) ;
					results = encodeURIComponent(res.results.revisionWriteURL) ;

					viewBranch = "Master" ;
					resultBranch = branchName ;


					var endLink = "?views="+views+"&results="+results+"&viewBranch="+viewBranch+"&resultBranch="+resultBranch;
					window.partialURL = endLink;

					var parts = addresses().getVisualizerParts();

					$visualizerFullLink = parts.prefix+endLink+parts.suffix;

					if(openWhenOver){
						openVisualizer();
					}
					
				}
			});
		}

		function openVisualizer(){
			window.open($visualizerFullLink,"The view","toolbar=0,scrollbars=1,location=0,resizable=1,width="+window.outerWidth+",height="+window.outerHeight);
			$writeConsole("Visualizer opened") ;
		}

		function setCurrentResult(data){
			$currentResults = data ;
			$('#script-results').html(JSON.stringify($currentResults)) ;
			$('.results-btn').removeClass("disabled");
		}

		$setResultsFromFile = function(data){
			
						setCurrentResult(data);
						generateVisualizerLink();
						tim = path.replace(/.*\/(.+)\..+$/, "$1") ;
						tim = parseInt(tim) ;
	
						d = new Date(tim);
						formattedTime = " " + d.toLocaleString();

						$writeConsole("Old result loaded: <i>"+formattedTime+"</i>" + getJSONLinks(data));
		};

		$isRunning = false ;
		$runners = $('.runner') ;

		function startRun(){
			$isRunning = true ;
			$runners.addClass("disabled") ;
		}

		function endRun(){
			$isRunning = false ;
			$runners.removeClass("disabled") ;
		}

		/* Server-Sent Events */
		
		var SSEToken = "" ;
		(function(){

			chars = "0123456789abcdefghijklmnopqrstuvwxyz" ;
			tokenLength = 25 ;

			var randomNumberBetween = function (min, max) {
				return (Math.floor(Math.random()*(max-min))+min);
			};
			for(var i = 0 ; i < tokenLength ; i++)
				SSEToken += chars.charAt(randomNumberBetween(0,chars.length)) ;

		})();
		
		var SSEConnection = null;
		function startSSE(){
			if(!EventSource) return;
			SSEConnection = new EventSource(addresses().run+"?action=SSE&SSEToken="+SSEToken);
			SSEConnection.addEventListener('logEvent', logSSE);
			SSEConnection.addEventListener('clearEvent', $clearConsole);
		}

		function stopSSE(){
			setTimeout(SSEConnection.close(),2000);
			SSEConnection = null ;
		}
		
		var showAllLogs=true;
		function logSSE(e){
			var json = JSON.parse("" + e.data);
			if(!showAllLogs && (json.SSEToken!=SSEToken))
				return;
			if(json.description && json.label)
				showLog(json);
		}
		
		startSSE();

		/* RUNNING */
		
		function runScript(options) {
			// Check if already running (disabled button)
			if($isRunning)
				return false ;
			
			$scriptName = $getScriptName() ;
			if(! $regexScriptName.test($scriptName)){
				$alert("Invalid file name.");
				return ;
			}

			$writeConsole("Running script...") ;
			startRun() ;
			$.ajax({
				type:'post',
				url: addresses().run,
				context: options,
				data: {
					script:($getCMContent()),
					currentDir:$currentProjectNode.getKeyPath(),
					resultBranch: $('#script-name').val(),
					SSEToken: SSEToken,
					/*
					OLD SCRIPT :
					initScript: $('#initScript').val(),
					forceNew: forceNew,
					getResult: getResult,
					description: $('#description').val(),
					*/
					dataType: "json"
				},
				beforeSend : function (){
					
				},
				complete:function(){
					endRun();
					document.getElementById("threadForm:refreshThreadButton").click();
				},
				error : function(t){
					$alert("error");
					$writeConsole("Error: <b>server side</b>");
				},
				success: function(data) {
					
					if(data.error){
						$writeConsole("Error: <b>"+data.error+"</b>");
						$alert(data.error);
						return;
					}
					else if(! data._logs){
						$alert("<b>Logs not found</b>");
						return;
					}
					
					$logs = data._logs ;

					if(! SSEConnection)
						showLogs($logs);
					
					if(isFatalInLogs($logs)){
						$writeConsole("<b>Fatal error found</b>");
						//showLog($logs[$logs.length-1]);
						return ;
					}
					/*
					// OLD SCRIPT
					if(data.error){
						$writeConsole("Error: <b>" + data.error + "</b>");
						return ;
					}

					// Error when execute
					if(data._error){
						for (var error in data._error){
							textError = data._error[error] ;
							$writeConsole("Error "+ error +": <b>" + textError + "</b>");
							$parseCMError(textError) ;
						}
						return ;
					}
					*/

					$writeConsole('Script result: <i>SUCCESS!</i>'+ getJSONLinks(data)) ;
					
					setCurrentResult(data);
					generateVisualizerLink(this.visualize);
				}
			});
		}

		function getJSONLinks(data){
			t = ' <a href="'+ addresses().jsonRender + encodeURIComponent(data._dataUrl) +'" target="_blank">[view result]</a>'+
			' <a href="'+ addresses().jsonColorRender + encodeURIComponent(data._dataUrl) +'" target="_blank">[color result]</a>' ;
			return t ;
		}

		function isFatalInLogs(logs){

			$isFatal = false ;
			$.each(logs,function(i,v){
				if(v.level == $logFatal){
					$isFatal = true ;
					return ;
				}
			});
			return $isFatal ;
		}

		function showLogs(logs){
			$.each(logs,function(i,v){
				//$parseCMError(v) ;
				showLog(v);
			});
		}

		function showLog(log){

			$content = log.description ;

			patt = new RegExp("at (line number ([0-9]+))$");
			cap = 1 ;
			res = patt.exec($content);
			if(res){
				line = res[2] ;
				$link = $('<a>').attr("href","#").append(res[cap]).on("click",null,{line:line},function(a,b){
					line = a.data.line ;
					$cm.setSelection({line:line-1,ch:0},{line:line,ch:0}) ;
				});
				//$text.append(" ").append($number);
				$content = $('<span>').append($content.replace(res[cap],"")).append($link);
			}

			$text = $('<span>').addClass("log-" + log.label).append($content);
			$writeConsole($text);
		}

		function isReadyToDisplay(){
			if($currentResults)
				return true ;
			$alert("Please run script first.") ;
			return false ;
		}

		function displayVisualizer(){
			if(isReadyToDisplay()){
				openVisualizer();
			}
		}

		var $modalTinyLink = $( "#modal-tinylink" ).dialog({autoOpen: false});

		function shareResult(){

			if(! isReadyToDisplay()) return ;

			$subject = "Link to the visualizer ("+ $currentProjectNode.data.title +")" ;

			$target = $visualizerFullLink ;

			$inputTinyLink = $('#link-share') ;
			
			$.getJSON(addresses().run,{action: "GetTinyURL", url:$target},
				function(data) {

					$inputTinyLink.val(data.url);
					$inputTinyLink.width(500);
					$inputTinyLink.click(function(){
					    // Select input field contents
					    this.select();
					});

					$link = 'mailto:?subject='+$subject+'&body=' + $inputTinyLink.val() ;
					$('#link-share-btn').attr('href',$link) ;
					
					$modalTinyLink.dialog( "open" ) ;
					$modalTinyLink.dialog( "option", "width", 560 );

				});


		}
		
		$('#btn-run-script').click(function(){ runScript({'visualize':false}); }) ;
		$('#btn-run-script-visualize').click(function(){ runScript({'visualize':true}); }) ;
		$('#results-btn-visualize').click(function(){ displayVisualizer(); }) ;
		$('#results-btn-share').click(function(){ shareResult(); }) ;
		$('#results-btn-console').click(function(){
            showAllLogs= !showAllLogs;
            $(this).toggleClass("active",showAllLogs) ;
        }) ;

		$getVisualierVersion = function(){
			return $versionSelector.val() ;
		};

		function initScriptVersion(){
			
			var div = $('#visualizer-version') ;
			

			div.html($versionSelector);
		
			//div.html("Version").on("click",function(){initScriptVersion();}) ;

			$.ajax({
				url: addresses().visualizerReleases,
				data: {},
				
				success: function(d){

					var allVisualizerVersions=eval("("+d+")").files;


					allVisualizerVersions.push({name: "HEAD", url:"http://www.cheminfo.org/visualizer/head/index.html", date:"HEAD"});

					allVisualizerVersions.sort(function(a,b) {
						if (a.name<b.name) return 1;
						if (a.name>b.name) return -1;
						return 0;
					});

					cookie = localStorage.getItem('visualizer-release');

					$.each(allVisualizerVersions,function(a,b){
                        title = "Release " + b.date ;
                        newdate = b.date.replace(/-/g,"") ;
                        if(b.name != newdate){
                            title += " (" + b.name + ")" ;
                        }

                        param = {value: b.name} ;
                        if(cookie && cookie == param.value){
                            param.selected = "selected" ;
                        }

						$versionSelector.append($('<option>',param).html(title));
					});


                    $visualizerRelease = $versionSelector.val() ;

					$versionSelector.change(function(){
						$visualizerRelease = $(this).val() ;
                        localStorage.setItem('visualizer-release', $visualizerRelease);
						generateVisualizerLink();
					});
				}
			});
		}

		initScriptVersion() ;

	}) ;
