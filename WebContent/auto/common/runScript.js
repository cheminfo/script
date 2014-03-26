var CI=CI || {};
CI.script=CI.script || {};
CI.script.run=function(runScriptURL, script, callback) {
	$.ajax({
		url: runScriptURL,
		data: {
			script: script,
			forceNew: true,
			getResult: true,
			dataType: "json"
		},
		success: function(data) {
			if (callback) {
				callback(data);
			}
		}
	});
};