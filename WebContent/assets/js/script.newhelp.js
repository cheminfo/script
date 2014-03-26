var HELP = function(){

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

	function searchInObject(word,object){
		var values = [] ;
		$.each(object,function(libName,contentLib){
			if(libName.slice(0,word.length).toLowerCase() == word.toLowerCase()){
				contentLib.name = libName ;
				contentLib.full = (libName.toLowerCase() == word.toLowerCase()) ;
				values.push(contentLib);
			}
		});

		if(values.length == 1)
			values[0].full = true ;
		values.sort(function(a,b){return a.name.localeCompare(b.name);});
		return values ;
	}

	function completionsForString(stringToSearch){

		//stringToSearch = stringToSearch.toLowerCase() ;
		var values = {libs:[],functions:[]} ;

		var searchIn = help ;
		var split = stringToSearch.split(".");
		var searchedWord = split[split.length-1] ;

		$.each(split,function(id,name){
			if(id == split.length-1)
				return ;

			var indexNamesSearchIn = {} ;
			if(searchIn.lib){
				$.each(searchIn.lib,function(a,b){
					indexNamesSearchIn[a.toLowerCase()] = a ;
				});
			}

			if(searchIn.lib && indexNamesSearchIn[name.toLowerCase()]){
				searchIn = searchIn.lib[indexNamesSearchIn[name.toLowerCase()]] ;
			}else{
				searchIn = {} ;
			}

		});

		if(searchIn.lib){
			values.libs = searchInObject(searchedWord,searchIn.lib);
		}

		if(searchIn.functions){
			values.functions = searchInObject(searchedWord,searchIn.functions) ;
		}

		return {values:values, searchLength: searchedWord.length, numberFound:values.libs.length+values.functions.length} ;
	}

	function completionsFor(cm){
		var cur = cm.getCursor();
		var line = cm.getLine(cur.line);
		var cursorLine = line.slice(0, cur.ch);
		var match = cursorLine.match(/[\w_.]+$/);

		if(match){
			var ch = match[0].charAt(0);
			if(ch.toUpperCase() === ch)
				match = cursorLine.match(/(?:([\w$_]+)\.)*([\w$_]*)$/);
			else
				match = extractFunctionName(cursorLine).match(/[\w_.]+$/);
		}else
			match = extractFunctionName(cursorLine).match(/[\w_.]+$/);

		if(match)
			match = match[0] ;
		else
			match = "" ;


		return completionsForString(match) ;

	}

	var javascriptHint = function (cm){

		var gen = CodeMirror.javascriptHint(cm);
		var extra = completionsFor(cm).values;

		gen.list = [] ;

		if (extra) {

			if(extra.libs){
				$.each(extra.libs,function(a,b){
					gen.list.push(b.name);
				});
			}

			if(extra.functions){
				$.each(extra.functions,function(a,b){
					if(b.usage)
						gen.list.push(b.usage);
					else
						gen.list.push(b.name);
				});
			}

		}
		return gen ;
	};

	var showHints = function (cm, div){
		var comp = completionsFor(cm) ;

		if(comp.numberFound==0) {
			server.getHint(cm, function(data){
				var resultLength = data.list.length;
				$.each(data.list,function(a,b){
					var fullName = b.data.fullName;
					var split = fullName.split(".");
					var obj=help;
					var l = split.length-1;
					try{
						for(var i=0 ; i<l; i++){
							obj=obj.lib[split[i]];
						}
						var name = split[l];
						if(name=="prototype") return;
						if (b.data.type.indexOf("fn(")===0) {
							if(obj.functions[name] == undefined)
								return;
							var objToAdd = obj.functions[name];
							if(resultLength===1) objToAdd.full=true;
							comp.values.functions.push(objToAdd);
						} else  {
							if(obj.lib[name] == undefined)
								return;
							comp.values.libs.push(obj.functions[name]);
						}
					} catch(e) {}
				});
				
			});
		}
		
		div.html("") ;
		$.each(comp.values.libs,function(i,obj){
			div.append(displayObject(obj,{type:"lib", length:comp.searchLength}));
		});
		$.each(comp.values.functions,function(i,obj){
			div.append(displayObject(obj,{type:"func", length:comp.searchLength}));
		});

	};
	
	var clickFunctionName = function(event) {
		$cm.replaceRange(event.data.text,$cm.getCursor());
		$cm.focus();
	};

	function displayObject(obj,options){
		
		options = options ? options : {};
		
		blockObj = $('<div>').addClass("");

		var title = "" ;
		if(obj.full && obj.usage)
			title = obj.usage ;
		else if(obj.name)
			title = obj.name ;
		
		if(obj.parentName && options.useFullName)
			title = obj.parentName+"."+title;

		var cmClick="";
		if(options.type == "lib")
			cmClick = (title+".").substring(options.length);
		else if(options.type == "func")
			cmClick = obj.usage.substring(options.length);
		else if(options.type == "full")
			cmClick = obj.parentName+"."+obj.usage;
			

		blockObj.append($('<div>').addClass("title").addClass("object-title").html(title).click({text:cmClick},clickFunctionName)) ;

		if(obj.short) blockObj.append($('<div>').addClass("short").html(obj.short)) ;

		if(obj.full){

			if(obj.long) blockObj.append($('<div>').addClass("long").html(obj.long)) ;

			fields = ['parameters','options','returns','examples'] ;

			$.each(fields,function(a,b){
				if(obj[b]) {
					var title = b ;
					title = title.charAt(0).toUpperCase() + title.slice(1);
					blockObj.append(displayField(appendField(obj[b]),title,b));
				}
			});

			if(obj.links)
				blockObj.append(displayField(appendLinks(obj.links),"Links","links"));
			
			if(obj.wikipedia)
				blockObj.append(displayField(appendWiki(obj.wikipedia),"Wikipedia","wikipedia"));

			obj.full = false;
		}

		return blockObj ;
	}

	function displayField(obj,name,className){
		b = $('<div>').addClass(className) ;
		b.append($('<div>').html(name).addClass("title")) ;
		b.append(obj) ;
		return b ;
	}

	function appendField(obj) {
		r = $('<ul>');
		$.each(obj, function(name, desc) {
			r.append($('<li>').html(function(){
				if (typeof desc == "string") {
					text = desc ;
					if(name != desc)
						text = "<b>"+name+":</b> " + text ;
					return $('<span>').addClass('value').html(text);
				} else
					return appendField(desc);
			})) ;
		});
		return r ;
	}
	
	function appendLinks(obj){
		r = $('<ul>') ;
		$.each(obj, function(link, label) {
			r.append($('<li>').html(
				function(){
					return $('<a>',{'class':'link','href':link, 'target': '_blank'}).html(label);
				}
			));

		});
		return r ;
	}

	function appendWiki(obj){
		r = $('<ul>') ;
		$.each(obj, function(link, label) {
			r.append(
				$('<li>').html(
					function(){
						var iframe = null ;
						return $('<a>',{'class':'link','href':link}).html(label).on("click",function(){
							$('<div>').html(
									function(){
										iframe = $('<iframe>',{
											src:link + "?printable=yes"
										});
										return iframe ;
									}
							).dialog({
								title:label,
								//modal:true,
								width:$(window).width()*0.9,
								open:function(){
									iframe.css({
										border:0,
										'width':"100%",
										"height":"99%",
										margin : 0
									}) ;
								},
								height:$(window).height()*0.9
							});
							return false ;
						}) ;
					}
				)
			);

		});
		return r ;
	}
	
	var searchInHelp = function(toSearch){
		toSearch=toSearch.toLowerCase();
		var results=[];
		loop1: for(var i=0; i<searchableHelp.length; i++){
			var currentValue=searchableHelp[i];
			for(var j=0; j<currentValue.searchString.length; j++){
				if(currentValue.searchString[j].indexOf(toSearch)>-1){
					results.push({index: j, value:currentValue});
					continue loop1;
				}
			}
		}
		results.sort(function(a,b){
			return((a.index-b.index)*100+a.value.searchString[0].localeCompare(b.value.searchString[0]));
		});
		return results;
	};
	
	var showSearch = function(searchString, div) {
		div.html("") ;
		
		if(searchString.length==0)return;
		var searchResult=searchInHelp(searchString);
		
		$.each(searchResult,function(i,obj){
			obj.value.value.full=(searchResult.length===1);
			div.append(displayObject(obj.value.value, {useFullName:true, type:"full"}));
		});
	};

	return {showHints: showHints, javascriptHint: javascriptHint, showSearch:showSearch};

}() ;