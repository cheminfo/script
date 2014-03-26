 var homeDir="";
// fileURL has to be defined somewhere !!!!

 jexport("original",{type: "jpg", value:fileURL});



 var xs=[0.000000128,0.00000064,0.0000032,0.000016,0.00008,0.0004,0.002,0.01];

 var ys=[];

 for (var i=0; i<xs.length; i++) {
 	xs[i]=Math.log(xs[i]) / Math.LN10;
 }


 var results={};
 var process=[];
 results.process=process;

 if (true) {

   var image = IJ.load(fileURL);
   
   var rgb = image.splitRGB();
   for (var i=0; i<rgb.length; i++) {
     rgb[i].save(homeDir+"process/RGB-"+i+".png");
   }
   process.push({name:"red",image:{type:"png",value:getReadFileURL(homeDir+"process/RGB-0.png")}}); 
   process.push({name:"green",image:{type:"png",value:getReadFileURL(homeDir+"process/RGB-1.png")}});
   process.push({name:"blue",image:{type:"png",value:getReadFileURL(homeDir+"process/RGB-2.png")}});
   
   
   var hsb = image.splitHSB();
   for (var i=0; i<hsb.length; i++) {
     hsb[i].save(homeDir+"process/HSB-"+i+".png");
   }
   process.push({name:"hue",image:{type:"png",value:getReadFileURL(homeDir+"process/HSB-0.png")}});
   process.push({name:"saturation",image:{type:"png",value:getReadFileURL(homeDir+"process/HSB-1.png")}});
   process.push({name:"brightness",image:{type:"png",value:getReadFileURL(homeDir+"process/HSB-2.png")}});

   var mask=hsb[2].createMask({method:"Li"});
   mask.save(homeDir+"process/mask.png");
   process.push({name:"mask",image:{type:"png",value:getReadFileURL(homeDir+"process/mask.png")}});

   
   var painted=image.paintMask(mask);
   painted.save(homeDir+"process/painted.png");
   process.push({name:"painted",image:{type:"png",value:getReadFileURL(homeDir+"process/painted.png")}});

   
   var rois=mask.getRois({minLength:100, sortBy:"xy", scale: 1});
   var stats=image.analyze(rois);
   var reds=rgb[0].analyze(rois);
   var greens=rgb[1].analyze(rois);
   var blues=rgb[2].analyze(rois);
   
   // we get the brighness because it looks nice to split the image
   var split = image.split(mask,{minLength:100, sortBy:"xy"});

   results.ratio=[];
   
   results.split=[];
   for (var i=0; i<split.length; i++) {
     split[i].save(homeDir+"process/split-"+i+".png");
     var entry={};
     entry.stats=stats[i];
     entry.red=getHistogram("red",reds[i].histogram);
     entry.green=getHistogram("green",greens[i].histogram);
     entry.blue=getHistogram("blue",blues[i].histogram);
     entry.redValue=getColorValue(reds[i].histogram);
     entry.blueValue=getColorValue(blues[i].histogram);
     entry.greenValue=getColorValue(greens[i].histogram);
     entry.image={type:"png",value:getReadFileURL(homeDir+"process/split-"+i+".png")};
     entry.ratio=entry.blueValue/entry.redValue;
     results.split.push(entry);
     
     results.ratio[i]=entry.blueValue/entry.redValue;
     ys[i]=results.ratio[i];
   }
   
   results.report=getHistogram("Report",results.ratio);
 }

 // should we invert the values ?
 var length=ys.length-1;
 if (ys[0]>ys[length]) {
   for (var i=0; i<(length/2); i++) {
     var tmp=ys[i];
     ys[i]=ys[length-i];
     ys[length-i]=tmp;
   }
 }
 
 
 var ic50=Optimizer.sigmoid(xs, ys);
 ic50.concentration=Math.pow(10,ic50.center);
 appendIC50Chart(ic50);
 jexport("ic50",ic50);


 jexport("result",results);



 function getColorValue(values) {
   var total=0;
   var number=0;
   for (var i=0; i<values.length; i++) {
     total+=values[i]*i;
     number+=values[i];
   }
   return total/number;
 }

 function getHistogram(name, values) {
   var histogram={};
   var series=[];
   series[0]=values;
   histogram.series=series;
   var x=[];
   for (var k=0;k<series[0].length;k++) {
     x[k]=k; 
   }
   histogram.x=x;
   histogram.xAxis={'label':'Slot'};
   histogram.yAxis={'label':'Population'};
   histogram.title="Histogram distribution";
   histogram.serieLabels=[name];
   return {type:"chart", value:histogram};
 }

 function appendIC50Chart(ic50) {
   var size=ic50.fct.xs.length
   var chart={};
   var series=[];
   series[0]=ic50.fct.ys;
   chart.series=series;
   chart.x=ic50.fct.xs;
   // we will also add the original points
   series[1]=[];
   for (var i=0; i<size; i++) {
     series[1][i]=0;
   }
  
   for (var i=0; i<ic50.points.xs.length; i++) {
     chart.x[i+size]=ic50.points.xs[i];
     series[1][i+size]=ic50.points.ys[i];
     series[0][i+size]=0;
   }
   
   
   chart.xAxis={'label':'Log([])'};
   chart.yAxis={'label':'Ratio'};
   chart.title="IC50";
   chart.serieLabels=["Calculated","Experimental"];
   ic50.chart={type:"chart", value:chart};
 }


 