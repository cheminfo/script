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
		};
	};
