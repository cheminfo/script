 var homeDir="";
// fileURL has to be defined somewhere !!!!
 jexport("original",{type: "jpg", value:fileURL});



 var image = IJ.load(fileURL);
 var hsb = image.splitHSB();
 hsb[0].save(homeDir+"result/hue.jpg");
 hsb[1].save(homeDir+"result/saturation.jpg");
 hsb[2].save(homeDir+"result/brightness.jpg");

 var rgb = image.splitRGB();

 rgb[0].save(homeDir+"result/red.jpg");
 rgb[1].save(homeDir+"result/green.jpg");
 rgb[2].save(homeDir+"result/blue.jpg");
    
     
 var tmpImage = image.duplicate();
 tmpImage.contrast({});
 tmpImage.save(homeDir+"result/contrast.jpg");
     
 var tmpImage = image.duplicate();
 tmpImage.grey({});
 tmpImage.save(homeDir+"result/grey.jpg");

 var tmpImage = image.duplicate();
 tmpImage.edge();
 tmpImage.save(homeDir+"result/edge.jpg");

 var tmpImage = image.duplicate();
 tmpImage.texture();
 tmpImage.save(homeDir+"/result/texture.jpg");
 



 // We will take the content of the first folder and the same names should exists in all the other types !!!!

 var result=[];

 var files=dir(homeDir+"result",{filter:".*jpg$"});

 for (var i=0; i<files.length; i++) {
   var entry={};
   var name=files[i].replace(/.*\//,"");
   entry.name=name;

   var image=IJ.load(files[i]);
   entry.image={type:"jpeg", value:getReadFileURL(files[i])};


   var histogram={};
   var series=[];
   series[0]=image.histogram();
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
   entry.histogram={type:"chart", value:histogram};

   result.push(entry);
 }




 jexport("result",result);
                                 

                                 


 