/* 
 * Jquery Light-Weight File Browser
 * James Earlywine (james@esilogix.com) -- April 2012
 *  -- updates in real time for any particular folder click()'d on.
 */


/*
 * Namespace for FileBrowser
 */
var FileBrowser = {}

/*
 * FileBrowser Global Config variables
 * - These values are used if they are not defined in the DOM Element to which the Browser is bound
 * 
 * @param   string  className               GLOBAL VARIABLE, determines what HTML/DOM Elements will receive FileBrowser childNodes
 * @param   string  strRoot                 Folder name displayed for "root" folder
 * @param   string  baseURL                 URL to the server-side script that receives the AJAX requests
 * @param   string  target                  Variable used by the server-side script to determine root folder
 * @param   string  targetContainer         HTML DOM Element of container for displaying file contents
 * @param   string  folderTag               HTML Element to encapsulate a Folder on the page
 * @param   string  fileTag                 HTML Element to encapsulate a File on the page
 *  
 */
FileBrowser.Config = {
    // this is the only thing that must be configured
    className               : "FileBrowser",
    
    // global defaults (can be specified as attributes of DOM element to which FileBrowser is bound
    strRoot : "/root",
    baseURL : "../Run",
    target  : "data",
    targetContainer         : "fileContents",
    folderTag               : "ul",
    fileTag                 : "li",
    fileControlPanelHTML    : 'Current path: <input class="currentDir" readonly="readonly" id="currentDir" type="text" value="">\n\
    							<input class="fileName" id="fileName" type="text" value="">\n\
                                <button class="save">Save</button><br/>',
    clickFolder		     	: function(folderElement) {
    	jQuery("#currentDir").val(folderElement.fullname);
    	jQuery(".run").attr("disabled", "disabled");
    },
    clickScript     : function(fullFilename) {
    	jQuery(".run").removeAttr("disabled");
    	jQuery("#resultBranch").val(fullFilename.replace(/^.*\//,"").replace(/\.js$/,""));
    }
}

FileBrowser.initialize = function () {
    // bindx FileBrowser nodes to all HTML/DOM Elements with appropriate className 
    // (see FileBrowser.Config.className in FileBrowser.js to view/edit FileBrowser.Config.className)
    $('.' + FileBrowser.Config.className).each( function (index, domEle) {
        domEle.theFileBrowser = new FileBrowser.Browser(domEle);
    });
    FileBrowser.FileControlPanel.initializePanels();
    FileBrowser.ContextMenu.initialize();
}


/*
 * Constructor for the Browser object.  During initialization this object is bound as a 
 * childNode of an HTML DOM Element on the page
 * 
 * @param       object      domEle          reference to HTML DOM Element to which the Browser is bound.
 * @property    object      commNode        FileBrowser.Ajax object, for handling communications with server
 * @property    object      parentElement   reference to HTML DOM Element to which the Browser is bound
 * @property    string      initializingMessage     Message to display before Browser is populated
 * @property    string      targetContainer         id of the container to receive file-contents for display
 * @property    string      baseURL                 URL to server-side script for processing AJAX requests
 * @property    string      target                  variable sent to server to determine root folder
 * @property    string      folderTag               HTML Element to encapsulate a Folder on the page
 * @property    string      fileTag                 HTML Element to encapsulate a File on the page
 */
FileBrowser.Browser = function(domEle) {
    // values needed by constructor
    this.parentElement = domEle;
    $(this.parentElement).attr("filename", "");
    this.commNode = new FileBrowser.Ajax(this);

    // scan page for targetContainers
    that = this;
    this.targetContainers = [];
    $(".FileContents").each(function(x) {
       if ($(this).attr("forBrowser") == that.parentElement.id) {
           that.targetContainers.push($(this).attr("id"));
       }
    });
    $(".FileControlPanel").each(function(x) {
       if ($(this).attr("forBrowser") == that.parentElement.id) {
           that.fileControlPanel = $(this).attr("id");
           return false;
       }
    });
    $("#" + this.fileControlPanel).html(FileBrowser.Config.fileControlPanelHTML);
    $(".FolderControlPanel").each(function(x) {
       if ($(this).attr("forBrowser") == that.parentElement.id) {
           that.folderControlPanel = $(this).attr("id");
           return false;
       }
    });
    $("#" + this.folderControlPanel).html(FileBrowser.Config.folderControlPanelHTML);

    // pull FileBrowser config values from DOM Elmeent to which Browser is bound
    this.strRoot = $(this.parentElement).attr("strRoot");
    if (this.strRoot == null) {
        this.strRoot = FileBrowser.Config.strRoot;
    }
    this.baseURL = $(this.parentElement).attr("baseURL");
  //  if (this.baseURL == null) {
        this.baseURL = FileBrowser.Config.baseURL;
   // }
    this.target = $(this.parentElement).attr("target");
    if (this.target == null) {
        this.target = FileBrowser.Config.target;
    }
    this.fileTag = $(this.parentElement).attr("fileTag");
    if (this.fileTag == null) {
        this.fileTag = FileBrowser.Config.fileTag;
    }
    this.folderTag = $(this.parentElement).attr("folderTag");
    if (this.folderTag == null) {
        this.folderTag = FileBrowser.Config.folderTag;
    }
    // popoulate the Browser with files from server [getList(name = "")]
    FileBrowser.Browser.initialize(this);
}

/*
 * Browser.initialize   
 * -   Displays the "initializationMessage", then gets fileList from the server
 * 
 * @param   object      fileBrowser     reference to FileBrowser.Browser object
 */
FileBrowser.Browser.initialize = function(fileBrowser) {
    $(fileBrowser.parentElement).append('<' + fileBrowser.folderTag + ' class="root" filename=""><div class="foldername_label">' + fileBrowser.strRoot + '</div></' + fileBrowser.folderTag + '>');
    fileBrowser.commNode.getList($(fileBrowser.parentElement).find(".root").get(0));
}




/*
 * Namespace declaration for FileBrowser.File - static methods
 */

FileBrowser.File = function() {};

/*
 * click() handler for Files
 */
FileBrowser.File.clickHandler = function(event) {
    event.stopPropagation();
    theFileBrowser = FileBrowser.getTheFileBrowser(this);
    FileBrowser.clearSelected(theFileBrowser);
    FileBrowser.setFileSelected(this);
    filename = FileBrowser.getFullName(this);
    theFileBrowser.commNode.load(filename);

}




/*
 * Namespace declaration for FileBrowser.Folder - static methods
 */
FileBrowser.Folder = function() {};

/*
 * click() handler for Folders
 */
FileBrowser.Folder.clickHandler = function (event) {
    event.stopPropagation();
    theFileBrowser = FileBrowser.getTheFileBrowser(this);
    FileBrowser.clearSelected(theFileBrowser);
    FileBrowser.setFolderSelected(this);
    
    if ($(this).find(theFileBrowser.folderTag + ", " + theFileBrowser.fileTag).length > 0) {
            $(this).find(theFileBrowser.folderTag + ", " + theFileBrowser.fileTag).remove();
    } else  {
        this.fullname = FileBrowser.getFullName(this);
        theFileBrowser.commNode.getList(this);
    }
}

/*
 * Populates folder with array elements (called by Ajax.getList)
 * 
 * @param   array   arrData         array returned in the server JSON response object (result:[])
 * @param   object  folderElement   reference to HTML DOM Element of folder to populate with Ajax results
 */
FileBrowser.Folder.populate = function(arrData, folderElement) {
    theFileBrowser = FileBrowser.getTheFileBrowser(folderElement);
    theHTML = FileBrowser.ResultSet.toHTML(arrData, theFileBrowser);
    $(folderElement).find(theFileBrowser.fileTag).remove();
    $(folderElement).find(theFileBrowser.folderTag).remove();
    $(folderElement).append(theHTML);
    FileBrowser.Folder.assignClickHandlers(theFileBrowser, folderElement);
}

FileBrowser.Folder.assignClickHandlers = function(theFileBrowser, folderElement) {
    $(folderElement).unbind("click").click(FileBrowser.Folder.clickHandler);
    $(folderElement).find(theFileBrowser.fileTag).unbind("click").click(FileBrowser.File.clickHandler);
    $(folderElement).find(theFileBrowser.folderTag).unbind("click").click(FileBrowser.Folder.clickHandler);
}




/*
 * Namespace declaration for processing server responses - static methods
 */

FileBrowser.ResultSet = function() {};

/*
 * generates HTML for a result set from the server
 * (see FileBrowser.Config or HTML attributes for fileTag and folderTag)
 * - sorts the results, and return the HTML for the results
 * @param   array   arrData         server response (result:[])
 * @param   object  theFileBrowser  reference to the FileBrowser node attached to top-level for this browser
 * @returns string  theHTML         HTML representation of server array response (result:[])
 */
FileBrowser.ResultSet.toHTML = function(arrData, theFileBrowser) {
    // build the HTML for options
    arrData = FileBrowser.ResultSet.sortResults(arrData);
    theHTML = FileBrowser.ResultSet.buildHTML(arrData, theFileBrowser);
    return theHTML;
}
/*
 * Loops through the data, uses "Array.push()" and "Array.join()"
 * @param   array   theData         server response (result:[])
 * @param   object  theFileBrowser  reference to the FileBrowser node attached to top-level for this browser
 * @returns string  theHTML         HTML representation of server array response (result:[])
 */
FileBrowser.ResultSet.buildHTML = function (theData, theFileBrowser) {
    var theHTML=[];
    for (x in theData) {
        itemHTML = FileBrowser.ResultSet.datumToHTML(theData[x], theFileBrowser);
        theHTML.push(itemHTML);
    } 
    strHTML=theHTML.join("");
    return strHTML;
}

/*
 * Generates HTML for single item, according to theFileBrowser folderTag and fileTag
 * @param   string      JSONValue           JSON Value from server
 * @param   object      theFileBrowser      reference to corresponding FileBrowser
 * returns  string      theItemHTML         HTML rendition for single data Item
 */
FileBrowser.ResultSet.datumToHTML = function(JSONValue, theFileBrowser) {
            if (typeof JSONValue == 'object') {
                theItemHTML = '<' + theFileBrowser.folderTag + ' filename="' + Object.keys(JSONValue)[0] + '"><div class="foldername_label">/' + Object.keys(JSONValue)[0] + '</div></' + theFileBrowser.folderTag + '>';
            } else {
                theItemHTML = '<' + theFileBrowser.fileTag + ' filename="' + JSONValue + '">' + JSONValue + '</' + theFileBrowser.fileTag + '>'; 
            }
    return theItemHTML;
}

/*
 * Sorts the data alphabetically, placing Files before Folders
 * @param       array   theArray    Array received from the server (result:[])
 * @returns     array   theArray    Sorted array
 */
FileBrowser.ResultSet.sortResults = function(theArray){
    theFolders = [];
    theFiles = [];

    if ($.isArray(theArray)) {theArray.sort();}
    for (item in theArray) {
        if (typeof theArray[item] == 'object') {
            theFolders.push(theArray[item]);
        } else {
            theFiles.push(theArray[item]);
        }
    }
    theArray = theFiles.concat(theFolders);
    return theArray;
}






FileBrowser.FileControlPanel = {}

FileBrowser.FileControlPanel.initializePanels = function() {
    $(".FileControlPanel").each (function(x) {
        $(this).find(".save").click(FileBrowser.FileControlPanel.saveFile);
    })
}

FileBrowser.FileControlPanel.saveFile = function() {
    theControlPanelElement = this.parentNode;
    theFilename = $(theControlPanelElement).find(".fileName").val();
    
    theBrowserId = $(theControlPanelElement).attr("forBrowser");
    theFileBrowserElement = $("#" + theBrowserId).get(0);
    theFileBrowser = theFileBrowserElement.theFileBrowser
 
     selectedFolder = $(theFileBrowser.parentElement).find(".folderSelected").get(0);
    if (!selectedFolder) {selectedFolder = theFileBrowser.parentElement;}
    selectedFolderName = FileBrowser.getFullName(selectedFolder)
    
    if (selectedFolderName != "") {selectedFolderName = selectedFolderName + "/"}
    theFullFilename = selectedFolderName + theFilename;
 
    theFileContentsElement = $(".FileContents[forBrowser='"+theBrowserId+"']").get(0);
    
    // references the global 'editor' variable
    theFileContents = FileBrowser.CodeMirror.getValue(editor, theFileContentsElement);
    //alert("Saving File: " + theFullFilename + "\nFileContents: " + theFileContents);
    theFileBrowser.commNode.saveFile(theFileContents, theFullFilename, selectedFolder);
    
    // we always save the file with the current date !
    console.log(theFullFilename);
    var backupFilename=theFullFilename.replace(/(.*)\/([0-9]{12,15}_)?(.*)/,"$1/.history/<timestamp>_$3");
    if (backupFilename!=theFullFilename) {
    	theFileBrowser.commNode.saveFile(theFileContents, backupFilename, selectedFolder);
    }
}

 


/* This function finds the 'theFileBrowser', childNode of the top-level DOM Element in the folder/file structure
 * 
 * @param   string      domEle              any DOM element (only works for elements in the folder/file structure)
 * @return  object      theFileBrowser      childNode of top-level element in folder/file structure
 */ 
FileBrowser.getTheFileBrowser = function(domEle) {

// find the top-level dom element 
currentElement = domEle;
    while (!currentElement.theFileBrowser && currentElement.parentNode) {
        currentElement = currentElement.parentNode;
        if (typeof currentElement == '[object Window]') {break;}
    }

// the top-level dom element has theFileBrowser as a childNode, return that
return currentElement.theFileBrowser;
}


/* This function finds the filePath by searching parentNodes until it finds the top-level dom-element
 * compiling the pathName until it is halted at the top-level DOM Element.
 * 
 * @param   string      domEle              any DOM element (only works for elements in the folder/file structure)
 * @return  string      filename             full path to file, as indicated by the folder/file structure
 */ 
FileBrowser.getFullName = function (domEle) {
    filename = $(domEle).attr("filename")

    thePath = []
    currentNode = domEle;
        while (currentNode.theFileBrowser == null) {
            if (currentNode.parentNode) {currentNode = currentNode.parentNode;} else {break;}
            if ($(currentNode).attr("filename") != "" && $(currentNode).attr("filename") != null) {
                 thePath.push($(currentNode).attr("filename"));
            }
        }
    thePath.reverse();
    strPath = thePath.join("/");

    if (strPath != "") {filename = strPath + "/" + filename;}
    
    return filename;
}

/* This function sets the currently-selected File (for css styling, and file operations)
 * - also sets the currently-selected Folder to the parentFolder of this file
 * 
 * @param   object      domEle              reference to HTML DOM Element containing the filename="" attribute, currently selected
 */ 
FileBrowser.setFileSelected = function(domEle) {
    $(domEle).addClass("fileSelected");
    FileBrowser.setFolderSelected(domEle.parentNode);
}

/* This function sets the currently-selected Folder (for css styling, and folder operations)
 * 
 * @param   object      domEle              reference to HTML DOM Element containing the filename="" attribute, currently selected
 */ 
FileBrowser.setFolderSelected = function(domEle) {
    $(domEle).addClass("folderSelected");
    theFileBrowser = FileBrowser.getTheFileBrowser(domEle);
}

/* This function sets the currently-selected Folder (for css styling, and folder operations)
 * 
 * @param   object      fileBrowser         removes the "folderSelected" and "fileSelected" classes
 *                                          from all files and folders
 */ 
FileBrowser.clearSelected = function(fileBrowser) {
    theTopElement = fileBrowser.parentElement;
    $(theTopElement).removeClass("folderSelected fileSelected");
    $(theTopElement).find("*").removeClass("folderSelected fileSelected");
}


/*
 * Ajax Communication Node
 * This serves as a communications interface that extends from the FileBrowser object,
 * which extends from the top-level DOM Element in the file browser (linked-list style binding)
 * 
 * @param       object      fileBrowser     reference to FileBrowser object to which it is bound (parentNode)
 * @property    object      fileBrowser     reference to FileBrowser object to which it is bound (parentNode)
 */
FileBrowser.Ajax = function(fileBrowser) {
    this.fileBrowser = fileBrowser;
}

/* static method to getList from the server
 *  @param      object  folderElement                   reference to DOM Element (folder)
 *  @sub-param  string  folderElement.fullname          full path/folder name to read from server
 *  @callback   method  FileBrowser.Folder.populate     static method for populating FileBrowser with server response (result:[]) 
 */
FileBrowser.Ajax.prototype.getList = function(folderElement) {
        jQuery.getJSON(this.fileBrowser.baseURL,
                        {
                                "action":"FileManagerOld",
                                "event":"list",
                                "target":this.fileBrowser.target,
                                "name":folderElement.fullname
                        },
                        function(data) {
                                if (folderElement && folderElement.fullname) {
                                	
                                	getSecureLinks(folderElement.fullname);
                                	if (FileBrowser.Config.clickFolder) {
                                		FileBrowser.Config.clickFolder(folderElement);
                                	}
                        		}

                                if (!data.error) {
                                FileBrowser.Folder.populate(data.result, folderElement);
                                } else {
                                    alert("Server Communication Error: " + data.error);
                                }
        });
}

/* static method to load file from the server, and display it in the targetContainer (FileBrowser.targetContainer)
 *  @param      string  filename            fillename (full: path/path/filename.ext)
 *  @param      string  targetContainer     full path/folder name to read from server
 */
FileBrowser.Ajax.prototype.load = function(fullFilename) {
arrData = fullFilename.split("/");
fileShortName = arrData[arrData.length - 1];
that = this;

		jQuery.get(this.fileBrowser.baseURL,
			{
				"action":"FileManagerOld",
				"event":"load",
				"target":this.fileBrowser.target,
				"name":fullFilename
			},

			function(data) {
                            if (!data.error) {
                            	for (x in that.fileBrowser.targetContainers) {
                                    jQuery("#" + that.fileBrowser.fileControlPanel + " > .fileName").val(fileShortName);
                                    
                                    if (fullFilename.match(/^.*\.js$/)) {
                                    	jQuery("#" + that.fileBrowser.fileControlPanel + " > .currentDir").val(fullFilename.replace(/[^\/]+$/,"").replace(/^[^\/]*$/,""));
                                    	if (FileBrowser.Config.clickScript) {
                                    		FileBrowser.Config.clickScript(fullFilename);
                                    	}
                                    }
                                    if (fullFilename.match(/^.*\.json$/)) {
                                    	$("#result").val(data);
                                    	result=JSON.parse(data);
                                    } else {
                                    	FileBrowser.CodeMirror.setValue("#script", data);
                                    }
                                }
                            } else {
                                alert("Server Communication Error: " + data.error);
                            }
			},
			"text"
		);
}

FileBrowser.Ajax.prototype.saveFile = function(fileContents, fullFilename, selectedFolder) {
	that = this;
	arrData = fullFilename.split("/");
	fileShortName = arrData[arrData.length - 1];

	fileExists = false;
	selectedFile =  $(selectedFolder).find("*").each( function(x, element) {
		fileExists = ($(this).attr('filename') == fileShortName)
		if (fileExists) {return false}
	})
	isNewFile = !fileExists;
	browserFolderFiles = $(selectedFolder).find(this.fileBrowser.fileTag);
	lastFile = browserFolderFiles[browserFolderFiles.length - 1];
	firstFolder = $(selectedFolder).find(this.fileBrowser.folderTag).get(0);

//	jQuery("#" + that.fileBrowser.fileControlPanel + " > .currentDir").val(fullFilename.replace(/[^\/]+$/,"").replace(/^[^\/]*$/,""));

	appendMethod = "beforeFolders";
	if (typeof firstFolder == 'undefined') {appendMethod = "afterFiles";}
	if (typeof lastFile == 'undefined') {appendMethod = "beforeFolders";}
	if (typeof lastFile == 'undefined' && typeof firstFolder == 'undefined') {appendMethod = "simple";}

	jQuery.post(this.fileBrowser.baseURL,
			{
		"action":"FileManagerOld",
		"event":"save",
		"target":this.fileBrowser.target,
		"name":fullFilename,
		"content":fileContents
			},
			function(data) {
				if(!data.error) {

					if(isNewFile && fullFilename.indexOf(".history")==-1) {
						newItem = FileBrowser.ResultSet.datumToHTML(fileShortName, that.fileBrowser);

						switch(appendMethod) {
						case "simple":
							$(selectedFolder).click();
							break;
						case "beforeFolders":
							$(firstFolder).before(newItem);
							break;
						case "afterFiles":
							$(lastFile).after(newItem);
						default:
						}
						FileBrowser.Folder.assignClickHandlers(that.fileBrowser, selectedFolder);
					}
				} else {
					alert("Server Communication Error: " + data.error);
				}
			});
}

FileBrowser.Ajax.prototype.createFolder = function(newFolderName, selectedFolder) {
selectedFolder = (typeof selectedFolder == "undefined") 
    ?""
    :selectedFolder;

that = this;
    jQuery.getJSON(this.fileBrowser.baseURL,
				{
					"action":"FileManagerOld",
					"event":"createFolder",
					"target":this.fileBrowser.target,
					"name":newFolderName
				},
				function(data) {
					console.log(data);
                                        if (!data.error) {
                                            if (selectedFolder != "") {
                                                numberOfChildren = $(selectedFolder).find("*").length;
                                                if (numberOfChildren > 1) {
                                                    arrData = newFolderName.split("/");
                                                    newFolderShortName = arrData[arrData.length - 1];
                                                    var theNewDatum = {};
                                                    theNewDatum[newFolderShortName]=[];
                                                    newItem = FileBrowser.ResultSet.datumToHTML(theNewDatum, that.fileBrowser);
                                                    $(selectedFolder).append(newItem);
                                                   FileBrowser.Folder.assignClickHandlers(that.fileBrowser, selectedFolder);
                                                } else {
                                                    $(selectedFolder).click();
                                                }
                                            }
                                        } else {
                                            alert("Server Communication Error: " + data.error);
                                        }
		});
}

FileBrowser.Ajax.prototype.deleteFolder = function(theFolderName, selectedFolder) {
selectedFolder = (typeof selectedFolder == "undefined") 
    ?""
    :selectedFolder;
selectedParentFolder = selectedFolder.parentNode;

    jQuery.getJSON(this.fileBrowser.baseURL,
				{
					"action":"FileManagerOld",
					"event":"deleteFolder",
					"target":this.fileBrowser.target,
					"name":theFolderName
				},
				function(data) {
					console.log(data);
					if (!data.error) {
                                            $(selectedFolder).remove();
                                            //$(selectedParentFolder).click();
                                        } else {
                                            alert("Server Communication Error: " + data.error);
                                        }
		});

}

FileBrowser.Ajax.prototype.deleteFile = function(theFilename, selectedFile) {
if (typeof selectedFile == "undefined" || theFilename == "") {
    return false;
}
that = this;

    jQuery.getJSON(this.fileBrowser.baseURL,
				{
					"action":"FileManagerOld",
					"event":"delete",
					"target":this.fileBrowser.target,
					"name":theFilename
				},
				function(data) {
					console.log(data);
					if (!data.error) {
                                            $(selectedFile).remove();
                                            theBrowserId = that.fileBrowser.parentElement.id;
                                            theFileControlPanel = $(".FileControlPanel[forBrowser='"+theBrowserId+"']").get(0);
                                            theFileNameElement = $(theFileControlPanel).find(".fileName").get(0);
                                            $(theFileNameElement).val("");
                                            theFileContentsElement = $(".FileContents[forBrowser='"+theBrowserId+"']").get(0);
                                            $(theFileContentsElement).val("");
                                        } else {
                                            alert("Server Communication Error: " + data.error);
                                        }
		});
}

FileBrowser.Ajax.prototype.rename = function(name, newName, selectedElement) {
that = this;
selectedTagName = $(selectedElement).get(0).tagName;
shortNewName = newName.split("/").pop();
isPopulated = ($(selectedElement).find(theFileBrowser.folderTag + ", " + theFileBrowser.fileTag).length > 0);
isFile = (selectedTagName == this.fileBrowser.fileTag.toUpperCase());
    if (isFile) {
        newItem = shortNewName;
    } else {
        newItem = {};newItem[shortNewName] = [];
    }
newItemHTML = FileBrowser.ResultSet.datumToHTML(newItem, this.fileBrowser);

                 jQuery.getJSON(this.fileBrowser.baseURL,
				{
					"action":"FileManagerOld",
					"event":"rename",
					"target":this.fileBrowser.target,
					"name":name,
					"newName":newName
				},
				function(data) {
					console.log(data);
					if (!data.error) {
                                            selectedParentNode = selectedElement.parentNode;
                                            $(selectedElement).replaceWith(newItemHTML);
                                            FileBrowser.Folder.assignClickHandlers(that.fileBrowser, selectedParentNode);
                                            if (isPopulated) {$(selectedParentNode).find("*[filename='" + shortNewName + "']").get(0).click();}
                                        } else {
                                            alert("Server Communication Error: " + data.error);
                                        }
		});

}





FileBrowser.ContextMenu = {}

FileBrowser.ContextMenu.Config = {
    menuHTML: '     <ul id="FileBrowser-ContextMenu">\n\
                        <li id="FileBrowser-ContextMenu-CreateFolder">Create Folder</li>\n\
			<li id="FileBrowser-ContextMenu-Rename">Rename</li>\n\
			<li id="FileBrowser-ContextMenu-Delete">Delete</li>\n\
                    </ul>'
}

FileBrowser.ContextMenu.initialize = function() {
$('.FileBrowser ul, .FileBrowser li').bind('contextmenu', FileBrowser.ContextMenu.rightClickHandler);
$('body').append(FileBrowser.ContextMenu.Config.menuHTML);

$('#FileBrowser-ContextMenu').mouseleave(function(event) {
    event.stopPropagation();
    $('#FileBrowser-ContextMenu').css({"display" : "none"}) ;
});

$('#FileBrowser-ContextMenu #FileBrowser-ContextMenu-CreateFolder').click(FileBrowser.ContextMenu.createFolder);
$('#FileBrowser-ContextMenu #FileBrowser-ContextMenu-Rename').click(FileBrowser.ContextMenu.rename);
$('#FileBrowser-ContextMenu #FileBrowser-ContextMenu-Delete').click(FileBrowser.ContextMenu.remove);
}

FileBrowser.ContextMenu.rightClickHandler = function(event) {
        if (event.target.nodeName.toUpperCase() == "DIV") {
            theElement = event.target.parentNode;
        } else {
            theElement = event.target;
        }
       theContextMenu = $("#FileBrowser-ContextMenu").get(0);
       theContextMenu.theElement = theElement;
        
        theBrowser = FileBrowser.getTheFileBrowser(theElement);
        FileBrowser.clearSelected(theBrowser);

        if (theElement.nodeName.toLowerCase() == theBrowser.fileTag) {
            FileBrowser.setFileSelected(theElement);
        }
        if (theElement.nodeName.toLowerCase() == theBrowser.folderTag) {
            FileBrowser.setFolderSelected(theElement);
        }
        
        $("#FileBrowser-ContextMenu").css({"top" : event.clientY-20, "left": event.clientX-10, "display": "block"});

return false;
}

FileBrowser.ContextMenu.createFolder = function() {
    theElement = this.parentNode.theElement;
    
    theBrowser = FileBrowser.getTheFileBrowser(theElement);
    theBrowserId = $(theBrowser.parentElement).attr("id");

    theSelectedFolderElement = $("#" + theBrowserId + " .folderSelected").get(0);
    theSelectedFolderFullname = FileBrowser.getFullName(theSelectedFolderElement);

    theNewName = prompt("Enter new name for file or folder:");
    
    if (theSelectedFolderFullname != "") {
        theNewName = theSelectedFolderFullname + "/" + theNewName;
    }
    
    //alert("Create Folder under: " + theSelectedFolderFullname);
    theBrowser.commNode.createFolder(theNewName, theSelectedFolderElement);
}

FileBrowser.ContextMenu.rename = function() {
    theElement = this.parentNode.theElement;
    
    theBrowser = FileBrowser.getTheFileBrowser(theElement);
    
    theFullName = FileBrowser.getFullName(theElement);
    if (theFullName == "") {alert("You cannot rename the root directory."); return false;}
    
    arrData = theFullName.split("/");
    if (arrData.length > 1) {
        theShortName = arrData.pop();
    } else {
        theShortName = theFullName;
    }
    
    theNewName = prompt("Enter new name for file or folder:");
    
    if (theShortName != theFullName) {
        theNewFullName = arrData.join("/") + "/" + theNewName;
    } else {
        theNewFullName = theNewName;
    }
    
    //alert("Renaming: " + theFullName + " to: " + theNewFullName);
    //alert("Renaming: " + theShortName + " to: " + theNewName);
    theBrowser.commNode.rename(theFullName, theNewFullName, theElement);
}

FileBrowser.ContextMenu.remove = function() {
    theElement = this.parentNode.theElement;
    
    theBrowser = FileBrowser.getTheFileBrowser(theElement);
    theBrowserId = $(theBrowser.parentElement).attr("id");

    if (theElement.nodeName.toLowerCase() == theBrowser.folderTag) {
        itemType = "folder";
    } else {
        itemType = "file";
    }
    
    theFullName = FileBrowser.getFullName(theElement);
    
    //alert("Clicked Delete on (" + itemType + ") " + theFullName);
    switch (itemType) {
        case "file": 
            theSelectedElement =  $("#" + theBrowserId + " .fileSelected").get(0);
            theBrowser.commNode.deleteFile(theFullName, theSelectedElement);
            break;
        case "folder": 
            theSelectedElement =  $("#" + theBrowserId + " .folderSelected").get(0);
            theBrowser.commNode.deleteFolder(theFullName, theSelectedElement);            
            break;
    }
}


FileBrowser.CodeMirror = {}

FileBrowser.CodeMirror.setValue = function(theSelector, data) {
    				editor.toTextArea();
				$(theSelector).val(data);
				addEditor();
}
FileBrowser.CodeMirror.getValue = function(editorObj, theFileContentsElement) {
    editorObj.save();
    theContents = $(theFileContentsElement).val();
    return theContents;
}

    