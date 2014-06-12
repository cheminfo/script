
	var loadHistory = function(){};

	$(function(){
		
		var $linksMenu = $('#menu li');
		var $pagesTab = $('.tab-page');
		var classSelectedSource = "diff-selected-source" ;
		var classSelectedDest = "diff-selected-dest" ;
		var $blockVersions = $("#history-versions") ;
		var $blockDiff = $('#history-diff-content') ;
		var linkCurrentFile = $("#current-file-link") ;

		var sourceDiff,destinationDiff,objectCurrent ;
		
		function displayTabFromMenu(name){
			$pagesTab.hide();
			$linksMenu.removeClass("active");
			$('#menu-link-'+name).addClass("active");
			$('#tab-'+name).show();
			$adaptCMHeight();
		}
		
		loadHistory = function (){

			var arrayFiles = {} ;

			$blockVersions.html("Loading history...");
			linkCurrentFile.removeClass("active");

			sourceDiff = null ;
			destinationDiff = null ;
			objectCurrent = {
				lastModified: new Date().getTime(),
				name:"/1.Current file",
				content:$getCMContent(),
				isCurrent:true
			};

			linkCurrentFile.on("click",function(){
				destinationDiff = objectCurrent ;
				$(this).addClass("active");
				$('.'+classSelectedDest).removeClass(classSelectedDest);
				showDiff();
				return false ;
			}) ;

			commandServer(getDataDirCommand($currentProjectNode.getKeyPath() + "/" + addresses().historyPath),function(a){
				if(! a.error && a.result){
					$.each(a.result,function(a,file){
						if(/[0-9]\.[0-9a-z]+\.js/i.test(file.name)){
							var n = getNameFromHistoryFile(file.name);
							if(! arrayFiles[n]) arrayFiles[n] = [] ;
							arrayFiles[n].push(getFileBlock(file));
						}
					});
				}
				//TODO :sort by 1.is current file 2.Alphabetical
				displayHistoryDiv(arrayFiles);
			});

			showDiff();
		}

		function displayHistoryDiv(aF){

			var $blockResults = $('<div>').addClass("history-list");
			var $noHistory = $('<div>').html("No history available").addClass("no-history");

			if(! Object.keys(aF).length){
				$blockVersions.html($noHistory);
				return ;
			}

			var c = 0 ;
			$.each(aF,function(aName,blocks){
				c++ ;
				var $blockFile = $('<div>').addClass("history-block-files");

				var title = aName ;
				if(c == 1) title += " <small>(current file)</small>" ;

				$blockResults.append($("<h3>").html(title));
				$blockResults.append($blockFile);
				$.each(blocks,function(a,block){
					$blockFile.prepend(block);
				});
			});

			$blockVersions.html($blockResults);

			//$blockResults.prepend($li);
		}

		function getNameFromHistoryFile(n){
			return /[0-9]+\.(.*)/.exec(n)[1] ;
		}

		function getFileBlock(file){

			//var path = $currentProjectNode.getKeyPath() + "/" + addresses().historyPath + "/" + file.name ;

			var $diffDiv = $('<span>').append($('<span>').html("Diff:"));
			var linkSource = $('<a>',{'href':'#'}).html("file 'from'").on("click",function(){
				sourceDiff = file ;
				$('.'+classSelectedSource).removeClass(classSelectedSource);
				$(this).addClass(classSelectedSource);
				showDiff();
			});
			var linkDest = $('<a>',{'href':'#'}).html("file 'to'").on("click",function(){
				destinationDiff = file ;
				$('.'+classSelectedDest).removeClass(classSelectedDest);
				linkCurrentFile.removeClass("active");
				$(this).addClass(classSelectedDest);
				showDiff();
			});
			$diffDiv.append(" ").append(linkSource).append(" ").append(linkDest);

			var linkEdit = $('<a>',{'href':'#'}).html("Load").addClass("btn btn-small");

			linkEdit.on("click",function(){

				var path = getAdd(file) ;

				commandServer(getDataLoadFile(path),function(a,b){
					if(! a.error){

						var loadOldScriptToCM = function(){
								displayTabScripting();
								$setCMContent(a.result) ;
								var realName = file.name.split(".")[1] ;
								$("#script-name").val(realName) ;
								$writeConsole("Script <i>" +realName+ "</i> loaded from history.") ;
								$setCMChanged();
								//tryToLoadLastResult();

							};
						if($isCMSaved)
							loadOldScriptToCM();
						else
							$confirm("Current script was not saved. Erase it?",loadOldScriptToCM);
					}
				}) ;
			});

			var $li = $('<div>').addClass("history-file");

			$li.append(" ").append(linkEdit);
			$li.append(" ").append($('<span>').html(new Date(file.lastModified).toLocaleString()).addClass("history-date"));
			$li.append(" ").append($diffDiv);
			$li.append(" ("+bytesToSize(file.size)+") ") ;

			return $li ;
		}

		function showDiff(){

			$blockInfo = $('<ol>').addClass("history-infos");
			$blockDiff.html($blockInfo);

			var isOkay = true ;
			if(! sourceDiff){
				isOkay = false ;
				$blockInfo.append($('<li>').html("Choose a file 'from' for the difference"));
			}

			if(! destinationDiff){
				isOkay = false ;
				$blockInfo.append($('<li>').html("Choose a file 'to' for the difference"));
			}

			if(!isOkay) return;

			$blockInfo.append($('<li>').html("Loading..."));

			setCompSource(sourceDiff);
			if(! destinationDiff.isCurrent)
				setCompDestination(destinationDiff);

			/*
			commandServer(getDataLoadFile(getAdd(sourceDiff)),function(source){
			commandServer(getDataLoadFile(getAdd(destinationDiff)),function(dest){
				if(! source.error && ! dest.error){
					displayDiff(source.result,dest.result);
				}
			});
			});
			*/

		}

		function getAdd(file){
			return $currentProjectNode.getKeyPath() + "/" + addresses().historyPath + "/" + file.name ;
		}

		function setCompSource(t){
			sourceDiff = t ;
			commandServer(getDataLoadFile(getAdd(t)),function(a){
				sourceDiff.content = a.result ;
				displayDiff(sourceDiff,destinationDiff);
			});
		}

		function setCompDestination(t){
			destinationDiff = t ;
			commandServer(getDataLoadFile(getAdd(t)),function(a){
				destinationDiff.content = a.result ;
				displayDiff(sourceDiff,destinationDiff);
			});
		}

		function getCompTitle(s){
			//var t = $getFileName(s).split(".");
			return $('<span>')
				.append(
					//$('<b>').html(t[1])
					$('<b>').html(s.name.split(".")[1])
				).append(" ").append(
					//$('<small>').html("("+new Date(t[0]*1).toLocaleString()+")")
					$('<small>').html("("+new Date(s.lastModified).toLocaleString()+")")
				);
		}

		function displayDiffTitle(){
			var t = $("<span>").append("From ").append(getCompTitle(sourceDiff)).append(" to ").append(getCompTitle(destinationDiff))
			$blockDiff.prepend(t);
		}

		function displayDiff(f1,f2){
			var dmp = new diff_match_patch();
			if(f1.content && f2.content){

				dmp.diff_cleanupSemantic(d);
				$blockDiff.html(
					$('<pre>').html(
						dmp.diff_prettyHtml(
							dmp.diff_main((f1.content.replace(/\n/g,"\r")),(f2.content).replace(/\n/g,"\r"))
						)
					)
				);
				displayDiffTitle();
			}
		}


	function reLoadThreadTab() {
		document.getElementById("threadForm:refreshThreadButton").click();
	}

	function displayTabScripting() {
		displayTabFromMenu("scripting");
	}

	function displayTabHistory() {
		loadHistory();
		displayTabFromMenu("history");
	}

	function displayTabThread() {
		displayTabFromMenu("thread");
		reLoadThreadTab();
	}

	$('#menu-link-scripting').on("click", function() {
		displayTabScripting();
	});
	$('#menu-link-history').on("click", function() {
		displayTabHistory();
	});
	$('#menu-link-thread').on("click", function() {
		displayTabThread();
	});

	displayTabFromMenu("scripting");
	//THreadManagement MaybeMove or change name of the File
	$("#threadDIV").load("thread.xhtml");

});