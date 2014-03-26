var jmolWindow;

function openJmolWindow(windowName, molurl, bgColor, action, width, height, title) {
	jmolWindow=new JmolWindow();

	if (width) jmolWindow.width=width;
	if (height) jmolWindow.height=height;
	if (windowName) jmolWindow.title=windowName;
	if (molurl) jmolWindow.molurl=molurl;
	if (action) jmolWindow.action=action.replace(/&quote;/g,"\"");
	
	// we need to find if there is already a window with this name or not
	windowObject=window.open('', jmolWindow.title,  'location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,width='+jmolWindow.width+',height='+jmolWindow.height); 

	if (windowObject.jmol) {
		windowObject.document.close();
		windowObject.focus();
		// we need to retrieve jmolWindow from the existing window
		jmolWindow=windowObject.jmolWindow;
		if (molurl) {
			jmolWindow.molurl=molurl;
		} else {
			jmolWindow.molurl="";
		}
		jmolWindow.onupdate(windowObject.nemo);
	} else {
		windowObject.document.close();
		windowObject.focus();
		// if the applet does not exists we call the window with the applet url
		windowObject.location.href="/lims/java/jmol11/view.html";
	}
}



function JmolWindow() {

	this.backgroundColor="white";
	this.molurl="";
	this.title="Window title";
	this.height=800;
	this.width=800;
	this.action="";
	this.href="/lims/java/jmol11/view.html";

	
	

	// What should we do when we open a new window. Usually, just add the spectrum to the display but we could apply some default behaviour
	this.onload=function(jmol) {
		if (this.molurl.length>0) {
			jmol.script("load \""+this.molurl+"\"");
		}
		
		if (this.action.length>0) {
			eval(this.action);
		}
	}
	
	// What should we do when we add a spectrum to an existing window. Usually, just add the spectrum
	this.onupdate=function(jmol) {
		if (this.molurl.length>0) {
			jmol.script("load \""+this.molurl+"\"");
		}
		if (this.action.length>0) {
			eval(this.action);
		}
	}
	

}

