/*****************************
	By Nathanael KHODL
	nathanael.khodl@epfl.ch
/*****************************/

	var $displayNodeInformations = function(node) {} ;
	var $extensionsImages = ['jpg','jpeg','gif','png'] ;
	var $extensionsEditor = {
		txt: {editorType:null},
		csv: {editorType:null},
		json: {editorType:'javascript'},
		jdx: {editorType:null},
		dx: {editorType:null},
		mol: {editorType:null},
		sdf: {editorType:null},
		xml: {editorType:'xml'},
		js: {editorType:'javascript'},
	} ;

	function bytesToSize(bytes, precision) {  
		var kilobyte = 1024;
		var megabyte = kilobyte * 1024;
		var gigabyte = megabyte * 1024;
		var terabyte = gigabyte * 1024;

		if ((bytes >= 0) && (bytes < kilobyte))
			return bytes + ' B';

		if ((bytes >= kilobyte) && (bytes < megabyte)) 
			return (bytes / kilobyte).toFixed(precision) + ' KB';

		if ((bytes >= megabyte) && (bytes < gigabyte))
			return (bytes / megabyte).toFixed(precision) + ' MB';

		if ((bytes >= gigabyte) && (bytes < terabyte))
			return (bytes / gigabyte).toFixed(precision) + ' GB';

		if (bytes >= terabyte)
			return (bytes / terabyte).toFixed(precision) + ' TB';

		
		return bytes + ' B';
	}

	$(function(){

		$displayNodeInformations = function(node){

			$text = $('<div>').addClass("file-informations") ;
			d = node.data ;

	        if(d.isFolder)
	        	addInfoFolder(node,$text);
	        else
	        	addInfoFile(node,$text);

	        addInfoGlobal(node,$text);

			alertDialog = $('<div>').html($text);
	        alertDialog.dialog({
	            modal: true,
	            title: d.title,
	            minWidth: 450,
	        });

	    }

		function getInfoWithLabel(cssClass,name,value){
			return $('<div>').addClass("file-informations-" + cssClass)
				.append($('<b>').html(""+name+":"))
				.append(" ")
				.append(value) ; 
		}
		
		function getInfoInputValue(v){
			return $('<input>').val(v).addClass("file-informations-input").on("click",function(){
				$(this).select();
			}) ;
		}

		function addInfoGlobal(node,div){
			div.append(getInfoWithLabel('path',"Path",getInfoInputValue(node.getKeyPath())));
		}

		function addInfoFolder(node,div){
			div.append(getInfoWithLabel('login',"Login URL",getInfoInputValue(node.data.loginURL)));
		}

		function addInfoFile(node,div){
						
			addInfoImage(node,div);
			addInfoEditor(node,div);

			div.append(getInfoWithLabel('size',"Size",bytesToSize(d.size,2)));
			
			dateEdit = new Date(d.lastModified);

			div.append(getInfoWithLabel('lastmodification',"Last modification", dateEdit.toLocaleString()));
			div.append(getInfoWithLabel('readurl',"Read URL",getInfoInputValue(d.readURL)));
			div.append(getInfoWithLabel('writeurl',"Write URL",getInfoInputValue(d.writeURL)));
			div.append(getInfoWithLabel('webservice',"Use as webservice",getInfoWebService(node)));
		}

		function addInfoImage(node,div){
			d = node.data ;
			ext = d.key.replace(/.*\.(.+)$/, "$1").toLowerCase() ;
			if($.inArray(ext,$extensionsImages) > -1)
                if(d.size < 1500000)
				    div.append($('<img>',{src:node.data.readURL}).addClass("file-informations-image")) ;
		}

		function getInfoWebService(node){
			var $wsEditor = $('<div>').html("tes");
			var urlEdition = $('<span>').html("Generate webservice URL").addClass("btn center").on("click",function(){
				$wsEditor.html("Loading webservice URL...");
				commandServer(getDataServiceURL(node.getKeyPath()),function(d){
					if(d.error){
						$wsEditor.html(d.error);
						return;
					}
					$wsEditor.html(getInfoInputValue(d.url));
				});
			});
			$wsEditor.html(urlEdition);

			return($wsEditor);
		}

		function addInfoEditor(node,div){
			ext = d.key.replace(/.*\.(.+)$/, "$1").toLowerCase() ;
			if($extensionsEditor[ext] && (node.data.size < 10000)){

				param = $extensionsEditor[ext] ;
				options = {
					mode: "text",
					lineNumbers: true,
					matchBrackets: true,
					tabMode: "indent",
					autofocus: false,
					//extraKeys: {"Ctrl-Space": "autocomplete"},
				};
				if(param.editorType){
					options.mode = param.editorType ;
				}
					

				$textareaInfoBlock = $('<div>') ;
				$textareaInfo = $('<textarea>').html("// Loading") ;
				$textareaInfoBlock.html($textareaInfo) ;
				div.append($textareaInfoBlock) ;
				var $cmInfo = CodeMirror.fromTextArea($textareaInfo[0],options);

				$buttonInfoSave = $('<span>').addClass("btn").html("Save file") ;
				$buttonInfoSave.on("click",function(){
					commandServer(getDataSaveFileCommand(node.getKeyPath(),$cmInfo.getValue()),function(a){
						$alert("Content saved");
					});
				});
				$textareaInfoBlock.append($buttonInfoSave) ;
				$textareaInfoBlock.append($('<hr>')) ;

				commandServer(getDataLoadFile(node.getKeyPath()),function(a){
					$cmInfo.setValue(a.result) ;
				}) ;
			}

		}
		
	});