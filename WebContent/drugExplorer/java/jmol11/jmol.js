
function Jmol(appletID) {
	this.applet=appletID;

	this.title="";
	this.url="";


	this.script=function(script) {
		this.applet.script(script);
	}
	
	this.load=function() {
		if (this.url.length>10) {
			this.addJcamp(this.url);
						
		}
		if (this.molURL.length>10) {
			this.setMolfileFromURL(this.molURL);
		}
		this.addParameters();
	}

	this.setTitle=function(title) {
		this.title=title;
	}

	this.setColor=function(color) {
		this.applet.setColor(color);
	}
	
	
	
};
