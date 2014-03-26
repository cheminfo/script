var INPUT_FILE='/Users/acastillo/scripttest/mol13C.txt';
var NSpectra=5;
var molfile = getUrlContent('file://'+INPUT_FILE);
var prediction = SD.spinusPred1H(molfile);
var parameters = SD.SSMutator(prediction,molfile,NSpectra,{'nucleus':'1H','shiftdev':0.2,'jdev':0});
parameters.put(0,prediction);
for(var i=0;i<NSpectra;i++){
 var spectraData= SD.simulateNMRSpectrum(parameters.get(i),400e6,0,10,1.5,"PPM",9,16384);
 SD.fourierTransform(spectraData);
 Nemo.plotSpectraData(spectraData,'spectraData'+i);
 //spectraData.putParam('##prediction',escape(parameters.get(i)));
 //spectraData.putParam('##molfile',escape(molfile));
 //spectraData.putParam('##sample',i);
 //nmrs[i]={'nucleus':'1H','resourceMimeType':'chemical/x-jcamp-dx'};
 //nmrs[i].resource=SD.toJcamp(spectraData,'DIFDUP',0.01,'SIMPLE',['##prediction','##molfile','##sample']);
 //params[i]={"description":'1H_'+i,"value":parameters.get(i)};
}
//newEntry.entry.nmr=nmrs;
//newEntry.entry.parameter=params;
//jexport('entry',newEntry);