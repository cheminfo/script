/*****************************
	By Nathanaël KHODL
	nathanael.khodl@epfl.ch
/*****************************/

	$(function(){
	
		function noop(event) {
			event.stopPropagation();
			event.preventDefault();
		};
		
		function dropUpload(event) {
			noop(event);
			
			var node = $.ui.dynatree.getNode(event.target.parentElement);
			if(! node){
				//$alert("Upload it to a folder") ;
				return ;
			}else if(! node.data.isFolder){
				$alert("This not a folder") ;
				return ;
			}

			var files = event.originalEvent.dataTransfer.files;
			for (var i = 0; i < files.length; i++) {
				upload(files[i],node);
			}

		};
		
		function upload(file,node) {
		
			folder = node.getKeyPath() ;
						
			/*
			// Tried with jQuery
			jQuery.ajax(addresses().run,{
				type:'POST',
				enctype: 'multipart/form-data',
				data:{
					file:file,
					action:"Upload",
					path:folder,
				},
				success:function(t){
					$writeConsole("File <i>" + file.name + "</i> uploaded");
					uploadComplete(node);
				},
				error:function(t){
					$alert("Error during upload");
				}
			});

			*/

			var formData = new FormData();
			formData.append("file", file);
			formData.append("action","Upload");
			formData.append("path",folder); // GEt path
		
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", function(a){ uploadProgress(a,node); }, false);
			xhr.addEventListener("load", function(a) { uploadComplete(a,node) ; }, false);
			xhr.open("POST", addresses().run, true); // If async=false, then you'll miss progress bar support.
			xhr.send(formData);
	
		};
		
		function uploadProgress(event){
			/*var progress = Math.round(event.loaded / event.total * 100);
			if (statusDiv) statusDiv.innerHTML = "Progress " + progress + "%";*/
		}
		
		function uploadComplete(event,node){
			json = $.parseJSON(event.currentTarget.responseText)
			if(json.result && json.filename){
				
				$refreshNode(node);
				$textResult = "File <i>" + json.filename + "</i> uploaded to "+node.getKeyPath() ;
				$alertOrConsole($textResult)
				
			}else
				$writeConsole("Error during upload");
		}
			
		$("body").on("dragenter", function(event){ /*checkForDrop(event) ;*/ noop(event); });
		$("body").on("dragexit", function(event){ noop(event); });
		$("body").on("dragover", function(event){ noop(event); });
		$("body").on("drop", function(event){ dropUpload(event); });
		
	});