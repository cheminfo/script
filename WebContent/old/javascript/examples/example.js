var url='http://mastersearch.chemexper.com/cheminfo/servlet/org.dbcreator.MainServlet?action=SendFieldAction&tableName=ir&fieldName=jcamp&uniqueIDValue=';
var ids=['10071','10756','10450','10245','10293','10330','10030','10458','10676','10697','10824','10924','10953','11002','11014','11046'];
var i=0,j,k,nPoints=1024;
var spectraDatas={};
var filter={};

for(i=0;i<ids.length;i++){
	var spectraData=SD.loadJCamp(url+ids[i]);
	var spectraData2=SD.loadJCamp(url+ids[i]);

	var funcSize=Math.floor(spectraData.getNbPoints()*0.0575);
				
	var func=new Array(funcSize);
	for(k=funcSize-1;k>=0;k--){
		func[k]=1.0/funcSize;
	}

	spectraDatas2=SD.correlationFilter(spectraData2,func,getDebug());
	var y1 = spectraData.getSpectraDataY();
	var y2 = spectraData2.getSpectraDataY();
	for( k=y1.length-1;k>=0;k--)
		y1[k]=y1[k]-y2[k];
	spectraDatas[i]=spectraData.getEquallySpacedDataInt(649.893372, 4000.12232, nPoints);
}


var similarity = new Array();
for (i=0;i<ids.length;i=i+1) {
	similarity[i]=new Array();
}
for (i=0;i<ids.length;i=i+1) {
	for (j=i;j<ids.length;j=j+1) {
		similarity[i][j]=Distance.areaOverlap(spectraDatas[i],spectraDatas[j]);
		similarity[j][i]=similarity[i][j];
	}
}
		
var labels=new Array(ids.length);
for (i=0;i<ids.length;i=i+1) {
	labels[i]=ids[i]+'	'+ids[i%2]+'	'+(url+ids[i]);
}
		
var dendrogram = Distance.clustering(similarity,labels);
jexport('dendrogram',dendrogram);

var matrix ='';
for (var i=0;i<similarity.length-1;i=i+1) {
	matrix+='['+similarity[i].join(",")+'],';
}
matrix+='['+similarity[similarity.length-1].join(",")+']';
jexport('matrix',matrix);