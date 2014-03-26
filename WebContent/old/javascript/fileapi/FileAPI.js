var FileAPI=function(baseDir) {
	this.load=function(filename, callback) {
		var url="/script/Run?action=FileManagerOld&event=load&name="+escape(baseDir)+escape(filename);
		$.get(url, function(result) {
				callback(result);
			}
		);
	};
	
	this.dir=function(callback, options) {
		var extension="";
		if (options && options.filter) extension+="&filter="+escape(options.filter);
		var url="/script/Run?action=FileManager&event=dir&name="+escape(baseDir)+extension;
		$.get(url, function(result) {
				callback(result);
			}
		);
	};
	
	this.createFolder=function(foldername, callback) {
		var url="/script/Run?action=FileManagerOld&event=createFolder&name="+escape(baseDir)+"/"+escape(foldername);
		$.get(url, function(result) {
				callback(result);
			}
		);	
	};
};

