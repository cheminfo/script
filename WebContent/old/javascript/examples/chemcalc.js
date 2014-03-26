//ChemCalc.function(Molecular formula: String, options:JSONObject, result: JSONArray)
var info=ChemCalc.analyzeMF("C10H12", {});

//When using ChemCalc, you will get Java Object
var mfArray=ChemCalc.mfFromMonoisotopicMass(300.123, {});
jexport('javaObject',mfArray.get(0));

//When using chemcalc, you will get javascript Objects
var mfArray=chemcalc.mfFromMonoisotopicMass(300.123, {});
jexport('jsObject',mfArray[0]);


var XYdata=ChemCalc.getXY("C100", {});

var calMassPattern=ChemCalc.getJcamp('C8H9NO2', {});
var spectraData = SD.loadJCamp(calMassPattern);
Nemo.plotSpectraData(spectraData,'spectraData'+i);
//To see with the spectrum  button
jexport('spectrum',calMassPattern,'jcamp',{color:"#00FFF0"});