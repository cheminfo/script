function createDendrogram(json, options) {
	options=options||{};
	options.nodeSize=options.nodeSize||2;
	options.nodeColor=options.nodeColor||"orange";
    var id = 10000;
    var rgraph = new $jit.RGraph({
        injectInto: options.targetDiv,
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
        	type: 'circle'
        },
        
        Edge: {
          color: '#C17878',
          lineWidth:0.5
        },
        //Add node click handler and some styles.
        //This method is called only once for each node/label crated.
        onCreateLabel: function(domElement, node){
        	if (node.getSubnodes(1).length == 0) {
        		if (options.endNodeLabel) {
        			domElement.innerHTML=options.endNodeLabel(node);
        		} else if (options.nodeLabel) {
        			domElement.innerHTML=options.nodeLabel(node);
        		}
        	} else {
        		 if (options.nodeLabel) {
        			 domElement.innerHTML=options.nodeLabel(node);
        		 }
        	}
        	if (options.labelStyle) {
        		options.labelStyle(domElement.style, node);
        	}
        },
        onBeforePlotNode: function(node) {
            node.Node.color=options.nodeColor;
            node.Node.dim=options.nodeSize;
        	if (node.getSubnodes(1).length == 0) {
        		if (options.endNodeStyle) {
        			options.endNodeStyle(node);
        		} else if (options.nodeStyle) {
        			options.nodeStyle(node);
        		}
        	} else {
        		if (options.nodeStyle) {
        			options.nodeStyle(node);
        		}
        	}
        },
        //Change some label dom properties.
        //This method is called each time a label is plotted.
        onPlaceLabel: function(domElement, node){


        	/*
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
            */
        },
 	 	Events: {  
 	 		enable: true,
 	 		enableForEdges: true,
//		    type: 'auto',
//		    onClick: function(node, eventInfo, e) {},
//		    onRightClick: function(node, eventInfo, e) {},
//		    onMouseMove: function(node, eventInfo, e) {},
		    onMouseEnter: function(node, eventInfo, e) {
		    	if (options.nodeEnter) options.nodeEnter(node);
		    },
		    onMouseLeave: function(node, eventInfo, e) {
		    	if (options.nodeLeave) options.nodeLeave(node);
		    },
//		    onDragStart: function(node, eventInfo, e) {},
//		    onDragMove: function(node, eventInfo, e) {},
//		    onDragCancel: function(node, eventInfo, e) {},
//		    onDragEnd: function(node, eventInfo, e) {},
//		    onTouchStart: function(node, eventInfo, e) {},
//		    onTouchMove: function(node, eventInfo, e) {},
//		    onTouchEnd: function(node, eventInfo, e) {},
//		    onTouchCancel: function(node, eventInfo, e) {},
//		    onMouseWheel:function(node, eventInfo, e) {},
    	},
  		
  		Tips: {
      		enable: false,
     	},
      
    	onBeforeCompute: function(node){
            // Log.write("centering " + node.name + "...");
            //Add the relation list in the right column.
            //This list is taken from the data property of each JSON node.
            $jit.id('inner-details').innerHTML = node.data.relation;
        },
        
        onAfterCompute: function(){
            // Log.write("done");
        }
    });
    
    //load JSON data
    rgraph.loadJSON(json);
    rgraph.compute('end');
    rgraph.fx.animate({
      modes:['linear'],
      duration: 0,
      fps: 35 
    });
    //end    
}

