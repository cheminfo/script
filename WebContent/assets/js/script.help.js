var help={};
var searchableHelp=[];
$.getJSON(addresses().help,
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
				help[properties[i]]=data[properties[i]];
			}
			var help2={};
			$.each(help,function(a,b){
				var split = a.split(".");
				if(split.length==1)
					addLib(split[0],help2,b);
				else{
					var parent=help2;
					for(var i=0; i<split.length-1;i++){
						parent=parent.lib[split[i]];
					}
					addLib(split[split.length-1],parent,b);
				}
			});
			function addLib(name,parent,lib){
				if(!parent.lib)parent.lib={};
				parent.lib[name] = lib;
			}
			help=help2;
			
			var scanLib = function(lib, parent){
				searchableHelp=searchableHelp.concat(getFunctions(lib, parent.substring(5)));
				for(var childLib in lib.lib)
					scanLib(lib.lib[childLib],parent+"."+childLib);
			};
			var getFunctions = function(lib,parent){
				var functions = [];
				for(var name in lib.functions) {
					var value = lib.functions[name];
					var fullName = parent+"."+name;
					value.name=name;
					value.parentName=parent;
					var values = [];
					values.push(fullName.toLowerCase());
					if(value.short) values.push(value.short.toLowerCase());
					else values.push("");
					if(value.parameters){
						var params="";
						for(var param in value.parameters)
							params+=param.toLowerCase()+":"+value.parameters[param].toLowerCase();
						values.push(params);
					}
					else values.push("");
					if(value.options){
						var params="";
						for(var param in value.options)
							params+=param.toLowerCase()+":"+value.options[param].toLowerCase();
						values.push(params);
					}
					else values.push("");
					functions.push({searchString: values, value:value});
				}
				return functions;
			};
			scanLib(help, "root");
		});

$(function(){
	function searchInHelp(t){
		HELP.showSearch($(this).val(),$('#help-text'));
	}
	$('#help-search-input').on({
		"keyup":searchInHelp,
		"focus":searchInHelp
	});
});