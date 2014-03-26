clearLog();
var list=['id=5568337&key=pXC0Fa7F2U','id=5568223&key=xfSsj9VRGu','id=5568166&key=T3i7SO4KY5','id=5568110&key=yTKfgZOvlO','id=5568108&key=83aCuRNuaD','id=5568099&key=cdKhiiv44c','id=5568098&key=FiVFhnXKMn','id=5568096&key=3X0LRXYGaU','id=5568095&key=Q2Cwjm0ohK','id=5568089&key=GJXXfguJ6D','id=5568088&key=WlkwknkOdC','id=5568087&key=ZBqsRvqWsu','id=5568081&key=6BJEZI7O8u','id=5568080&key=1WeaihEbyF','id=5568079&key=mm02INIQfk','id=5568046&key=egpD6lV5zi','id=5568041&key=Z0F2CvTG7G','id=5568032&key=ruFsM0u48K','id=5568031&key=mHdGuWPoum','id=5568025&key=6FRq4vsilI','id=5568018&key=SqFLCcDhpB','id=5568015&key=E4yssd1Gfw','id=5568008&key=xRBl3MKDBa','id=5568007&key=4g0q2BkbHr'];
//path to the simulated spectra
var url='http://clo1v2.mylims.org/lims/Lims?action=GetResource&table=nmr&column=resource&';
var urls = new Array();
var ind=0;
var spectrum;
var nMol = list.length;
var labels=new Array(nMol);
var spectraData=new Array(nMol);
for(var mol=0;mol<nMol;mol++){
	urls[mol]=url+list[mol];
	spectrum=SD.loadJCamp(urls[mol]);
	spectraData[mol]=spectrum.getEquallySpacedDataInt(3, 5, 1024);
    // Those spectra has an anti-phase peak that crash the system
    //Defining a manual traceshold
    for(var i=1;i<1024;i++){
      if(spectraData[mol][i]<=spectraData[mol][0])
       spectraData[mol][i]=0;
      else
        spectraData[mol][i]-=spectraData[mol][0];
    }
    spectraData[mol][0]=0;
}

//Creating the similarity matrix
var similarity = new Array(nMol);
for (var i=0;i<nMol;i++) {
	similarity[i]=new Array(nMol);
}

//Calculating similarities...
for (var i=0;i<nMol;i++) {
	for (var j=i;j<nMol;j++) {
      similarity[i][j]=1-Distance.treeSimilarity(spectraData[i],spectraData[j]);
	  //similarity[i][j]=1;
      similarity[j][i]=similarity[i][j];
	}
}

//Labels depending on the molecule		
var labels=new Array(nMol);
var cont=0;
for(var mol=0;mol<nMol;mol++){
	//for(var i=0;i<11;i++){
		labels[mol]=list[mol]+'_'+i+'\t'+list[mol]+'\t'+urls[mol];
	//}
}

//Create the dendrogram	
var dendrogram = Distance.clustering(similarity,labels);
//Return to the client the JSON of the dendrogram
jexport('dendrogram',dendrogram,'dendrogram'); 
jexport('distance',similarity,'matrix');