
var windowHref="/servletScript/java/hook3/view.html";

/*if (document.location.href.indexOf("/drugExplorer/")>0) {
	windowHref="/servletScript/drugExplorer"+windowHref;
}*/


var nemoWindow;

function stopPropagation(evt) {
    if (window.event)
        window.event.cancelBubble = true;
    else
        evt.cancelBubble = true;
}

/**
 * options: 
 * windowName: defaut=comparator
 * spectrumURL
 * bgColor: default white
 * action: a function, default none
 * width: default 800
 * height default 600
 * spectrumType: default: empty
 * spectrumID: default: empty
 * title: default empty
 * molfileURL: default empty
 * windowURL: default: /lims/java/hook3/view.html
 * sessionid: default:empty
 */

function openNemoWindow(options) {
	console.log(windowHref);
	//var options=optionsArray[0];
	nemoWindow=new NemoWindow(options);
	var windowName="comparator";
	
	if (options && options.windowName) {
		windowName=options.windowName;
	}
		
	// we need to find if there is already a window with this name or not
	windowObject=window.open('', windowName,  'location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,width='+nemoWindow.width+',height='+nemoWindow.height); 
	if (windowObject.nemo) {
		// the applet already exists
		windowObject.document.close();
		windowObject.focus();
		// we need to retrieve nemoWindow from the existing window
		nemoWindow=windowObject.nemoWindow;
		
		if (options && options.spectrumURL) {
			nemoWindow.spectrumURL=options.spectrumURL;
		} else {
			nemoWindow.spectrumURL="";
		}
		if (options && options.spectrumColor) {
			nemoWindow.spectrumColor=options.spectrumColor;
		} else {
			nemoWindow.spectrumColor="";
		}
		if (options && options.spectrumURLs) {
			nemoWindow.spectrumURLs=options.spectrumURLs;
		} else {
			nemoWindow.spectrumURLs=[];
		}
		if (options && options.spectrumColors) {
			nemoWindow.spectrumColors=options.spectrumColors;
		} else {
			nemoWindow.spectrumColors=[];
		}
		if (options && options.action) {
			nemoWindow.action=options.action.replace(/&quote;/g,"\"");
		} else {
			nemoWindow.action={};
		}
		nemoWindow.onupdate(windowObject.nemo);
	} else {
		windowObject.document.close();
		windowObject.focus();
		// if the applet does not exists we call the window with the applet url
		windowObject.location.href=nemoWindow.href;
		windowManager.add(windowObject);
	}
}

function NemoWindow(options) {
	this.backgroundColor="white";
	this.spectrumURL="";
	this.spectrumColor="";
	this.spectrumURLs=[];
	this.spectrumColors=[];
	this.molfileURL="";
	this.title="Window title";
	this.height=600;
	this.width=800;
	this.action="";
	this.spectrumType="";
	this.spectrumID="";
	this.entryID="";
	this.displayOptions={};
	this.href=windowHref;
	this.mf="";
	
    if (document.cookie && document.cookie.indexOf("JSESSIONID")>-1) {
		this.sessionid=document.cookie.replace(/^.*JSESSIONID=([^&;]*).*$/,"$1");
    } else {
    	this.sessionid="";
    }

	if (options) {
		if (options.bgColor) this.backgroundColor=options.bgColor;
		if (options.spectrumURL) this.spectrumURL=options.spectrumURL;
		if (options.spectrumColor) this.spectrumColor=options.spectrumColor;
		if (options.spectrumURLs) this.spectrumURLs=options.spectrumURLs;
		if (options.spectrumColors) this.spectrumColors=options.spectrumColors;

		if (options.molfileURL) this.molfileURL=options.molfileURL;
		if (options.title) this.title=options.title;
		if (options.width) this.width=options.width;
		if (options.height) this.height=options.height;
		if (options.action) this.action=options.action;
		if (options.spectrumType) this.spectrumType=options.spectrumType;
		if (options.spectrumID) this.spectrumID=options.spectrumID;
		if (options.entryID) this.entryID=options.entryID;
		if (options.href) this.href=options.href;
		if (options.displayOptions) this.displayOptions=options.displayOptions;
		if (options.mf) this.mf=options.mf;
		if (options.sessionid) this.sessionid=options.sessionid;
	}
	
	// What should we do when we open a new window. Usually, just add the spectrum to the display but we could apply some default behaviour
	this.onload=function(nemo) {


		if (this.spectrumURL.length>0) {
			nemo.addJcamp(this.spectrumURL);
			nemo.setColor(this.spectrumColor);
		} else if (this.spectrumURLs.length>0) {
			for (var i=0; i<spectrumURLs.length; i++) {
				nemo.addJcamp(this.spectrumURLs[i]);
				nemo.setColor(this.spectrumColors[i]+"");
			}
		}
		if (this.action.length>0) {
			eval(this.action);
		}
	}
	
	// What should we do when we add a spectrum to an existing window. Usually, just add the spectrum
	this.onupdate=function(nemo) {
		this.onload(nemo);
	}
	
	this.addMoleculeFromURL=function(nemo) {
		new Ajax.Request(
			this.molfileURL, {
				onSuccess: function(resp) {
					nemo.setMolfile(resp.responseText);
				}
			}
		);
	}
}



function WindowsManager() {
	// members
	this.windows = new Array();
	
	// methods
	this.add = function(currentWindow) {
		this.windows[this.windows.length]=currentWindow;
		return this.windows.length-1;
	};
	
	this.get = function(index) {
		if ((index>=this.windows.length) || (index<0)) return null;
		return this.windows[index];
	};
	
	this.size = function() {
		return (this.windows.length);
	};
	
	this.toString = function() {
		var result = "";
		
		for( var i = 0; i < this.windows.length; i++ ) {
			result += i+": " + this.windows[ i ] + "\r\n";
		}
		return result;
	};

	this.indexOf = 	function(currentWindow) {
		var result = -1;
		for( var i = 0; i < this.windows.length; i++ ) {
			if ( this.windows[i] == currentWindow ) {
				return i;
			}
		}
		return result;
	};
	
	this.remove = function(currentWindow) {
		var elementIndex = this.indexOf(currentWindow);
		if (elementIndex != (-1)) {
			this.windows = this.windows.removeAt(elementIndex);
		}
		
		this.refreshWindows();	
	};
	
	this.refreshWindows=function() {
		for (var i=0; i<this.windows.length; i++) {
			if ( this.windows[i].updateLinks() ) {
				this.windows[i].updateLinks();
			}
		}	
	}
}

function removeAt(index) {
	var part1 = this.slice(0, index);
	var part2 = this.slice(index+1);
	return part1.concat(part2);
}
Array.prototype.removeAt = removeAt;

var windowManager=new WindowsManager();

