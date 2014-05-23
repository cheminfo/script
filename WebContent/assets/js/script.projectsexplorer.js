/*****************************
	By Nathanael KHODL
	nathanael.khodl@epfl.ch
/*****************************/
// Base URL
	var $defaultFileName = "Master" ;
	var $tree = null ;
	var $dt = null ;
	var $currentProjectNode = null ;
	var $refreshNode = function() {} ;
	var $refreshParent = function() {} ;
	var $loadJSFile = function() {} ;
	var $getFileName = function(){};
/*
GLOBAL FUNCTIONS
*/
	
	// Execute command
	function commandServer($data,$onSuccess){
		$.ajax({
			method:'post',
			dataType:'json',
			url: addresses().run,
			data:$data,
			success:$onSuccess
		});
	}
	function $alert(text){
		var alertDialog = $('<div>').append(text);
	        alertDialog.dialog({
	            modal: true,
	            title: "Alert",
	            buttons: [
	                {text: "OK", click: function() {$(this).dialog("close");}}
	            ]
	        });
	}
	function $confirm(text,success,fail){
		var alertDialog = $('<div>').append(text);
	        alertDialog.dialog({
	            modal: true,
	            title: "Please confirm",
	            buttons: [
	                {text: "Yes", click: function() {if(success)success();$(this).dialog("close");}},
	                {text: "No", click: function() {if(fail)fail();$(this).dialog("close");}}
	            ]
	        });
	}

	// generate actio command
	function getDataActionCommand(action,command,values){
		return $.extend(values,{
				"action":action,
				"event":command,
				"__timestamp": new Date().getTime()}
		);
	}

	// Generate command
	function getDataCommand(command,values){
		return getDataActionCommand("FileManager",command,values);
	}
	
	// Get dir content
	function getDataDirCommand(dirName){ return getDataCommand('dir',{'name':dirName}) ; }
	// Create a folder
	function getDataCreateFolderCommand(dirName){ return getDataCommand('createFolder',{'name':dirName}) ; }
	// Delete a folder
	function getDataDeleteFolderCommand(dirName){ return getDataCommand('deleteFolder',{'name':dirName}) ; }
	// Delete a file
	function getDataDeleteFileCommand(fileName){ return getDataCommand('delete',{'name':fileName}) ; }
	// Save into a file
	function getDataSaveFileCommand(fileName,fileContent){ return getDataCommand('save',{'name':fileName,'content':fileContent}) ; }
	// Rename file
	function getDataRenameFileCommand(fileName,newFileName){ return getDataCommand('rename',{'name':fileName,'newName':newFileName}) ; }
	// Get file content
	function getDataLoadFile(fileName){ return getDataCommand('load',{'name':fileName}) ; }
	// Get file content
	function getDataServiceURL(fileName){ return getDataActionCommand('GetServiceURL',null,{'scriptFilename':fileName}) ; }

/* 
ADD SIDEBAR 
*/
	
	$(function(){
	
		$peSidebar = $('#projects-explorer') ;
		$console = $('#console') ;
		var projectsExplorerWidth = localStorage.getItem('projects-explorer-width');
		if(projectsExplorerWidth) $peSidebar.width(projectsExplorerWidth);
		$peSidebar.resizable({handles: "e", maxWidth: $(window).width()/3}).resize(function(){localStorage.setItem('projects-explorer-width', $peSidebar.width());});
		// Hide file explorer ?
		//$peSidebar.hide();
		resizeBodyFromSidebar = function(){
			w = $peSidebar.outerWidth();
			//of = 'hidden';
			if($peSidebar.css('display') == 'none'){
				w = 0 ;
			}
			$('.page-content').css('margin-left',w) ;
			$adaptCMHeight();
		} ;
		
		// Toggle file explorer
		$('.projects-explorer-toggler').click(function(){
			$peSidebar.toggle('slide',200,resizeBodyFromSidebar) ;
			return false ;
		});
		// Show file explorer
		$('.projects-explorer-show').click(function(){
			$peSidebar.show(0,resizeBodyFromSidebar) ;
			return false ;
		});
		// Responsive sidebar
		$(window).resize(function() {
			resizeBodyFromSidebar() ;
		});
		resizeBodyFromSidebar(); // Init (when expanded by default)
		
	}) ;
	
/* RIGHT CLICK */
	var $bindContextMenu = function(){} ;
	$(function(){	
		$bindContextMenu = function(span) {
			var node = $.ui.dynatree.getNode(span);
			$items = {
		        	"informations": {name: "Informations"},
		        	//"getpath": {name: "Get path"},
					"sep1" : "-",
		        	"newfolder": {name: '<i class="icon-folder-close-alt"></i> Create folder'},
		        	"refresh": {name: '<i class="icon-refresh"></i> Refresh content'},
		        	"download": {name: '<i class="icon-download"></i> Download file'},
		        	"rename": {name: '<i class="icon-edit"></i> Rename'},
		        	"delete": {name: '<i class="icon-trash"></i> Delete'},
					"sep1" : "-"
		        } ;
		    $.contextMenu({
		        selector: ".dynatree-node", 
		        callback: function(key, options) {
		        	
		        	node = $.ui.dynatree.getNode(options.$trigger);
		            switch( key ) {
					  case "delete":
					  	$action = $deleteNode ;
					  break;
					  case "rename":
					  	$action = $renameNode ;
					  break;
					  case "newfolder":
					  	$action = $newFolder ;
					  break;
					  case "getpath":
					  	$action = $getPath ;
					  break;
					  case "informations" :
					  	$action = $displayNodeInformations ;
					  break;
					  case "refresh":
					  	$action = $refreshFolder ;
					  break;
					  case "download":
					  	$action = $downloadFile;
					  break;
					  default:
						$action = function(){ $alert("Todo: apply action '" + key + "' to node " + node.getKeyPath()); };
					}
					$action(node) ;
		        },
		        items: $items
		    });
		};
		$contextMenuRoot = function(){
			$items = {
	        	"newfolder": {name: '<i class="icon-folder-close-alt"></i> Create folder in root'}
	        } ;
		    $.contextMenu({
		        selector: ".dynatree-container", 
		        callback: function(key, options) {
		        	node = $.ui.dynatree.getNode(options.$trigger);
		            switch( key ) {
					  case "newfolder":
					  	$newFolderPopup("/",function(){
					  		$refreshTree();
					  	});
					  break;
					  default:
						return ;
					}
		        },
		        items: $items
		    });
		};
		$contextMenuRoot();
		$deleteNode = function(node){
			if (node.data.isFolder)
				data =  getDataDeleteFolderCommand(node.getKeyPath()) ;
			else
				data = getDataDeleteFileCommand(node.getKeyPath()) ;
			$confirm("Delete "+ node.getKeyPath() +"?",function(){
				commandServer(data,function(){
					$writeConsole("" + node.getKeyPath() + " <i>removed</i>");
					node.remove() ;
				});
			});
		};
		$renameNode = function(node){
			$inputNewName = $("<input>",{type:"text"}).val(node.data.key);
			var NewDialog = $('<div>').append($inputNewName);
	        NewDialog.dialog({
	            modal: true,
	            title: "Rename "+ node.data.key,
	            buttons: [
	                {text: "Submit", click: function() {
	                	$newName = $inputNewName.val() ;
	                	reg = new RegExp("^[a-zA-Z0-9_\.-]+$","g"); // UNDERSCORE ?
	                	if(reg.test($newName)){
	                		
	                		$newPath = node.getParent().getKeyPath() +"/"+ $newName ;
	                		
				            commandServer(getDataRenameFileCommand(node.getKeyPath(),$newPath),function(){
	                			$writeConsole("<i>" + node.data.title + "</i> renamed to <i>" + $newName + "</i>");
	                			$parent = node.getParent() ;
	                			$refreshParent(node);
	                							
							});
							$(this).dialog("close");
	                		
	                	}else
	                		$alert("The name can not contain special characters");
	                }},
	                {text: "Cancel", click: function() {$(this).dialog("close");}}
	            ]
	        });
        } ;
        $newFolderPopup = function($path,$onSuccess){
        	$inputPathName = $("<input>",{type:"text"});
        	var NewDialog = $('<div>').append($inputPathName);
	        NewDialog.dialog({
	            modal: true,
	            title: "Create folder in "+ $path,
	            buttons: [
	                {text: "Create", click: function() {
	                	$newName = $inputPathName.val() ;
	                	reg = new RegExp("^[a-zA-Z0-9_-]+$","g"); // UNDERSCORE ?
	                	if(reg.test($newName)){
	                		
	                		$newPath = $path +"/"+ $newName ;
	                		
				            commandServer(getDataCreateFolderCommand($newPath),function(){
	                			$onSuccess();
							});
							$(this).dialog("close");
	                		
	                	}else
	                		$alert("The name can not contain special characters");
	                }},
	                {text: "Cancel", click: function() {$(this).dialog("close");}}
	            ]
	        });
        };
        $newFolder = function(node){
        	if(node.data.isFolder)
        		$p = node ;
        	else
        		$p = node.getParent();
        	$path = $p.getKeyPath();
        	$newFolderPopup($path,function(){
        		$writeConsole("Folder <i>"+$newPath+"</i> created");
	            $refreshNode($p);	
        	});
        };
        $getPath = function(node){
        	$i = $('<input>',{'type':'text'}).val(node.getKeyPath());
        	$i.click(function(){
        		$i.select();
        	});
        	
        	$alert($i) ;
        };
        $refreshFolder = function(node){
        	$refreshNode(node);
        };
        
        $downloadFile = function(node) {
        	if(!node.data.isFolder)
        		window.open(node.data.readURL.replace("Load","Download"));
        };
  
	}) ;
/* 
ADD DYNATREE
*/
	
	
	$(function(){
		
		// Login link
		//$('#login-link').attr('href','http://script.epfl.ch/script/Login/XXXXXXXX/YYYYYYYY?redirect=' + $(location).attr('href')) ;
	
		$dt = $('#dynatree-container') ;
		// Sort tree
		$sortTree = function(node){
			if(! node)
				node = $dt.dynatree("getRoot");
			if(true)
			//if(! node.isLoading())
				node.sortChildren(null,true);
			else
				console.log("Cannot sort while loading");	
		};
		// Init code editor
		function initCode() {
			$setCMContent("// Write some code here");
			$('#script-name').val($defaultFileName) ;
		}
		// Get file extension from name
		function getFileExtension(fileName){
			return fileName.replace(/.*\.(.+)$/, "$1").toLowerCase() ;
		}
		
		// Get file name from file name + extension
		function getFileName(fileName){
			return fileName.replace(/.*\/(.+)\..+$/, "$1") ;
		}

		$getFileName = function(f){
			return getFileName(f);
		}
		
		// Load JS file to the editor
		function loadJSFile(path){
			commandServer(getDataLoadFile(path),function(a,b){
				if(! a.error){
					$setCMContent(a.result) ;
					$("#script-name").val(getFileName(path)) ;
					loadHistory();
					actionName = "loaded" ;
					$writeConsole("Script <i>" +getFileName(path)+ "</i> "+actionName) ;
					tryToLoadLastResult();
				}
			}) ;
		}

		// From outside
		$loadJSFile = function(path) {
			loadJSFile(path);
		} ;
		
		// Parse folder
		function parseJsonForFolder(data) {
			finalData = [] ;
			if(! data.result){
				$alert("Error: " + data.error + "<br />Are you logged in?");
				return finalData ;
			}
			
			$.each(data.result,function(a,b){
				if(b.title.substring(0,1) != '.') // if not hidden
					if(true){
						b.key = b.title ;
						if(b.isFolder)
							icon = false ;
						else{
							switch(getFileExtension(b.title))
							{
								case 'js':
								  	icon = 'js' ;
								  	break;
								case'jpg':
								case'jpeg':
								case'bmp':
								case'png':
								case'gif':
								case'svg':
								case'tiff':
								case'raw':
								  	icon = 'img' ;
								  	break;
								case'txt':
								  	icon = 'txt' ;
								  	break;
								default:
									icon = false ;
							}
						}
						if(icon)
							b.icon = icon + ".png" ;
						finalData.push(b); // Save to the tree
					}
						
			});
			return finalData ;
		}
		
		// ADD DYNATREE
		$tree = $dt.dynatree({
		 
			title: "Project explorer",
			imagePath:"assets/img/icons/",
			//fx: { height: "toggle", duration: 200},
			autoFocus: false, // Set focus to first child, when expanding or lazy-loading.
			persist: false,
			
			// Init from root
			initAjax: {
				url: addresses().run,
				data: getDataDirCommand(''), // From the root
				postProcess:parseJsonForFolder
				//success:function(){$sortTree();}
				//addExpandedKeyList: true,
			},
			onCreate:function(node,span){
				//initCode();
				$bindContextMenu(span);
				//$sortTree(node);
			},
			// How to find the content of a folder
			onLazyRead: function(node){
				node.appendAjax({
					url:addresses().run,
					data: getDataDirCommand('./' + node.getKeyPath()),
					postProcess: parseJsonForFolder
					//success:function(){$sortTree(node);}
				});
			},
			onPostInit:function(){
				//$sortTree();
				this.reactivate();
			},
			// When a file/folder is selected
			onActivate: function(node) {
				if(node.data.isFolder)
					loadFolder(node) ;
				else
					loadFile(node) ;
				return false ;
			},
			// Drag and drop
			dnd: {
				autoExpandMS: 1000,
				preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
				
				onDragStart: function(node) {
					return true;
				},
				
				onDragEnter: function(node, sourceNode) {
					return node.data.isFolder ;
				},
				
				onDragOver: function(node, sourceNode) {
					if(node.isDescendantOf(sourceNode))
						return false;
					return true ;
				},
				
				onDrop: function(node, sourceNode, hitMode, ui, draggable) {
					
					// If not inside a folder, move it to the destinations's parent's folder
					if(hitMode != 'over')
						$destination = node.getParent().getKeyPath() ;
					else
						$destination = node.getKeyPath() ;
					// Keep current file/folder name
					$destination += "/" + sourceNode.data.key ;
					
					// Source = keyPath of the source
					$source = sourceNode.getKeyPath() ;
					// Get command data and execute it
					$dataMove = getDataRenameFileCommand($source,$destination) ;
					commandServer($dataMove,function(){
						sourceNode.move(node, hitMode); // callback : move without reloading
					});
					
				}
			}
		});
		$refreshNode = function(node) {
			if(node.getKeyPath() == "/"){
				$refreshTree();
			}else{
				if(! node.isLoading()) {
					node.reloadChildren(function(){$sortTree(node);});
					node.expand(); // Expand it
				}
			}
		};
		$refreshTree = function(){
			$dt.dynatree("getTree").reload();
		};
		$refreshParent = function(node) {
			$refreshNode(node.getParent()) ;
		};
		// When a project is loaded
		function loadProject(node,fileToLoad){
			$loadPro = function(){
				if(node == null){
					$alert("Select a folder fist.") ;
					return false ;
				}
				node.expand();
				if($currentProjectNode != node) {
					
					initProject();
					$currentProjectNode = node ;
					$title = node.data.title ;
					$('#project-name').html($title);
					$('#no-project').hide();
					$('#project-container').show(0,function(){ $adaptCMHeight() ; }) ;
					$writeConsole("Project <i>"+ $title +"</i> loaded") ;
				}else{
					//console.log("Don't reload (same project)") ;
				}
				initResults();
				loadJSFile("" + node.getKeyPath() + "/" + fileToLoad) ;
			};
			if(! $isCodeSaved()){
				$confirm("Save current script first?",function(){
					$saveScript($loadPro); // If yes, save it and load the new one on success
				},function(){
					$loadPro() ; // If no, just load new one
				});
			}else
				$loadPro();
		}
		// When a folder is clicked
		function loadFolder(node){
			loadProject(node, $defaultFileName + ".js") ;
		}
		// When a file is clicked
		function loadFile(node){
			ext = getFileExtension(node.data.title);
			if(ext == "js"){
				if("/" + node.data.key == node.getKeyPath()){
					$alert("Error : The script must be in a folder.");
					return ;
				}
				loadProject(node.getParent(), node.data.key) ;				
			}else{
				//$alert("Cannot open *."+ext+" files.") ;
				$displayNodeInformations(node) ;
			}
				
		}
		function initResults(){
			$('.results-btn').addClass("disabled") ;
			$currentResults = null ;
		}
		// Init fields (when changing project)
		function initProject(){
			$clearConsole();
			$('#project-name').val($defaultFileName) ;
			initCode();
		}
		function getLastFilePath(folder,success){
			commandServer(getDataDirCommand(folder),function(a){
				lastR = false ;
				if(a.result){
					$.each(a.result,function(idR,file){
						if(file.lastModified){
							if(! lastR || lastR.lastModified < file.lastModified)
								lastR = file ;
						}
					});
				}
				if(lastR){
					//success();
					path = folder + "/" + lastR.name ;
					var data = {_dataFilename:path,_viewFilename:path.replace("/.results/","/.views/"),_dataUrl:lastR.readURL};
					
					success(data);
				}
					
				//success
			});
		}
		// Try to load last result
		function tryToLoadLastResult(){
			fileName = $("#script-name").val();
			path = $currentProjectNode.getKeyPath() + "/.results/" + fileName ;
			getLastFilePath(path,function(a){
				$setResultsFromFile(a);
			});
			//$r = getLastFileFromFolder();
		}
	}) ;
	
		
		
	
	 
		