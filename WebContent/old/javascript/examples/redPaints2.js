//Red paints clustering based on IR spectra
//*****************************************************************************************************************
//* The application of chemometrics on Infrared and Raman spectra as a tool for the forensic analysis of paints.  *
//*****************************************************************************************************************/
var url='http://isicsrv5.epfl.ch/IR_data/redPaints/';
var ids={};
var i=0,j,k,nPoints=1024,ind=0;
var spectraDatas={};
var filter={};
var nBatchs = 34;
var nSpectraXBatch = 5;
//Loading and pre-processing of the IR spectra
for(i=1;i<=nBatchs;i++){
	for(j=1;j<=nSpectraXBatch;j++){
		var spName=url+i+"_"+j+".JDX";
		if(i<10)
		    spName=url+"0"+i+"_"+j+".JDX";
		ids[ind]=spName;
	
		//We load the spectrum from the URL
		var spectraData=SD.loadJCamp(spName);
		var spectraData2=SD.loadJCamp(spName);

		var funcSize=Math.floor(spectraData.getNbPoints()*0.0575);
				
		var func=new Array(funcSize);
		for(k=funcSize-1;k>=0;k--){
			func[k]=1.0/funcSize;
		}
		//Base-Line correction
		spectraDatas2=SD.correlationFilter(spectraData2,func);
		var y1 = spectraData.getSpectraDataY();
		var y2 = spectraData2.getSpectraDataY();
		for( k=y1.length-1;k>=0;k--)
		    y1[k]=y1[k]-y2[k];
		//Store an array representation of the spectrum in a vector
		spectraDatas[ind++]=spectraData.getEquallySpacedDataInt(649.893372, 4000.12232, nPoints);
	}
	
}
//Creating the similarity matrix
var similarity = new Array();
for (i=0;i<ind;i=i+1) {
	similarity[i]=new Array();
}
//Calculating similarities...
for (i=0;i<ind;i=i+1) {
	for (j=i;j<ind;j=j+1) {
		similarity[i][j]=1-Distance.areaOverlap(spectraDatas[i],spectraDatas[j]);
		similarity[j][i]=similarity[i][j];
	}
}


//Labels depending on the batch of paint		
var labels=new Array(ind);
/*ind=0;
for(i=1;i<=nBatchs;i++){
	for(j=1;j<=nSpectraXBatch;j++){
                var label = "00"+Math.pow(i,3)+'\t00'+Math.pow(i,3)+'\t'+ids[ind];
		labels[ind]=label;
                ind++;
	}
}*/

//Labels depending on the chemical properties
var acrylic = new Array(15,1,2,17,19,25,20,26,14);
var acrylicStyrene = new Array(4,13,16);
var acrylicCalciumCarbonate = new Array(6,7,8,28);
var orthophathalic = new Array(3,18,5,11,27,29,33,34);
var orthophathalicMS = new Array(1);
orthophathalicMS[0]=30;
var orthophathalicCC = new Array(10,31,9,21,24,32);
var orthophathalicMSCC=new Array(12,22,23);

var batch = acrylic;
var idBatch = 'AC';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}
batch = acrylicStyrene;
idBatch = 'ACS';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}


batch = acrylicCalciumCarbonate;
idBatch = 'ACCC';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}

batch = orthophathalic;
idBatch = 'ORT';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}

batch = orthophathalicMS;
idBatch = 'ORTMS';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}

batch = orthophathalicCC;
idBatch = 'ORTCC';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}

batch = orthophathalicMSCC;
idBatch = 'ORTMSCC';
for(i=0;i<batch.length;i++){
	for(j=0;j<nSpectraXBatch;j++){
		var label = idBatch+'\t'+idBatch+'\t'+ids[(batch[i]-1)*nSpectraXBatch+j];
		labels[(batch[i]-1)*nSpectraXBatch+j]=label;
	}
}

//Create the dendrogram	
var dendrogram = Distance.clustering(similarity,labels);
//Return to the client the JSON of the dendrogram
jexport('dendrogram',dendrogram); 
//Return to the client the similarity matrix
var matrix ='';
for (var i=0;i<similarity.length-1;i=i+1) {
	matrix+='['+similarity[i].join(",")+'],';
}
matrix+='['+similarity[similarity.length-1].join(",")+']';
jexport('matrix',matrix);
