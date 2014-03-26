var url='/script/Run';
var result;
var baseDir="/analytic/mass/plateChecker/checkEditable/";
var dataFolderManager=new FileAPI(baseDir+"data/");
var scriptManager=new FileAPI(baseDir+"");
$("#currentPath").val(baseDir+"");
var currentDataFolderManager;
$("#runscript").hide();
$("#json").hide();
$("#reopenVisualizer").hide();
$("#currentDataInfo").hide();


// LOAD THE SCRIPT AUTOMATICALLY
scriptManager.load("Master.js", function(result) {
		$("#script").val(result);
	}
);




function runScript(options) {
	running("Running analysis");
	$('#result').val("Running ...");
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
			currentDir: $('#currentPath').val(),
			forceNew: true,
			getResult: getResult,
			resultBranch: $('#resultBranch').val(),
			dataType: "json"
		},
		success: function(data) {
			finishedRunning();
			updateCurrentResult();
			result=data;
			$('#result').val(JSON.stringify(result));
			$("#json").show();
			if (this.view) {
				openVisualizer();
			}
		}
	});
}



// We load all the folder present in the datafolder
function updateDataFolder() {
	dataFolderManager.dir(function(result) {
		var folders=JSON.parse(result).result;
		var dataSet=[];
		for (var i=0; i<folders.length; i++) {
			var folder=folders[i];
			if (folder.isFolder && ! folder.name.match(/^\..*/)) {
				dataSet.push("<li onclick='changeDataSet(\""+folder.name+"\")'>"+folder.name+"</li>");
			}
		}
		$("#dataSet").html("<ul>"+dataSet.join("")+"</ul>");
	});
}

updateDataFolder();

function updateCurrentFolder() {
	$("#runscript").hide();
	if (!currentDataFolderManager) {
		return;
	}
	currentDataFolderManager.dir(function(result) {
		var files=JSON.parse(result).result;
		var dataSet=[];
		$("#fptExists").css("background-color","red");
		$("#mfExists").css("background-color","red");
		$("#sdfExists").css("background-color","red");
		var nbFpt=0;
		var nbSdf=0;
		var nbMf=0;
		for (var i=0; i<files.length; i++) {
			var file=files[i];
			if (! file.isFolder && ! file.name.match(/^\..*/)) {
				dataSet.push("<li>"+file.name+"</li>");
				// if (file.name.match(/.*fpt$/)) $("#fptExists").css("background-color","green");
				// if (file.name.match(/.*txt$/)) $("#mfExists").css("background-color","green");
				// if (file.name.match(/.*sdf$/)) $("#sdfExists").css("background-color","green");
				if (file.name.match(/.*fpt$/)) {
					nbFpt++;
				}
				if (file.name.match(/.*txt$/)) {
					nbMf++;
				};
				if (file.name.match(/.*sdf$/)) {
					nbSdf++;
				}
			}
		}
		if (nbFpt==1) {
			$("#fptExists").css("background-color","green");
		} else if (nbFpt>1) {
			$("#fptExists").css("background-color","orange");
		}
		if (nbSdf==1) {
			$("#sdfExists").css("background-color","green");
		} else if (nbSdf>1) {
			$("#sdfExists").css("background-color","orange");
		}
		if (nbMf==1) {
			$("#mfExists").css("background-color","green");
		} else if (nbMf>1) {
			$("#mfExists").css("background-color","orange");
		}
		if (nbFpt==1 && (nbSdf==1 || nbMf==1)) {
			$("#runscript").show();
		}
		$("#currentDataFolder").html("<ul>"+dataSet.join("")+"</ul>");
		$("#dropbox").css("display","block");
	});
}

function updateCurrentResult() {
	// we have a look if there is a previous result
	$("#result").val("");
	$("#json").hide();
	$("#reopenVisualizer").hide();
	
	var currentResultFolderManager=new FileAPI($("#currentPath").val()+"/.results/"+$("#resultBranch").val());
	currentResultFolderManager.dir(function(result) {
		var files=JSON.parse(result).result;
		if (files) {
			if (files.length>0) {
				$("#reopenVisualizer").show();
			}
		}
	},{filter:".*json$"});
}

function newDataSet() {
	var newFolderName=window.prompt("Name of the new dataset","");
	if (newFolderName) {
		newFolderName=newFolderName.replace(/[^a-zA-Z0-9_\.,]/,"");
		dataFolderManager.createFolder(newFolderName, function(result) {
			updateDataFolder();
			changeDataSet(newFolderName);
		});
	}
}

new FileUploader("dropbox","status", "/script/Run", 
		function() {
			return $("#currentDataPath").val();
		},
		function(response) {
			document.getElementById("status").innerHTML=response;
			window.setTimeout('document.getElementById("status").innerHTML=""',2000);
			updateCurrentFolder();
		}
	);

function changeDataSet(dataSet) {
	$("#initScript").val(
		"var dataSet='"+dataSet+"';\r\n"+
		"var baseDir='"+baseDir+"';\r\n"
	);
	$("#resultBranch").val(dataSet);
	$("#currentDataSet").html(dataSet);
	$("#currentDataPath").val(baseDir+"data/"+dataSet);
	currentDataFolderManager=new FileAPI(baseDir+"data/"+dataSet);
	updateCurrentFolder();
	updateCurrentResult();
	$("#currentDataInfo").show();
}





function running(message) {
	$("#runningInfo").html(message);
	$("#running").show();
	$("#notrunning").hide();
}

function finishedRunning() {
	$("#running").hide();
	$("#notrunning").show();
}

$("#running").hide();
