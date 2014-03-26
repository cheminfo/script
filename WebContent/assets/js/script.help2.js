var HELP = {};

$(function() {
	HELP.showHints = function(cm, div) {
		div.html("");
		server.getHint(cm, function(data) {
			var result = [];
			$.each(data.list, function(a, b) {
				var info = b.data;
				var name = info.name;
				if(info.help && name != "prototype")
					result.push(info.help);
			});
			var options = {
				from : data.from,
				to: data.to,
				currentRange : cm.doc.getRange(data.from, data.to)
			};
			if (result.length == 1)
				options.alone = true;
			$.each(result, function(a, b) {
				if(b.type=="function" || b.type=="property")
					div.append(displayFunction(b, options));
				else //if(b.type=="object" || b.type=="property")
					div.append(displayObject(b, options));
			});
		});
	};
	
	var clickFunctionName = function(event) {
		var title = event.data.title;
		var obj = event.data.obj;
		var options = event.data.options;
		var clickTitle = title;
		var select=null;
		if(options.useFullName) {
			clickTitle = obj.fullName;
		} else if(obj.type=="function") {
			clickTitle = obj.usage.replace("options", "{}");
			var start = clickTitle.indexOf("(")+1;
			if(start > 0) {
				select = {};
				select.from = {line:options.from.line, ch: options.from.ch+start};
				select.to = {line:select.from.line, ch: select.from.ch};
				var virgule = clickTitle.indexOf(",");
				if(virgule>0) {
					select.to.ch += virgule-start;
				} else {
					if(clickTitle.indexOf("{}")>0)
						select=null;
					else
						select.to.ch += (clickTitle.indexOf(")")-start);
				}
			}
		} else if(obj.type=="object" || obj.type=="constructor") {
			clickTitle+=".";
		}
		
		$cm.replaceRange(clickTitle,options.from, options.to);
		if(select) {
			$cm.setSelection(select.from, select.to);
		}
		$cm.focus();
	};

	function displayObject(obj, options) {
		options = options ? options : {};
		var blockObj = $('<div>');
		
		var title = "NO_NAME";
		if (obj.name)
			title = obj.name;

		if (options.currentRange == title || options.alone) {
			obj.full = true;
		}
		
		if(options.useFullName)
			title = obj.fullName;
		
		
		blockObj.append($('<div>').addClass("title").addClass("object-title").html(title).click({title:title, obj:obj, options:options},clickFunctionName));
		
		if (obj.full) {
			blockObj.append($('<div>').addClass("long").html(obj.short+" "+obj.long));
			obj.full = false;
		}
		else if(obj.short) {
			blockObj.append($('<div>').addClass("short").html(obj.short));
		}

		return blockObj;
	}
	
	function displayFunction(obj, options) {
		options = options ? options : {};

		var blockObj = $('<div>');

		var title = "NO_NAME";
		if (obj.name)
			title = obj.name;

		if (options.currentRange == title || options.alone) {
			obj.full = true;
			if (obj.usage)
				title = obj.usage;
		}

		if(options.useFullName)
			title = obj.fullName;
		
		blockObj.append($('<div>').addClass("title").addClass("object-title").html(title).click({title:title, obj:obj, options:options},clickFunctionName));

		if (obj.full) {

			blockObj.append($('<div>').addClass("long").html(obj.short+" "+obj.long));

			fields = [ 'parameters', 'options', 'examples' ];

			if(obj.parameters)
				blockObj.append(displayField(appendParam(obj.parameters),"Parameters", "parameters"));
			
			if(obj.options)
				blockObj.append(displayField(appendField(obj.options),"Options", "options"));
			
			if(obj.examples)
				blockObj.append(displayField(appendField(obj.examples),"Examples", "examples"));

			if (obj.returns && obj.type=="function") {
				blockObj.append(displayField($("<ul>").append(
						$('<li>').html(function() {
							text = obj.returns.value;
							if (obj.returns.name != text)
								text = "<b>" + obj.returns.name + ":</b> " + text;
							return $('<span>').addClass('value').html(text);
						})), "Returns", "returns"));
			}

			if (obj.links)
				blockObj.append(displayField(appendLinks(obj.links), "Links","links"));

			if (obj.wikipedia)
				blockObj.append(displayField(appendWiki(obj.wikipedia),
						"Wikipedia", "wikipedia"));

			obj.full = false;
		} else if (obj.short)
			blockObj.append($('<div>').addClass("short").html(obj.short));

		return blockObj;
	}

	function displayField(obj, name, className) {
		b = $('<div>').addClass(className);
		b.append($('<div>').html(name).addClass("title"));
		b.append(obj);
		return b;
	}
	
	function appendParam(obj) {
		r = $('<ul>');
		$.each(obj, function(a, b) {
			r.append($('<li>').html(function() {
				text = b.value;
				if (b.name != text)
					text = "<b>" + b.name.replace(/:.*/,"") + ":</b> " + text;
				return $('<span>').addClass('value').html(text);
			}));
		});
		return r;
	}

	function appendField(obj) {
		r = $('<ul>');
		$.each(obj, function(a, b) {
			r.append($('<li>').html(function() {
				text = b.value;
				if (b.name != text)
					text = "<b>" + b.name + ":</b> " + text;
				return $('<span>').addClass('value').html(text);
			}));
		});
		return r;
	}

	function appendLinks(obj) {
		r = $('<ul>');
		$.each(obj, function(a, b) {
			r.append($('<li>').html(function() {
				return $('<a>', {
					'class' : 'link',
					'href' : b.name,
					'target' : '_blank'
				}).html(b.value);
			}));

		});
		return r;
	}

	function appendWiki(obj) {
		r = $('<ul>');
		$.each(obj, function(a, b) {
			r.append($('<li>').html(function() {
				var iframe = null;
				return $('<a>', {
					'class' : 'link',
					'href' : b.name
				}).html(b.value).on("click", function() {
					$('<div>').html(function() {
						iframe = $('<iframe>', {
							src : b.name + "?printable=yes"
						});
						return iframe;
					}).dialog({
						title : b.value,
						width : $(window).width() * 0.9,
						open : function() {
							iframe.css({
								border : 0,
								'width' : "100%",
								"height" : "99%",
								margin : 0
							});
						},
						height : $(window).height() * 0.9
					});
					return false;
				});
			}));

		});
		return r;
	}
	
	var searchableHelp = [];
	for(var id in help) {
		if(id.charAt(0)!="!" && id != "prototype")
			addElement(help[id],id);
	}
	function addElements(element, name) {
		for(var id in element) {
			if(id.charAt(0)!="!" && id != "prototype")
				addElement(element[id],name+"."+id);
		}
	}
	function addElement(element, name) {
		var help;
		if(help = element["!help"]) {
			if(help.type=="function" || help.type=="property") {
				help.fullName = name;
				var helpItem = {search: [name.toLowerCase(),(help.short+help.long).toLowerCase(),"",""], value: help};
				if(help.parameters) {
					var param = help.parameters;
					for(var i=0, ii=param.length; i<ii; i++)
						helpItem.search[2]+=(param[i].name+param[i].value).toLowerCase();
				}
				if(help.options) {
					var opt = help.options;
					for(var i=0, ii=opt.length; i<ii; i++)
						helpItem.search[3]+=(opt[i].name+opt[i].value).toLowerCase();
				}
				searchableHelp.push(helpItem);
			}
			else
				addElements(element, name);
		}
	}
	
	function searchInHelp(toSearch){
		toSearch=toSearch.toLowerCase();
		var results=[];
		loop1: for(var i=0; i<searchableHelp.length; i++){
			var currentValue=searchableHelp[i];
			for(var j=0; j<4; j++){
				if(currentValue.search[j].indexOf(toSearch)>-1){
					results.push({index: j, value:currentValue});
					continue loop1;
				}
			}
		}
		results.sort(function(a,b){
			var indexDiff = (a.index-b.index)*100;
			var typeDiff = a.value.value.type == b.value.value.type ? 0 : a.value.value.type == "function" ? -10 : 10;
			var stringDiff = a.value.search[0].localeCompare(b.value.search[0]);
			return(indexDiff+typeDiff+stringDiff);
		});
		return results;
	}
	
	function showSearch(searchString, div) {
		div.html("") ;
		
		if(searchString.length==0)return;
		var searchResult=searchInHelp(searchString);
		$.each(searchResult,function(i,obj){
			obj.value.value.full=(searchResult.length===1);
			if(obj.value.value.type == "function") {
				div.append(displayFunction(obj.value.value, {useFullName:true, from: $cm.getCursor()}));
			} else if(obj.value.value.type == "property") {
				div.append(displayObject(obj.value.value, {useFullName:true, from: $cm.getCursor()}));
			}
		});
	}
	
	var searchCallback = function(t){
		showSearch($(this).val(),$('#help-text'));
	};
	$('#help-search-input').on({
		"keyup":searchCallback,
		"focus":searchCallback
	});

});