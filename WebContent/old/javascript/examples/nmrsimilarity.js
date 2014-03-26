A='00003';
B='00179';

//path to the simulated spectra
var spA=new Array();
var spB=new Array();
var labels=new Array();
var spectraData=new Array();
var url='http://localhost:8080/servletScript/spectra/1H/';
var urls = new Array();
var ind=0;
for(var i=0;i<10;i++){
	//Store an array representation of the spectrum in a vector
	urls[ind]=url+A+'/spinus_'+i+'.jdx';
	spA[i]=SD.loadJCamp(urls[ind]);
	spectraData[ind++]=spA[i].getEquallySpacedDataInt(0, 10, 1024);
}

for(var i=0;i<10;i++){
	urls[ind]=url+B+'/spinus_'+i+'.jdx';
	spB[i]=SD.loadJCamp(urls[ind]);
	spectraData[ind++]=spB[i].getEquallySpacedDataInt(0, 10, 1024);
}

//Creating the similarity matrix
var similarity = new Array();
for (var i=0;i<ind;i=i+1) {
	similarity[i]=new Array();
}
//Calculating similarities...
for (var i=0;i<ind;i=i+1) {
	for (var j=i;j<ind;j=j+1) {
		similarity[i][j]=1-Distance.treeSimilarity(spectraData[i],spectraData[j]);
		similarity[j][i]=similarity[i][j];
	}
}

//Labels depending on the molecule		
var labels=new Array(ind);
var cont=0;
for(var i=0;i<10;i++){
	labels[cont]=A+'_'+i+'\t'+A+'\t'+urls[cont++];
}
for(var i=0;i<10;i++){
	labels[cont]=B+'_'+i+'\t'+B+'\t'+urls[cont++];
}

//Create the dendrogram	
var dendrogram = Distance.clustering(similarity,labels);
//Return to the client the JSON of the dendrogram
jexport('dendrogram',dendrogram,'dendrogram'); 
jexport('distance',similarity,'matrix');