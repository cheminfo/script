 var homeDir="";
// fileURL has to be defined somewhere !!!!

 jexport("original",{type: "jpg", value:fileURL});

 var types=["color","red","green","blue","hue","saturation","brightness","contrast","grey","edge","texture"];

 if (true) {
   var image = IJ.load(fileURL);
   var hsb = image.splitHSB();
   var mask=hsb[2].createMask({method:"Li"});
   var split = image.split(mask,{minLength:100, sortBy:"xy"});
   var sizeS = split.length;
   
   for (var i = 0; i < sizeS; i++) {
     var newName=i+".jpg";
     var rgb = split[i].splitRGB();
     rgb[0].save(homeDir+"red/"+newName, "{quality:100}");
     rgb[1].save(homeDir+"green/"+newName, "{quality:100}");
     rgb[2].save(homeDir+"blue/"+newName, "{quality:100}");
    
     var hsb = split[i].splitHSB();
     hsb[0].save(homeDir+"hue/"+newName, "{quality:100}");
     hsb[1].save(homeDir+"saturation/"+newName, "{quality:100}");
     hsb[2].save(homeDir+"brightness/"+newName, "{quality:100}");

     var tmpImage = split[i].duplicate();
     tmpImage.save(homeDir+"color/"+newName, "{quality:100}");
     
     var tmpImage = split[i].duplicate();
     tmpImage.contrast({});
     tmpImage.save(homeDir+"contrast/"+newName, "{quality:100}");
     
     var tmpImage = split[i].duplicate();
     tmpImage.grey({});
     tmpImage.save(homeDir+"grey/"+newName, "{quality:100}");

     var tmpImage = split[i].duplicate();
     tmpImage.edge();
     tmpImage.save(homeDir+"edge/"+newName, "{quality:100}");

     
     var tmpImage = split[i].duplicate();
     tmpImage.texture();
     tmpImage.save(homeDir+"texture/"+newName, "{quality:100}");
   }
 }



 // We will take the content of the first folder and the same names should exists in all the other types !!!!

 var result=[];

 var type=types[i];
 var files=dir(homeDir+types[0],{filter:".*jpg$"});

 for (var i=0; i<files.length; i++) {
   var entry={};
   var name=files[i].replace(/.*\//,"");
   entry.name=name;
   for (var j=0; j<types.length; j++) {
     var type=types[j];
     var fullname=homeDir+type+"/"+name;
     var image=IJ.load(fullname);
     entry[type]={};
     entry[type].fullname=fullname;
     entry[type].image={type:"jpeg", value:getReadFileURL(fullname)};


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
     histogram.serieLabels=[type];
     entry[type].histogram={type:"chart", value:histogram};

   }
   result.push(entry);
 }




 jexport("result",result);
                                 


 