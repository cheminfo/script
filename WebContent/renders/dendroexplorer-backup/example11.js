



var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
	  //I'm setting this based on the fact that ExCanvas provides text support for IE
	  //and that as of today iPhone/iPad current text support is lame
	  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
	  nativeTextSupport = labelType == 'Native';
	  useGradients = nativeCanvasSupport;
	  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('log');
    this.elem.innerHTML = text;
    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};



function init(){
	if (!opener || !opener.result) return;
	var tree;
	var result=opener.result;
	for (var metaVar in result){
		if(result[metaVar].type == 'tree')
			tree=result[metaVar].value;
	}
	if (!tree) return;
	var json=tree;
    var id = 10000;
    var rgraph = new $jit.RGraph({
        injectInto: 'infovis',
		duration: 500,
		fps: 35,
		withLabels: true,
     	levelDistance: 50,
        //Optional: create a background canvas that plots
        //concentric circles.
        background: {
          CanvasStyles: {
            strokeStyle: '#555'
          }
        },
        //Add navigation capabilities:
        //zooming by scrolling and panning.
        Navigation: {
          enable: true,
          panning: true,
          zooming: 50
        },
        //Set Node and Edge styles.
        Node: {
        	overridable: true,
        	type: 'circleImg',
            color: '#ddeeff',
            dim: 10
        },
        
        Edge: {
          color: '#C17878',
          lineWidth:0.2
        },
        //Add node click handler and some styles.
        //This method is called only once for each node/label crated.
        onCreateLabel: function(domElement, node){
        	if(node.name)
        		domElement.innerHTML=node.name;
        	else
        		domElement.innerHTML=".";
		    if(node.getSubnodes(1).length == 0)
		    	domElement.innerHTML = "<b>O</b>";
	        domElement.onclick = function () {
	        	if(node.getSubnodes(1).length == 0){
	        		alert("Click on leaf");
	        	}
	        	else{
	        		rgraph.onClick(node.id, { 
	                   	hideLabels: false,
	                    	onComplete: function() {
	                       	 	Log.write("done");
	                    	}
	                     });
	        	}

            };
            var style = domElement.style;
            style.cursor = 'pointer';
            style.fontSize = "4em";
            style.color = node.data.color;
        },
 	 	Events: {  
 	 		enable: true,
 	 		enableForEdges: true,
			onDragEnd: function(node, eventInfo, e) { 
				return;
			},
			onRightClick: function(node, eventInfo, e) {
					//get node ids to be removed.  
   	 				var n = node;  
  	  				if(!n) return; 
 					pivote = node;
  	  				var subnodes = n.getSubnodes(1);  
  	  				var map = [];  
  	  				for (var i = 0; i < subnodes.length; i++) {  
  	  	    				map.push(subnodes[i].id);  
 	   				}  
 					var files = [];
					var children = [];
					node.eachSubgraph(function(node3) {  
  			 			var subtree = new Object();
  						if(node3.getSubnodes(1).length == 0){
  							id++;
  							subtree.id = id;
  							subtree.data = node3.data;
  							subtree.name = '';
  							children.push(subtree);
							files.push(node3.data.location+" "+node3.data.colorBatch);
							
  						}

					}); 
					//showSpectra(files);
					//perform node-removing animation.  
  	 	 			rgraph.op.removeNode(map.reverse(), {  
   		     			type: 'fade:seq',  
   		     			duration: 50,  
   		     			hideLabels: true  
  		  			}); 

 		   			for (var j = 0; j < children.length; j++) { 
 		       			rgraph.graph.addNode(children[j]);
 		 				rgraph.graph.addAdjacence(pivote, children[j]); 
 		   			} 
    
			}
			

    	},
  		
  		Tips: {
      		enable: true,
      		type: 'Native',
      		//add positioning offsets
      		offsetX: -20,
      		offsetY: -20,

      		//implement the onShow method to
      		//add content to the tooltip when a node
      		//is hovered
      		onShow: function(tip, node, isLeaf, domElement) {
      			var info=document.getElementById("info");
      			if (info) {
      				var information="";
      				for (var prop in node.data) {
      					var length=node.data[prop].length;
      					if (length>20) {
      						information+="<b>"+prop + "</b>: " + node.data[prop].substring(0,10)+"..."+node.data[prop].substring(length-10)+"<br>";
      					} else {
      						information+="<b>"+prop + "</b>: " + node.data[prop]+"<br>";
      					}
      			   }
      				info.innerHTML=information;
      				
      			}
      			// console.log(node.data);
      			/*
      		if(node.getSubnodes(1).length == 0){
        		var html = "<div class=\"tip-title\">"+node.data.label+"</div>";
        		}
        		else{
        			var html = "";
        		}
        	tip.innerHTML =  html; 
        	*/
      		}
      		
    	},
      
    	onBeforeCompute: function(node){
            Log.write("centering " + node.name + "...");
            //Add the relation list in the right column.
            //This list is taken from the data property of each JSON node.
            $jit.id('inner-details').innerHTML = node.data.relation;
        },
        
        onAfterCompute: function(){
            Log.write("done");
        }, 
        //Change some label dom properties.
        //This method is called each time a label is plotted.
        onPlaceLabel: function(domElement, node){
            var style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';

            if (node._depth <= 1) {
                style.fontSize = "0.1em";name:"";
            } else if(node._depth > 1 && node._depth <= 20){
                style.fontSize = "0.1em";
				if(node.getSubnodes(1).length == 0)
					style.color = "#"+node.data.colorBatch;
				else
			      style.color = "#00f";
            } else {
                style.display = 'none';
            }
        }
    });
    //load JSON data
    rgraph.loadJSON(json);
    //trigger small animation
    rgraph.graph.eachNode(function(n) {
      var pos = n.getPos();
      pos.setc(-200, -200);
    });
    
    var button = $jit.id('change');
    button.onclick = function() {
    	var node = rgraph.graph.getNode(rgraph.root);
		node.eachSubgraph(function(node) { 			 		
  					if(node.getSubnodes(1).length == 0){
  						var temp = node.data.image;
  						node.data.image = node.data.contrasted;
  						node.data.contrasted = temp;
  					}
				});
				rgraph.refresh();
    };
    
    /*
    var button = $jit.id('nodeType');
    button.onclick = function() {
    	rgraph.graph.getNode(rgraph.root);
		node.eachSubgraph(function(node) { 			 		
  					if(node.getSubnodes(1).length == 0){
  						var temp = node.data.image;
  						node.data.image = node.data.contrasted;
  						node.data.contrasted = temp;
  					}
				});
				rgraph.refresh();
    };
    */
    
    rgraph.compute('end');
    rgraph.fx.animate({
      modes:['linear'],
      duration: 0,
      fps: 35 
    });
    //end
    //append information about the root relations in the right column
    $jit.id('inner-details').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
    
}
