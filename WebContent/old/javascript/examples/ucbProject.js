function sort2D(a,b){
	return a[1]-b[1];
}
clearLog();
// We predict the spectra for those molecular formula.
var mfs=['C15H10ClNO','C16H14FNO','C14H11N3OS','C14H8ClFN2O2','C14H8F2N2OS',
		'C16H13N3OS','C16H12N4OS','C17H12N2O4','C16H12N2O3S','C17H20N4O2',
		'C14H10N4O3S','C16H14N2O3S','C15H12N2O3S2','C17H21ClN4O','C13H8BrN3OS',
		'C12H7BrN4OS','C17H11N3O3S','C19H19N3OS','C17H11FN4OS',
		'C16H11N5O3S','C19H19N3O2S','C20H20FN3OS','C17H22F3N5O','C17H16N2O4S2',
		'C20H20F3NO3','C22H25N3OS','C18H18N2O4S2','C21H24Cl2N2O','C27H30N4O2'];

//var url1='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.001&mf=';
//var url1='http://localhost:8080/servletScript/spectra/jcamp/';
var url1='http://isicsrv5.epfl.ch/jcamp?resolution=0.001&mf=H';
getJcamp
var mfsLength = mfs.length;
var predictions = new Array();
var experimental = new Array();
var dataXY = new Array();
var dataInfo = new Array();
//Those are the calculated patterns
for (var i=0;i<mfsLength;i++){
	predictions[i]=SD.loadJCamp(ChemCalc.getJcamp('H'+mfs[i], {}));
	dataXY[i]=predictions[i].getXYData();
	var info={"url":''+mfs[i],"label":mfs[i]};
	info.mass=predictions[i].getParamDouble('$Monoisotopic mass',0);
	info.weight=predictions[i].getParamDouble('$Molecular weight',0);
	info.resolution=predictions[i].getParamDouble('$Resolution',0);
	dataInfo[i]=info;
} 

//var listoffiles=Default.getUrlContent('http://localhost:8080/servletScript/javascript/examples/listoffiles.txt',null);
var listoffiles=Default.getUrlContent('http://isicsrv5.epfl.ch/servletScript/javascript/examples/listoffiles.txt',null);

//out.println(listoffiles);

var files = listoffiles.split(',');
var expLength = files.length;
var dataExpXY = new Array();
var dataExpInfo = new Array();
//var url2='http://localhost:8080/servletScript/spectra/mass/';
var url2='http://isicsrv5.epfl.ch/servletScript/spectra/mass/';
//Those are the experimental experiments.
for (var i=0;i<expLength;i++){
	experimental[i]=SD.loadJCamp(url2+files[i]);
	dataExpXY[i]=experimental[i].getXYData();
	var info ={"url":''+files[i],"label":''+files[i],"peakid":experimental[i].getParamDouble('$Peak ID',0)};
	info.time=experimental[i].getParamDouble('$Time',0);
	info.tic=experimental[i].getParamDouble('$TIC',0);
	info.bpi=experimental[i].getParamDouble('$BPI',0);
	info.bpm=experimental[i].getParamDouble('$BPM',0);
	info.sample=experimental[i].getParamDouble('$Sample',0);
	info.filename=''+experimental[i].getParamString('$FileName',"");
	info.sampledes=''+experimental[i].getParamString('$SampleDescription',"");
	dataExpInfo[i]=info;
}

//Calculating the similarity between each pair of predicted and experimental spectra
var similarity = new Array();
for (var i=0;i<expLength;i=i+1)
	similarity[i]=new Array();

for (var i=0;i<expLength;i=i+1){
	for (var j=0;j<mfsLength;j=j+1){
		similarity[i][j]=1-Distance.areaOverlap2(dataExpXY[i],dataXY[j],0.01,0.001,false);
	}
}


//Analyzing the results
var table = new Array(expLength);

//Column labels
var head = [{label:'jcamp'},{label:'File'},{label:'Description'},{label:'Formula 1'},{label:'Expected Mass 1'},
        	{label:'Observed Mass 1'},{label:'Time 1'},{label:'Error PPM 1'},{label:'Purity 1'},{label:'Similarity'}];

var yLabel=new Array(expLength);

var tableRow=0;
//for(var i=0;i<mfsLength;i++){
for (var j=0;j<expLength;j=j+1){
	var myCol = new Array();
	for(var k=0;k<mfsLength;k++)
		myCol[k]=[k,similarity[j][k]];
	myCol.sort(sort2D);
	colIndex=myCol[0][0];
	//dataInfo[i].row=row;
	
	//Calculating the TIC sum
	//var sample = dataExpInfo[row].sample;
	var sample = dataExpInfo[j].sample;
	var ticSum=0;
	for (var k=0;k<expLength;k=k+1)
		if(dataExpInfo[k].sample==sample)
			ticSum+=dataExpInfo[k].tic;
	
	//Getting the biggest peak in the calculated pattern
	var max = predictions[colIndex].getMaxY(),ind=-1;
	while(predictions[colIndex].getY(++ind)!=max);
	var x = predictions[colIndex].getX(ind);
	
	//For each experiment of the best matching element create a new row
	//for (var j=0;j<expLength;j=j+1){
	//for(var i=0;i<mfsLength;i++){
		//if(dataExpInfo[j].sample==sample){
			//**Determining the observed mass**//
			//Getting the closest peak in the experimental pattern.
			var min =Math.abs(x-experimental[j].getX(0));
			var diff=min,lastInd=0;
			ind=1;
			while(min==diff){
				if(experimental[j].getY(ind)>experimental[j].getY(0)){
					diff=Math.abs(x-experimental[j].getX(ind));
					if(diff<min){
						min=diff;
						lastInd=ind;
					}
				}
				ind++;
			}
			rowValues=new Array(9);
			rowValues[0]=''+dataExpInfo[j].filename;
			rowValues[1]=''+dataExpInfo[j].sampledes;
			rowValues[2]=''+dataInfo[colIndex].label;
			rowValues[3]=dataInfo[colIndex].mass;
			rowValues[4]=experimental[j].getX(lastInd);
			rowValues[5]=dataExpInfo[j].time;
			rowValues[6]=(1e6*(rowValues[3]-rowValues[4])
					/rowValues[3]).toFixed(3);
			rowValues[7]=''+((dataExpInfo[j].tic/ticSum)*100).toFixed(0)+'%';
			rowValues[8]=(1-similarity[j][colIndex]).toFixed(3);
			
			yLabel[tableRow]={'label':dataExpInfo[j].label};
			yLabel[tableRow].experimental=dataExpInfo[j];
			yLabel[tableRow].theoretical=dataInfo[colIndex];
			
			var numColor=Math.floor(255-(1-similarity[j][row])*128);
	        numColor=numColor.toString(16);
	        if(j%2==0)
	        	yLabel[tableRow].color='#'+numColor+'FFFF';
			else
				yLabel[tableRow].color='#FFFF'+numColor;
	        
	        table[tableRow++]=rowValues;
		//}
	//}
}

var showInfo=function(row,column){
	var exp=yLabel.value[row].experimental;
	var the=yLabel.value[row].theoretical;
	right.innerHTML='tic: '+exp.tic;
	right.innerHTML+='<br>bpi: '+exp.bpi+'<br>bpm: '+exp.bpm;
	right.innerHTML+='<br>time: '+exp.time;
	left.innerHTML='rslt: '+the.resolution+'<br>Mass: '+the.mass;
	left.innerHTML+='<br>Weight: '+the.weight;
};

var options={
	     'xLabel':{'value':head},
	     'yLabel':{'value':yLabel,'baseUrlExp':url2,'baseUrlThe':url1},
	     'events':[{'event':'onMouseOver','action':'showInfo='+showInfo.toString()}]
       };

jexport('report',table,'matrix',options);
jexport('distance',similarity,'matrix');