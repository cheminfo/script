
function reopenVisualizer() {
	openVisualizer($("#currentPath").val()+".views",$("#currentPath").val()+".results");
}

function openVisualizer(views, results) {
	if (!views) views=result._viewFilename.replace(/[^\/]*\/[^\/]*$/,"");
	if (!results) results=result._dataFilename.replace(/[^\/]*\/[^\/]*$/,"");
	// Ajax query to get all the keys
	$.get(url,
		{
			results: results,
			views: views,
			action: "GetKeys"
		},
		function(data) {
			console.log(data);
			if (data.result) {
				var views=escape(data.result.views.revisionWriteURL);
				var results=escape(data.result.results.revisionWriteURL);
				var viewBranch="Master";
				var resultBranch=$("#resultBranch").val();
				var website=$('#visualizerList').val();
				var targetURL=website+
						"?views="+views+
						"&results="+results+
						"&viewBranch="+viewBranch+
						"&resultBranch="+resultBranch							;
				window.open(targetURL,"The view","toolbar=0,scrollbars=1,location=0,resizable=1,width="+window.outerWidth+",height="+window.outerHeight);
				getTinyURL(targetURL);
			}
	});
}

function addVisualizer() {
	$.get("http://www.cheminfo.org/visualizer/release/list.shtml", {},
		function(data) {
			var allVisualizerVersions=eval("("+data+")").files;
			$('#visualizerList').html("");
			for (var i=0; i<allVisualizerVersions.length; i++) {
				var option = document.createElement('option');
				option.value=allVisualizerVersions[i].url;
				option.appendChild(document.createTextNode(allVisualizerVersions[i].name));
				if (allVisualizerVersions[i].name=="20130412") {
					option.selected="selected";
				}
				$('#visualizerList').append(option);
			}
			var option = document.createElement('option');
			option.value="http://npellet.github.com/visualizer/index.html";
			option.appendChild(document.createTextNode("Head"));
			$('#visualizerList').append(option);
			
		}
	)
}

addVisualizer();
