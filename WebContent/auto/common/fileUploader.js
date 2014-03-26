var CI=CI || {};

CI.script=CI.script || {};
CI.script.fileUploader=function(fileselectID, statusID, uploadURL, options) {
	var options=options?options:{};
	console.log(options);
	var fileselect=$("#"+fileselectID);
	var status=$("#"+statusID);

	fileselect.on("change", function(event) {
		event.stopPropagation();
		event.preventDefault();
		if (options.start) {
			options.start();
		}
        var files = event.originalEvent.srcElement.files;
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
		xhr.open("POST", uploadURL+"&timestam"+((new Date).getTime()) , true); // If async=false, then you'll miss progress bar support.
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
