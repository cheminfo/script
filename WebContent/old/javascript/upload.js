var FileUploader=function (dropboxID, statusID, uploadURL, getPathFunction, callback) {
	var statusDiv=document.getElementById(statusID);
	function noop(event) {
		event.stopPropagation();
		event.preventDefault();
	};
	
	function dropUpload(event) {
		noop(event);
		var files = event.dataTransfer.files;
		for (var i = 0; i < files.length; i++) {
			upload(files[i]);
		}
	};
	
	function upload(file) {
		if (statusDiv) statusDiv.innerHTML = "Uploading " + file.name;
		var formData = new FormData();
		formData.append("file", file);
		formData.append("action","Upload");
		formData.append("path",getPathFunction());
	
		var xhr = new XMLHttpRequest();
		xhr.upload.addEventListener("progress", uploadProgress, false);
		xhr.addEventListener("load", uploadComplete, false);
		xhr.open("POST", uploadURL, true); // If async=false, then you'll miss progress bar support.
		xhr.send(formData);
	};
	
	function uploadProgress(event) {
		// Note: doesn't work with async=false.
		var progress = Math.round(event.loaded / event.total * 100);
		if (statusDiv) statusDiv.innerHTML = "Progress " + progress + "%";
	};
	
	function uploadComplete(event) {
		if (callback) {
			callback(event.target.responseText);
		}
	};
	
	var dropbox = document.getElementById(dropboxID);
	dropbox.addEventListener("dragenter", noop, false);
	dropbox.addEventListener("dragexit", noop, false);
	dropbox.addEventListener("dragover", noop, false);
	dropbox.addEventListener("drop", dropUpload, false);	
};
