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
			visualizerReleases: base + "visualizer/release/list.shtml",
			getVisualizerParts: function(){
				var head = $visualizerRelease==="HEAD",
					visualizerVersionURL = "visualizer/release/"+ $visualizerRelease +(head ? "/src" : "")+"/index.html" ;
				var startLink = base + visualizerVersionURL;
				if(!head) head = ($visualizerRelease==='current'||$visualizerRelease.indexOf("2014")===0);
				var suffix = ((!head) ? ("&header=" + encodeURIComponent(base) + "headers/default.json"+"&config=" + encodeURIComponent(base) + "configs/default.json") : "&config="+encodeURIComponent(base+"configs/head.json"));
				return {
					prefix: startLink,
					suffix: suffix
				};
			}
		};
		
	};
