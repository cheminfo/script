function pad(n, len) {
	s = n.toString();
	if (s.length < len) {
		s = ('00000' + s).slice(-len);
	}
	return s;
}

var HOME_DIR = '/Users/acastillo/Documents/dataset/output';
var folder="";
var prediction;
var parameters;
var NSpectra=0;
for(var i=0;i<100;i++){
	folder=HOME_DIR+"/"+pad(i,5);
	var molfile = getUrlContent('file://'+folder+'/mol2d_canonized.mol');
	//If folder exist
	if(molfile.substr(0,7)!='java.io'){
		out.println(folder);
		prediction = SD.spinusPred1H(molfile);
		parameters = SD.SSMutator(prediction,molfile,NSpectra,{'nucleus':'1H','shiftdev':0.2,'jdev':1});
		parameters.put(0,prediction);
		for(var k=0;k<NSpectra;k++){
			var spectraData= SD.simulateNMRSpectrum(parameters.get(k),400e6,0,12,1.5,"PPM",9,16384);
			SD.fourierTransform(spectraData);
			//Nemo.plotSpectraData(spectraData,'spectraData'+i);
			spectraData.putParam('##prediction',escape(parameters.get(k)));
			//spectraData.putParam('##molfile',escape(molfile));
			spectraData.putParam('##sample',k);
			var fh = openOutputFile(folder+'/spectrum_'+k+'.dx'); 
			fh.println(SD.toJcamp(spectraData,'DIFDUP',0.01,'SIMPLE',['##prediction','##sample'])); 
			closeOutputFile(fh);
		}
	}
}