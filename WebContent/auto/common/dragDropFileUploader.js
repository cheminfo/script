var CI=CI || {};

CI.script=CI.script || {};
CI.script.dragDropFileUploader=function(dropboxID, statusID, uploadURL, options) {
	var options=options?options:{};
	var dropbox=$("#"+dropboxID);
	try {
		if (navigator.userAgent.match(/iPhone|iPad|iPod/) || ! Event.DRAGDROP || ! FileReader) {
			dropbox.hide();
			return;
		}
	} catch (e) {
		dropbox.hide();
		return;
	}
	
	var status=$("#"+statusID);
	dropbox.on("dragenter", function(event) {
		$(event.target).toggleClass("CI-fileUploader-dropboxHover ");
        event.stopPropagation();
        event.preventDefault();
	});
	dropbox.on("dragover", function(event) {
        event.stopPropagation();
        event.preventDefault();
	});
	dropbox.on("dragleave dragexit", function(event) {
		$(event.target).toggleClass("CI-fileUploader-dropboxHover ");
        event.stopPropagation();
        event.preventDefault();
	});
	dropbox.on("drop", function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (options.start) {
			options.start();
		}
		$(event.target).toggleClass("CI-fileUploader-dropboxHover ");
        var files = event.originalEvent.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            upload(files[i]);
        }
		
	});
	
	function showStatus(text) {
		if (status) {
			status.html(text);
		}
	}
	
    function upload(file) {
        showStatus("Uploading: "+file.name);

        var formData = new FormData();
        formData.append("content", file);

        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
		xhr.open("POST", uploadURL , true); // If async=false, then you'll miss progress bar support.
        xhr.send(formData);
    }
    
    function uploadProgress(event) {
        // Note: doesn't work with async=false.
        var progress = Math.round(event.loaded / event.total * 100);
        showStatus("Progress " + progress + "%");
    }

    function uploadComplete(event) {
    	var result=JSON.parse(event.target.responseText);
        showStatus(result.status);
        if (options.done) options.done(result);
    }
	
}
