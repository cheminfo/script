// We search for all possible molecular formula in a specific range
 
var mfs=[];
var mfRange="C0-30H0-60N0-5O0-10F0-3Cl0-3";
var monoisotopicMass=300;
var massRange=0.5;
var currentLimit=10;
 
var mfFinder=Default.getUrlContent("http://www.chemcalc.org/service?action=em2mf&monoisotopicMass="+monoisotopicMass+"&mfRange="+mfRange+"&action=em2mf&massRange="+massRange,null);
var results=eval("("+mfFinder+")").results;
for (var i=0; i<results.length && i<currentLimit; i++) {
	mfs[i]=results[i].mf;
}
 
var mfsLength=mfs.length;
 
// we generate the different spectra and in this case for a gaussian filter
 
var url1='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.001&mf=';
var url2='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.004&mf=';
var url3='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.007&mf=';
var url4='http://www.chemcalc.org/cheminfo/servlet/org.chemcalc.ChemCalc?resolution=0.010&mf=';
var firstX=monoisotopicMass-50;
var lastX=monoisotopicMass+50;
var nPoints=16*1024;
var predictions = new Array();
var spectraArray = new Array();
var ind=0;
for (var i=0;i<mfsLength;i=i+1) {
	predictions[ind++]=SD.loadJCamp(url1+mfs[i]);
	predictions[ind++]=SD.loadJCamp(url2+mfs[i]);
	predictions[ind++]=SD.loadJCamp(url3+mfs[i]);
	predictions[ind++]=SD.loadJCamp(url4+mfs[i]);
}

var dataXY = new Array();

for(var i=0;i<mfsLength*4;i++)
    dataXY[i]=predictions[i].getXYData();


//Calculating the similarity between each pair of spectra
var similarity = new Array();
for (var i=0;i<mfsLength*4;i=i+1) {
	similarity[i]=new Array();
}
for (var i=0;i<mfsLength*4;i=i+1) {
	for (j=i;j<mfsLength*4;j=j+1) {
		//similarity[i][j]=1.0001-Distance.correlation(dataXY[i],dataXY[j],1,1,false);
		//areaOverlap2: Parameters 2 and 3 are the base of each triangle in each spectrum.
		//The third parameter say if we must fit the spectrum before compute the 
		//similarity(For experimental VS. theoretical spectra)
		similarity[i][j]=1-Distance.areaOverlap2(dataXY[i],dataXY[j],0.5,0.5,false);
		similarity[j][i]=similarity[i][j];
	}
}


//Labels depending on the batch	
var nSpectraXBatch=4;
var labels=new Array(currentLimit*nSpectraXBatch);

var ind=0,i=0,j=0;
for(i=1;i<=currentLimit;i++){
		labels[ind++]=mfs[i-1]+'-'+0.001+'\t'+mfs[i-1]+'\t'+url1+mfs[i-1];
		labels[ind++]=mfs[i-1]+'-'+0.004+'\t'+mfs[i-1]+'\t'+url2+mfs[i-1];
		labels[ind++]=mfs[i-1]+'-'+0.007+'\t'+mfs[i-1]+'\t'+url3+mfs[i-1];
		labels[ind++]=mfs[i-1]+'-'+0.010+'\t'+mfs[i-1]+'\t'+url4+mfs[i-1];
}

var dendrogram = Distance.clustering(similarity,labels);
jexport('dendrogram',dendrogram); 

var matrix ='';
for (var i=0;i<similarity.length-1;i=i+1) {
	matrix+='['+similarity[i].join(",")+'],';
}
matrix+='['+similarity[similarity.length-1].join(",")+']';
jexport('matrix',matrix);