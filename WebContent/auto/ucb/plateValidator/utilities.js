function getTinyURL(targetURL) {
	$.get(url,
		{
			action: "GetTinyURL",
			url: targetURL
		},
		function(data) {
			$("#tinyurl").val(JSON.parse(data).url);
	});
}

function openJSON() {
	var tmpResult=JSON.parse($('#result').val());
	if (!tmpResult || !tmpResult._dataUrl) {
		window.open('/script/renders/jsonreport/index.html');
	} else {
		window.open('/script/renders/jsonreport/index.html?url='+tmpResult._dataUrl);
	}
}
