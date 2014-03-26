var HELP = function() {
	function showHints(cm, div) {
		var complete = completionsFor(cm), html = "";
		if (complete) {
			var options={parent: complete.parent};
			if (complete.type=="toplevel") {
				for (var i = 0; i < complete.values.length; ++i) {
					html += "<div class='object'>"+showObject(complete.values[i],options) + "</div>";
				}
			} else if (complete.type=="method") {
				for (var i = 0; i < complete.values.length; ++i) {
					if (complete.values.length==1 || cm.getValue().indexOf(complete.values[i].name, cm.getValue().length - complete.values[i].name.length) != -1) {
						options.full=true;
					} else {
						options.full=false;
					}

					html += "<div class='method'>"+showMethod(complete.values[i],options) + "</div>";
				}
			} 
		}
		div.html(html);
	}

	function appendField(result, obj) {
		result.push("<ul>");
		forEach(obj, function(name, desc) {
			result.push("<li><span class='name'>" + name +"</span> ");
			if (typeof desc == "string") {
				result.push("<span class='value'>" + desc+"</span> ");
			} else appendField(desc);
			result.push("</li>");
		});
		result.push("<ul>");
	}
	
	function appendLink(result, obj) {
		result.push("<ul>");
		forEach(obj, function(link, label) {
			result.push("<li><a class='link' target='_blank' href='"+link+"'>" + label +"</a></li>");
		});
		result.push("<ul>");
	}
	
	/*
	 * Display the value
	 * This will depend of the number of items that are currently selected
	 */
	function showObject(val, options) {
		var result=[];
		result.push("<div class='title'>" + val.name + "</div>");
		if (val.short) result.push("<div class='short'>" + val.short+"</div>");
		if (options.full && val.long) result.push("<div class='long'>" + val.long+"</div>");
		return result.join("");
	}
	
	/*
	 * Display the value
	 * This will depend of the number of items that are currently selected
	 */
	function showMethod(val, options) {
		var result=[];
		result.push("<div class='title'>" + val.name + "</div>");
		if (val.usage) result.push("<div class='usage'>" + val.usage + "</div>");
		if (val.short) result.push("<div class='short'>" + val.short + "</div>");
		
		if (options.full) {
			if (val.long) result.push("<div class='long'>" + val.long + "</div>");
			if (val.wikipedia) {
				result.push("<div class='wikipedia'><span class='title'>Wikipedia</span>");
				appendLink(result, val.wikipedia);
				result.push("</div>");
			}
			if (val.links) {
				result.push("<div class='links'><span class='title'>Links</span>");
				appendLink(result, val.links);
				result.push("</div>");
			}
			if (val.parameters) {
				result.push("<div class='parameters'><span class='title'>Parameters</span>");
				appendField(result, val.parameters);
				result.push("</div>");
			}
			if (val.options) {
				result.push("<div class='options'><span class='title'>Options</span>");
				appendField(result, val.options);
				result.push("</div>");
			}
			if (val.returns) {
				result.push("<div class='returns'><span class='title'>Returns</span>");
				appendField(result, val.returns);
				result.push("</div>");
			}
			if (val.examples) {
				result.push("<div class='examples'><span class='title'>Examples</span>");
				appendField(result, val.examples);
				result.push("</div>");
			}
		}

		return result.join("");
	}
	
	
	/* We just add the possible function for the hint with CTRL + space */
	function javascriptHint(cm) {
		var gen = CodeMirror.javascriptHint(cm);
		var extra = completionsFor(cm);
		if (extra) {
			for (var i = 0; i < extra.values.length; ++i) {
				if (extra.values[i].usage) {
					gen.list.push(extra.values[i].usage);
				} else {
					gen.list.push(extra.values[i].name);
				}
			}
		}
		return gen;
	}

	function completionsFor(cm) {
		var cur = cm.getCursor();
		var line = cm.getLine(cur.line);
		var cursorLine = line.slice(0, cur.ch);
		
		var extractFunctionName = function(string){

			var parenthesis=0;
			length=string.length;
			var indices = [];
			for (var i=0; i<length; i++) {
				var theChar=string.charAt(i);
				if (theChar=='(') {
					indices.push(i);
					parenthesis++;
				}
				if (theChar==')') {
					parenthesis--;
					if(parenthesis>-1)
						indices.pop();
				}
			}
		//	var reg = /[\w_.]+$/;
		//	var match = string.substring(0,indices[indices.length-1]).match(reg);
		//	if(match) return match[0];
		//	else return "";
			var toReturn = string.substring(0,indices[indices.length-1]);
			return toReturn;
		};
		
		var match = cursorLine.match(/[\w_.]+$/);
		if(match){
			var ch = match[0].charAt(0);
			if(ch.toUpperCase() === ch)
				match = cursorLine.toLowerCase().match(/(?:([\w$_]+)\.)?([\w$_]*)$/);
			else
				match = extractFunctionName(cursorLine.toLowerCase()).match(/(?:([\w$_]+)\.)?([\w$_]*)$/);
		}
		else
			match = extractFunctionName(cursorLine.toLowerCase()).match(/(?:([\w$_]+)\.)?([\w$_]*)$/);
		
	/*	if (match[2] || match[1]) {
			var tok = cm.getTokenAt({line: cur.line,
				ch: cur.ch - (match[1] ? match[2].length + 1 : 0)});
			if ((tok.type != "variable") || (tok.type != "property")) return null;
		}
*/
		var result = [], type, parent = null;
		function addFrom(obj) {
			forEach(obj, function(prop, val) {
				if (prop.slice(0, match[2].length).toLowerCase() == match[2]) {
					val.name = prop;
					result.push(val);
				}
			});
		}

		if (match[1]) {
			type = "method";
			indexNames = {} ;
			$.each(help,function(a,b){
				indexNames[a.toLowerCase()] = a ;
			});

			if (indexNames.hasOwnProperty(match[1])) {
				parent=match[1];
				addFrom(help[indexNames[match[1]]].functions);
			}
		} else {
			type = "toplevel";
			addFrom(help);
		}
		return {type: type, values: result, parent: parent};
	}

	function forEach(obj, fn) {
		for (var prop in obj) if (obj.hasOwnProperty(prop)) fn(prop, obj[prop]);
	}

	return {showHints: showHints, javascriptHint: javascriptHint};
}();