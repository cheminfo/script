$(function(){
	var interactiveConsole = $("#interactive-console");
	var togglebtn = $('#btntoggleinteractiveconsole');
	var enabled = false;
	togglebtn.click(function(){
		if(!enabled) {
			interactiveConsole.show();
			togglebtn.addClass("active");
		}
		else {
			interactiveConsole.hide();
			togglebtn.removeClass("active");
		}
		enabled = !enabled;
	});
});