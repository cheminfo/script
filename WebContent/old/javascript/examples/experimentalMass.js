// We predict the spectra for those molecular formula.
var mfs=['C15H10ClNO','C16H14FNO','C14H11N3OS','C14H8ClFN2O2','C14H8F2N2OS',
		'C16H13N3OS','C16H12N4OS','C17H12N2O4','C16H12N2O3S','C17H20N4O2',
		'C14H10N4O3S','C16H14N2O3S','C15H12N2O3S2','C17H21ClN4O','C13H8BrN3OS',
		'C12H7BrN4OS','C17H11N3O3S','C19H19N3OS','C17H11FN4OS',
		'C16H11N5O3S','C19H19N3O2S','C20H20FN3OS','C17H22F3N5O','C17H16N2O4S2',
		'C20H20F3NO3','C22H25N3OS','C18H18N2O4S2','C21H24Cl2N2O','C27H30N4O2'];

//var url1='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.001&mf=';
var url1='http://localhost:8080/servletScript/spectra/jcamp/';
var mfsLength = mfs.length;
var predictions = new Array();
var experimental = new Array();
var dataXY = new Array();
var dataInfo = new Array();
for (var i=0;i<mfsLength;i++){
	predictions[i]=SD.loadJCamp(url1+mfs[i]);
	dataXY[i]=predictions[i].getXYData();
	var info={"url":url1+mfs[i],"label":mfs[i]};
	info.mass=predictions[i].getParamDouble('$Monoisotopic mass',0);
	info.weight=predictions[i].getParamDouble('$Molecular weight',0);
	info.resolution=predictions[i].getParamDouble('$Resolution',0);
	dataInfo[i]=info;
} 

var listoffiles=Default.getUrlContent('http://localhost:8080/servletScript/javascript/examples/listoffiles.txt',null);

//out.println(listoffiles);

var files = listoffiles.split(',');
var expLength = files.length;
var dataExpXY = new Array();
var dataExpInfo = new Array();
var url2='http://localhost:8080/servletScript/spectra/mass/';
for (var i=0;i<expLength;i++){
	experimental[i]=SD.loadJCamp(url2+files[i]);
	dataExpXY[i]=experimental[i].getXYData();
	var info ={"url":url2+files[i],"label":''+files[i],"peakid":experimental[i].getParamDouble('$Peak ID',0)};
	info.time=experimental[i].getParamDouble('$Time',0);
	info.tic=experimental[i].getParamDouble('$TIC',0);
	info.bpi=experimental[i].getParamDouble('$BPI',0);
	info.bpm=experimental[i].getParamDouble('$BPM',0);
	info.filename=''+experimental[i].getParamString('$FileName',"");
	info.sampledes=''+experimental[i].getParamString('$SampleDescription',"");
	dataExpInfo[i]=info;
}

//Calculating the similarity between each pair of predicted and experimental spectra
var similarity = new Array();
for (var i=0;i<expLength;i=i+1)
	similarity[i]=new Array();


for (var i=0;i<expLength;i=i+1)
	for (var j=0;j<mfsLength;j=j+1)
		similarity[i][j]=1-Distance.areaOverlap2(dataExpXY[i],dataXY[j],0.01,0.001,false);

jexport('matrix',join(similarity,','));
jexport('infoCols',join(dataInfo,','));
jexport('infoRows',join(dataExpInfo,','));