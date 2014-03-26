<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Scripting example</title>
	<script src="javascript/jquery/jquery.min.js" language="javascript" type="text/javascript"></script>
	<script src="javascript/jquery/jquery.cookie.js" language="javascript" type="text/javascript"></script>

	<script type="text/javascript" src="javascript/filebrowser/FileBrowser.js"></script>
	<link rel="stylesheet" title="FileBrowser" type="text/css" href="javascript/filebrowser/FileBrowser.css" />
           
           
	<style> 
			#dropbox {
                width: 200px;
                height: 40px;
                border: 1px solid gray;
                border-radius: 5px;
                padding: 5px;
                color: gray;
			}
	</style>
	<script src="javascript/codemirror/lib/codemirror.js"></script>
	<script src="javascript/codemirror/mode/javascript/javascript.js"></script>
	<script src="javascript/codemirror/lib/util/simple-hint.js"></script>
	<script src="javascript/codemirror/lib/util/javascript-hint.js"></script>
	
	<link rel="stylesheet" href="javascript/codemirror/lib/codemirror.css">
	<link rel="stylesheet" href="javascript/codemirror/lib/util/simple-hint.css">
	<link rel="stylesheet" href="javascript/help/docs.css">
	<link rel="stylesheet" href="javascript/help/help.css">

	<script src="javascript/help/help.js"></script>
	
	<script>
		var help={};
		$.getJSON("../javascript/help/plugins.help.json",
			{},
			function(data) {
				var properties=[];
				for (property in data) {
					if (property.indexOf("_")==-1) {
						properties.push(property);
					}
				}
				properties.sort();
				for (var i=0; i<properties.length; i++) {
					if (data[properties[i]].functions) {
						help[properties[i]]=data[properties[i]];
					}
				}
		  });
	</script>

	<style>
		.CodeMirror {border-top: 1px solid black; border-bottom: 1px solid black;}
		div.hintoutput {
		    font-family: sans-serif;
		    font-size: 8pt;
		    text-indent: -1em;
		    padding-left: 1em;
		    width: 300px;
		}
	</style>
</head>

<body>


	<h3>Servlet script</h3>
	<table style="width:100%;">
	<tr>
		<td valign="top" rowspan=2>
			Files:<br>
			<table width="100%">
				<tr><td>
					 <span id="FileBrowser_1" class="FileBrowser" strRoot="./" baseURL="Run" target="data"></span>
				</td></tr>
				<tr><td>
					<span id="aFileControlPanel" class="FileControlPanel" forBrowser="FileBrowser_1"></span>
				</td></tr>
				<tr><td>
					<div id="dropbox">Drag and drop files here...</div>
	      			<div id="status"></div>
				</td></tr>
			</table>
		</td>
		<td valign="top">
		  		<table>
		  			<tr id="initScriptLine"><td>
		  				Init script:<br>
		  				<div style="width:750px">
		  				<textarea id="initScript" name="initScript" rows=4 cols=90></textarea>
		  				</div>
		  			</td></tr>
		  			<tr><td>
		  				Put your js script here: &nbsp;&nbsp;&nbsp; New session<input type="checkbox" name="forceNew" id="forceNew" checked>
		  				&nbsp;&nbsp;&nbsp; Get full result<input type="checkbox" name="getResult" id="getResult"><br>
		  				
		  				<div style="width:750px">
		  					<textarea id="script" class="FileContents" forBrowser="FileBrowser_1" name="script" rows=30 cols=120></textarea>
		  				</div>
		  			</td></tr>
		  			<tr><td><center>
		  				<table>
		  					<tr>
		  						<td>
		  							Result branch: <input type="text" id="resultBranch" value="Master"></input><br>
		  				<!-- 	Description:  <input type="text" id="description"></input>&nbsp;  -->		
		  						</td>
		  						<td valign="middle">
		    						<button class="run" onclick="runScript()">Run script</button>
		    						<button class="run" onclick="runScript({view:true})">Run script and visualize</button>
		    					</td>
		    				</tr>
		    			</table>
		    		</center></td></tr>
		  		</table>
		</td>
		<td valign="top" rowspan=3 width="100%">
			<div id="hints" class="help">&nbsp;</div>
		</td>
	</tr>
	<tr>
		<td valign="top">Output:<br><textarea name="result" id="result" rows=10 cols=90></textarea>
			<br>
			<select id="visualizerList" onchange="$.cookie('selectedVisualizer',$(this).val(),{expires: 1000});">
			</select>
			<input type="hidden" value="1" name="contrast" id="contrast" />
			<button onClick="openVisualizer();">Visualizer</button>
			
			&nbsp;
			
			<button id='json' onClick="openJSON();">JSON</button>
			
	
			
			<!-- 
			<button id='matdraw' style="visibility: hidden" onClick="window.open('renders/matdraw.html')">Distance Matrix</button>
			<button id='jcamp' style="visibility: hidden" onClick="window.open('renders/TestChemDoodle/index.html')">Spectrum</button>
			<button id='report' onClick="window.open('renders/ucb.html')">Table</button>
			<button id='googleChart' style="visibility: hidden" onClick="window.open('renders/googleCharts.html')">Chart</button>
			 -->
			<br>
			Tiny URL: <input type="text" size="100" id="tinyurl">
		</td>
	<tr>
	</table>
	
<script type="text/javascript">
	var url='../Run';

	function getSecureLinks(path) {
		$.get(url,
				{
					path: path,
					tmpJpg: path+"/.tmp/<timestamp><random>.jpg",
					action: "GetKeys"
				},
				function(data) {
					if (data.result) {
						//console.log(data.result);
					}
				}
		)
	}
	
	
	function openVisualizer(old) {
		// Ajax query to get all the keys
		$.get(url,
			{
				dataURL: result._dataFilename,
				viewURL: result._viewFilename,
				results: result._dataFilename.replace(/[^\/]*\/[^\/]*$/,""),
				views: result._viewFilename.replace(/[^\/]*\/[^\/]*$/,""),
				
				action: "GetKeys"
			},
			function(data) {
				if (data.result) {
					//console.log(data);
					//console.log("OLD: "+old);
					
					
					//var viewURL=escape(data.result.viewURL.readURL);
					//var dataURL=escape(data.result.dataURL.readURL);
					
					//var viewURL=escape(data.result.viewURL.revisionReadURL);
					var viewURL="";
					if (old) {
						viewURL=escape(result.visualizerLayoutReadURL);
						//console.log(result);
					}
					//var dataURL=escape(data.result.dataURL.revisionReadURL);
					var dataURL="";
					
					var views=escape(data.result.views.revisionWriteURL);
					var results=escape(data.result.results.revisionWriteURL);
					var viewBranch="Master";
					var resultBranch=$("#resultBranch").val();
					
					var saveViewURL=escape(data.result.viewURL.writeURL);

					
					var website=$('#visualizerList').val();
					var targetURL=website+
							"?viewURL="+viewURL+
							"&dataURL="+dataURL+
							"&views="+views+
							"&results="+results+
							"&viewBranch="+viewBranch+
							"&resultBranch="+resultBranch+
							""
							;
					window.open(targetURL,"The view","toolbar=0,scrollbars=1,location=0,resizable=1,width="+window.outerWidth+",height="+window.outerHeight);
					
					getTinyURL(targetURL);
				}
		});
	}
	

	var result;
	function runScript(options) {
		editor.save();
		$('#result').val("Running ...");
		var forceNew=false;
		if ($('#forceNew').is(':checked')) {
			forceNew=true;
		}
		var getResult=false;
		if ($('#getResult').is(':checked')) {
			getResult=true;
		}
		
		$.ajax({
			type:'POST',
			url: url,
			context: options,
			data: {
				script: $('#script').val(),
				initScript: $('#initScript').val(),
				currentDir: $('#currentDir').val(),
				forceNew: forceNew,
				getResult: getResult,
				resultBranch: $('#resultBranch').val(),
			//	description: $('#description').val(),
				dataType: "json"
			},
			success: function(data) {
				result=data;
				updateButton(result);
				$('#result').val(JSON.stringify(result));

				if (this.view) {
					openVisualizer();
				}
				if (this.oldView) {
					openVisualizer(true);
				}
			}
		});
	}

	function openJSON() {
		var tmpResult=JSON.parse($('#result').val());
		if (!tmpResult || !tmpResult._dataUrl) {
			window.open('renders/jsonreport/index.html');
		} else {
			window.open('renders/jsonreport/index.html?url='+tmpResult._dataUrl);
		}
	}
	

	function updateButton(result) {
		for (var metaVar in result){
			/*
			if (result[metaVar].type == 'matrix'){
				$('#matdraw').css('visibility','visible');
			}
			if (result[metaVar].type == 'report'){
				$('#report').css('visibility','visible');
			}
			
			//if(result[metaVar].type == 'tree')
				$('#dendrogram').css('visibility','visible');
			
			if(result[metaVar].type == 'jcamp')
				$('#jcamp').css('visibility','visible');
			if(result[metaVar].type == 'googleChart')
				$('#googleChart').css('visibility','visible');
			*/
		}
	}
	function hideButtons(){
		$('#matdraw').css('visibility','hidden');
		$('#report').css('visibility','hidden');
		$('#jcamp').css('visibility','hidden');
		$('#googleChart').css('visibility','hidden');
	}
	
	
	function addVisualizer() {
		var localhost=true;
		var url="http://www.cheminfo.org/visualizer/release/list.shtml";
		if (localhost) {
			url="/visualizer/release/list.shtml";
		}
		var selected=$.cookie("selectedVisualizer");
		if (! selected) {
			selected="current";
		}
		//console.log(selected);
		$.get(url, {},
			function(data) {
				var allVisualizerVersions=eval("("+data+")").files;
				allVisualizerVersions.sort(function(a,b) {
					if (a.name<b.name) return 1;
					if (a.name>b.name) return -1;
					return 0;
				});
				//allVisualizerVersions[i].name
				
				$('#visualizerList').html("");
				for (var i=0; i<allVisualizerVersions.length; i++) {
					var option = document.createElement('option');
					option.value=allVisualizerVersions[i].url
					if (localhost) option.value=option.value.replace("http://www.cheminfo.org","");
					option.appendChild(document.createTextNode(allVisualizerVersions[i].name));
					if (option.value==selected) {
						option.selected="selected";
					}
					$('#visualizerList').append(option);
				}
				var option = document.createElement('option');
				option.value="http://npellet.github.com/visualizer/index.html";
				option.appendChild(document.createTextNode("Head"));
				if (selected=="head") {
					option.selected="selected";
				}
				$('#visualizerList').append(option);
			}
		)
		
	}
	
	addVisualizer();
	
	
	function getTinyURL(targetURL) {
		$.get(url,
				{
					action: "GetTinyURL",
					url: targetURL
				},
				function(data) {
					$("#tinyurl").val(JSON.parse(data).url)
					//console.log("OK: "+data);
			  });
	}
	

	var editor;
	var hints;
	
	function addEditor() {
	      hints = $("#hints");
	      editor = CodeMirror.fromTextArea($("#script")[0], {
	        mode: "javascript",
	        onCursorActivity: function(cm) {HELP.showHints(cm, hints);},
	        extraKeys: {"Ctrl-Space": function(cm) {CodeMirror.simpleHint(cm, HELP.javascriptHint);}},
	        lineNumbers: true,
	        matchBrackets: true,
	        tabMode: "indent",
	        autofocus: true
	      });
	}
	
	
	function getURLParameter(name) {
	    return unescape(
	        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
	    );
	}
	
	// check if we have some initURL
	var scriptInit=getURLParameter("initURL");
	if (scriptInit && scriptInit!=null && scriptInit!="null") {
		$("#initScript").val("var data=getUrlContent('"+scriptInit+"'); data=eval('('+data+')');");
	} else {
		$("#initScriptLine").hide();
	}

	
	addEditor();
	
	
	// we will check if we are logged in ...
	$.get(url,
		{
			action: "Dir"
		},
		function(data) {
			//console.log(data);
			if(data.result) {
				
				FileBrowser.initialize();
			} else if (data.error) {
				// debug ... we log as test@patiny.com
				$(location).attr('href',"Login/EhkHirhv60/test@patiny.com");
			}
		}
	);
			

	
	
	
</script>


<script src="javascript/upload.js"></script>
<script>
new FileUploader("dropbox","status", "/script/Run", 
		function() {
			return $("#currentDir").val();
		},
		function(response) {
			document.getElementById("status").innerHTML=response;
			window.setTimeout('document.getElementById("status").innerHTML=""',2000);
			//updateCurrentFolder();
		}
	);
</script>


<font size="1" face="arial">
We use on this project: 
 <a href="http://www.prototypejs.org/">prototype</a>
, <a href="http://www.jquery.com/">jquery</a>
, <a href="http://codemirror.net//">codemirror</a>
, <a href="http://www.json.org/">json</a>
, <a href="http://pajhome.org.uk/crypt/md5/">md5</a>
, <a href="http://www.javascripttoolbox.com/lib/table/">Matt Kruse tables</a>
</font>
</body>
</html>