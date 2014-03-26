var table='1	1H	2			1	2	d	5	3	d	15\n';
table+='2	1H	2.02			1	3	d	3\n';
table+='3	1H	4			1';
//simulateNMRSpectrum(spinsystem, freq, from, to, lW,scale('HZ','PPM'), maxClustersize, nPoints)
var spectraData = SD.simulateNMRSpectrum(table,{from:0,to:10,nbPoints:1024});
SD.fourierTransform(spectraData);
jexport('spectrum',SD.toJcamp(spectraData,{encode:'DIFDUP',yfactor:100,type:"SIMPLE",keep:['']}));