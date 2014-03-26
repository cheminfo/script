var spectraData = SD.loadJCamp('http://localhost:8080/servletScript/spectra/dupinc1.jdx');
jexport('spectrum',SD.toJcamp(spectraData,'DIFDUP',100000,'SIMPLE'));