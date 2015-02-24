/*****************************
	By Nathanael KHODL
	nathanael.khodl@epfl.ch
/*****************************/

	addresses = function() {

		var base = window.location.origin+"/" ;

		return {
			historyPath: ".history",
			base: base,
			help: base + "script/assets/help/plugins.json?_="+new Date().getTime(),
			run: base + "script/Run",
			jsonRender : base + "script/renders/jsonreport/index.html?url=",
			jsonColorRender : base + "script/renders/jsonColor.html?url=",
			visualizerReleases: "http://www.lactame.com/visualizer/list.php",
			getVisualizerParts: function(){ 
			//	var head = $visualizerRelease==="HEAD";
			//	var suffix = ((!head) ? ("&header=" + encodeURIComponent(base) + "headers/default.json"+"&config=" + encodeURIComponent(base) + "configs/default.json") : "&config="+encodeURIComponent(base+"configs/head.json"));
				
				var suffix="&config="+encodeURIComponent(base+"configs/head.json");
				
				return {
					suffix: suffix
				};
			}
		};
	};
