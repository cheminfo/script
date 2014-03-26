
function Nemo(appletID) {
	this.applet=appletID;
	this.title="";
	this.url="";		// the url of the first jcamp
	this.molURL="";
	this.firstLoad=true;
	this.spectrumCounter=0; // allows to create many new spectra
	
	// reset the applet to the initial jcamp
	this.reset=function() {
		this.applet.clearAll();
		this.addJcamp(this.url);
	}
	
	/*	
	1. load the spectrum
	2. load the molecule if available
	3. add parameters
	4. FT if not yet done
	5. Phase correction based on the parameter in file
	6. Auto baseline correction
	*/
	
	this.load=function() {
		if (this.molURL.length>10) {
			this.setMolfileFromURL(this.molURL);
		}
		if (this.url.length>10) {
			this.addJcamp(this.url);
			
			if (this.getFirstSpectrumType()=="NMR FID") {
				// this.applet.runScript("fourierTransform(spectraData);brukerPhase(spectraData);ABC(spectraData);");
			} else {
			
			}			
		}
		this.addParameters();
	}

	this.getFirstSpectrumType=function() {
		return this.applet.getFirstSpectrumType();
	}
	
	this.setTitle=function(title) {
		this.title=title;
	}

	this.setColor=function(color) {
		this.applet.setColor(color);
	}
	
	this.msFit=function() {
		this.applet.fitMassPrediction();
		return this.applet.getJSONResult();
	}
	
	this.addJcamp=function(url) {
		this.applet.addJcamp(url);
	}
	
	this.addSimulatedSpectrum=function(acsAssignment, resolution) {
		if (! resolution) resolution=1;
		this.applet.addSimulatedSpectrum(acsAssignment, resolution);
		this.setColor('red');
	}
	
	this.addJcampVertical=function(url) {
		this.applet.addJcampVertical(url);
	}
	
	this.getJcamp=function() {
		var spectraData=this.applet.getSpectraData();
		return spectraData.toJcamp();
	}
	
	this.getXY=function() {
		var spectraData=this.applet.getSpectraData();
		return spectraData.toXY();
	}
	
	this.addMolfile=function(molfile) {
		if (this.is2D()) {
			this.applet.setMolfile(130,60,200,200,molfile);
		} else {
			this.applet.setMolfile(20,160,200,200,molfile);
		}
	}

	this.setMolfile=function(molfile) {
		if (this.is2D()) {
			this.applet.setMolfile(130,60,200,200,molfile);
		} else {
			this.applet.setMolfile(20,160,200,200,molfile);
		}
	}	
	
	this.setMolfileFromURL=function(molURL) {
		var url=this.molURL;
		if (molURL) {
			url=molURL;
		}
		var currentObject=this;
		new Ajax.Request(url,
	              {     onSuccess: function(resp) {
	                       currentObject.setMolfile(resp.responseText);
	                      }
	              }
	      );
	}
	
	this.getXML=function() {
		return this.applet.getXML()+'';
	}
	
	this.getXMLView=function() {
		return this.applet.getXMLView()+'';
	}

	this.repaint=function() {
		return this.applet.repaint();
	}
	
	this.getXMLEmbedded=function() {
		return this.applet.getXMLEmbedded();
	}
	
	this.is2D=function() {
		return this.applet.is2D();
	}
	
	this.setXML=function(xml) {
		var location=window.location.href.replace(/\/\/([^\/]*)\/.*/,"//$1");
		var sessionid="";
        if (document.cookie.indexOf("JSESSIONID")>-1) {
        	sessionid=document.cookie.replace(/^.*JSESSIONID=([^&;]*).*$/,"$1");
        }
		xml=xml.replace(/https?:\/\/[^\/]*\/([^&]*)&ques;/,location+"/$1;jsessionid="+sessionid+"&ques;");
		this.applet.setXML(xml);
	}	
	
	this.setXMLView=function(xml) {
		this.applet.setXMLView(xml);
	}	
	
	this.getAssignmentString=function(format) {
		var jsonValue = this.applet.getJSON();;
		var json=eval('(' + jsonValue + ')');
		var acsFormatter=new AcsFormatter(json);
		return acsFormatter.formatAcs();
	}
	
	this.getAssignmentStringInWindow=function(format) {
		this.openWindow(this.getAssignmentString());
	}
	
	this.getIntegrals=function() {
		var jsonValue = this.applet.getJSON();;
		var json=eval('(' + jsonValue + ')');
		var integrals="";
		var table=[];
		var nbColumns=0;
		if (json["spectraDisplay"]) {
			for (var i=0; i<json["spectraDisplay"].length; i++) {
				var spectraDisplay=json["spectraDisplay"][i];
				if (spectraDisplay.label=="mainDisplay") {
					if (spectraDisplay["spectra"]) {
						// we currently don't allow many spectraDisplay for the integrals
						nbColumns=spectraDisplay["spectra"].length;
						for (var j=0; j<spectraDisplay["spectra"].length; j++) {
							var spectra=spectraDisplay["spectra"][j];
							// we need to take the integrals of all the spectra and to create tab-delimited file
							// we could check if the range is the same in all the spectra ?
							if (spectra["integrals"]) {
								var numberIntegrals=spectra["integrals"].length;
								for (var k=0; k<numberIntegrals; k++) {
									var startX=spectra["integrals"][k].startX;
									var stopX=spectra["integrals"][k].stopX;
									var area=spectra["integrals"][k].area;
									var intensity=spectra["integrals"][k].intensity;
									var found=false;
									for (var l=0; l<table.length; l++) {
										if ((table[l].startX==startX) && (table[l].stopX==stopX)) {
											table[l].areas[j]=area;
											found=true;
											break;
										}
									}
									if (! found) {
										var pos=table.length;
										table[pos]={};
										table[pos].startX=startX;
										table[pos].stopX=stopX;
										table[pos].areas=[];
										table[pos].areas[j]=area;
									}
								}
							}
						}
					}
				}
			}
		}

		integrals+="begin\tend";
		for (var i=0; i<nbColumns; i++) {
			integrals+="\tspectrum "+(i+1);
		}
		integrals+="\r\n";
		for (var i=0; i<table.length; i++) {
			integrals+=table[i].startX+"\t"+table[i].stopX;
			for (var j=0; j<nbColumns; j++) {
				if (table[i].areas[j]) {
					integrals+="\t"+table[i].areas[j];
				} else {
					integrals+="\t";
				}
			}
			integrals+="\r\n";
		}
		
		return integrals;
	}
	
	this.getJSON=function() {
		return this.applet.getJSON()+'';
	}
	
	this.openWindow=function(content) {
		testWindow=window.open('', '', 'width=800, height=150, resizable=1');
		testWindow.document.write("<html><head>");
		testWindow.document.write("<title>"+this.title+"</title>");
		testWindow.document.write("<link rel='stylesheet' type='text/css' href='/style.css'></head><body>");
		testWindow.document.write("<html><head><link rel='stylesheet' type='text/css' href='/style.css'></head><body>");
		testWindow.document.write("<h1>"+this.title+"</h1>");
		testWindow.document.write(content);
		testWindow.document.write("</body></html>");
		testWindow.document.close();
	}
	
	this.getNmrTable=function() {
		return this.applet.getNmrTable();
	}

	this.getNmrTableInWindow=function getNmrTableInWindow() {
		this.openWindow("<pre>"+this.getNmrTable()+"</pre>");
	}
	
	this.getHoseCodes4Assignment=function () {
		return this.applet.getHoseCodes4Assignment()+'';
	}
	
	this.vMoveSpectrum=function(move) {
		this.applet.vMoveSpectrum(move);
	}

	this.scaleSpectrum=function(scale) {
		this.applet.scaleSpectrum(scale);
	}
		
	this.setColor=function(color) {
		this.applet.setColor(color);
	}
	
	this.setIntegralsVisible=function(visibility) {
		this.applet.setIntegralsVisible(visibility);
	}

	this.setPeaksVisible=function(visibility) {
		this.applet.setPeaksVisible(visibility);
	}

	this.clearAll=function() {
		this.applet.clearAll();
	}

	this.setHeight=function(value) {
		this.applet.height=value;
	}
	
	this.setWidth=function(value) {
		this.applet.width=value;
	}
	
	this.addDMSO=function() {
		this.addSimulatedSpectrum("2.5 (s, DMSO), 3.33 (s, H2O), 1.91 (s, AcOH), 2.09 (s, Acetone), 2.07 (s, Acetonitrile), 1.11 (s, tBuOH), 2.18 (s, tBuOH), 8.32 (s, CDCl3), 1.4 (s, cyclohexane), 5.76 (s, CH2Cl2), 1.09 (s, Et2O), 3.38 (s, Et2O), 7.95 (s, DMF), 2.89 (s, DMF), 2.73 (s, DMF), 3.57 (s, Dioxane), 1.06 (s, EtOH), 3.44 (s, EtOH), 1.99 (s, AcOEt), 4.03 (s, AcOEt), 1.17 (s, AcOEt), 3.34 (s, EthyleneGlycol), 0.87 (s, Grease), 1.25 (s, Grease), 3.31 (s, MeOH), 1.04 (s, isoPropanol), 3.78 (s, isoPropanol), 8.58 (s, pyridine), 7.39 (s, Pyridine), 7.79 (s, pyridine), 0.29 (s, SiliconeGrease), 1.76 (s, THF), 3.6 (s, THF), 2.3 (s, toluene), 7.18 (s, toluene), 7.25 (s, toluene), 0.93 (s, Et3N), 2.43 (s, Et3N)");
		this.setIntegralsVisible(false);
		this.setColor('darkorange');
		this.scaleSpectrum(0.25);
		this.vMoveSpectrum(150);
	}
	
	this.addCDCl3=function() {
		this.addSimulatedSpectrum("7.26 (s, CHCl3), 1.56 (s, H2O), 2.10 (s, AcOH), 2.17 (s, Acetone), 2.10 (s, Acetonitrile), 1.28 (s, tBuOH), 1.43 (s, cyclohexane), 5.30 (s, CH2Cl2), 1.21 (s, Et2O), 3.48 (s, Et2O), 8.02 (s, DMF), 2.96 (s, DMF), 2.88 (s, DMF), 3.71 (s, Dioxane), 1.25 (s, EtOH), 3.72 (s, EtOH), 2.05 (s, AcOEt), 4.12 (s, AcOEt), 1.26 (s, AcOEt), 3.76 (s, EthyleneGlycol), 0.86 (s, Grease), 1.26 (s, Grease), 3.49 (s, MeOH), 1.22 (s, isoPropanol), 4.04 (s, isoPropanol), 8.62 (s, pyridine), 7.29 (s, Pyridine), 7.68 (s, pyridine), 0.07 (s, SiliconeGrease), 1.85 (s, THF), 3.76 (s, THF), 2.36 (s, toluene), 7.17 (s, toluene), 7.25 (s, toluene), 1.03 (s, Et3N), 2.53 (s, Et3N)");
		this.setIntegralsVisible(false);
		this.setColor('darkorange');
		this.scaleSpectrum(0.25);
		this.vMoveSpectrum(150);	
	}
	
	this.addRealSimlatedSpectrum=function(prediction, options) {
		var frequency=(options && options.frequency) ? options.frequency : 400000000;
		var from=(options && options.from) ? options.from : 0;
		var to=(options && options.to) ? options.to : 12;
		var lineWidth=(options && options.lineWidth) ? options.lineWidth : 1.5;
		var scale=(options && options.scale) ? options.scale : "PPM";
		var maxClusterSize=(options && options.maxClusterSize) ? options.maxClusterSize : 8;
		var spl=(options && options.spl) ? options.spl : false;
		
		this.spectrumCounter++;
		this.applet.createNewSpectrum('prediction'+this.spectrumCounter);
		this.applet.runScript('var spectraData=getSpectraData("prediction'+this.spectrumCounter+'")');
		this.applet.runScript('simulateNMRSpectrum(spectraData,"'+prediction.replace(/[\r]/g,"\\r").replace(/[\n]/g,"\\n")+'", '+frequency+', '+from+', '+to+', '+lineWidth+', "'+scale+'", '+maxClusterSize+');');
		this.applet.runScript('fourierTransform(spectraData);');
		this.applet.runScript('addNoise(spectraData,1000000);');
		this.applet.runScript('autoBaseline(spectraData);');
		this.applet.setColor('blue');
		if (spl==true) {
			this.applet.addSmartPeaksForSimulation(prediction,0,12,1.5,"PPM",8);
		}
	}
	
	this.setDefaultView=function() {
		var d=new Date;
		var day=d.getDate();
		var month=d.getMonth()+1;
		var year=d.getYear()+1900;
		var hour=d.getHours();
		var minutes=d.getMinutes();
		var seconds=d.getSeconds();
		var date=day+'/'+month+'/'+year+'_'+hour+':'+minutes+':'+seconds;
		var view='<nemo.SpectraDisplay uniqueID="1" bottomLimit="-1.3542422036036035E7" is2D="false" vScale="false" relWidth="2.0" primaryColor="255,0,0" nbLinks="0" movementType="3" leftLimit="9.999969" relY="0.0" relHeight="1.0" relX="0.0" topLimit="3.961018457417418E8" rightLimit="-0.9999276447804935" hScale="true" ><nemo.HorizontalScale nbLinks="0" uniqueID="2" ></nemo.HorizontalScale><nemo.VerticalScale nbLinks="0" uniqueID="3" ></nemo.VerticalScale><nemo.Spectra isSmooth="false" uniqueID="4" integralsBaseArea="0.0" magFactor="0.9" lastX="-0.9999276447804935" relHeight="0.925" isVertical="false" firstX="9.999969" secondaryColor="255,0,0" hasIntegrals="1" relWidth="1.0" relY="-0.03" integralsRelBottom="0.16281341582546402" nbLinks="0" relX="0.0" lowerContour="0.0" hasPeakLabels="1" is2D="0" primaryColor="0,0,0" integralsMagFactor="1.0" ><nemo.SpectraTextEntity relHeight="0.35" relWidth="0.3947826086956522" relY="0.05" relX="0.01" relFontSize="0.14814814814814814" entityText="TimePrinted:'+
				date+
				'&lf;title:{TITLE}&lf;user:{$USER}&lf;filename:{$NAME}/{$EXPNO}&lf;pulprog:{$PULPROG}&lf;solvent:{$SOLVENT}&lf;NS:{$NS}&lf;Frequency:{$BF1}MHz" ></nemo.SpectraTextEntity></nemo.Spectra></nemo.SpectraDisplay>';
		this.setXMLView(view);
	}
	
	this.isNMR=function() {
		if ((this.applet.getFirstSpectrumType()+"").indexOf("NMR")>-1) {
			return true;
		} else {
			return false;
		}
	}
	
	this.isMass=function() {
		if ((this.applet.getFirstSpectrumType()+"").indexOf("MASS")>-1) {
			return true;
		} else {
			return false;
		}
	}
	
	this.addParameters=function() {
		var d=new Date;
		var day=d.getDate();
		var month=d.getMonth()+1;
		var year=d.getYear()+1900;
		var hour=d.getHours();
		var minutes=d.getMinutes();
		var seconds=d.getSeconds();
		var date=day+'/'+month+'/'+year+'_'+hour+':'+minutes+':'+seconds;
		var text="TimePrinted:"+date+"\r\ntitle:{TITLE}\r\nuser:{$USER}";
		if (this.isNMR()) {
			text+="\r\nfilename:{$NAME}/{$EXPNO}\r\npulprog:{$PULPROG}\r\nsolvent:{$SOLVENT}\r\nNS:{$NS}\r\nFrequency:{$BF1}MHz";
		}
		if (this.is2D()) {
			this.applet.addText(-110,-80,200,150,text);
		} else {
			this.applet.addText(10,10,200,150,text);
		}
	}
	
	this.addPrediction=function(prediction) {
		this.applet.addPrediction(prediction);
	}
	
	this.setPrediction=function(prediction) {
		this.applet.setPrediction(prediction);
	}
	
	this.runScript=function(script){
        return this.applet.runScript(script);
	}
		
	this.addXY=function(xy) {
		var lines=xy.split(/[\r\n]+/);
		var firstX;
		var lastX;
		var firstY;
		var lastY;
		var fields;
		var buf = [];
		var k=0;

		for (var i=0; i<lines.length; i++) {
			fields=lines[i].split(/[\t ,]+/);
			if (fields.length>1) {
				if ((!firstX) || (firstX>(fields[0]*1))) {
					firstX=fields[0]*1;
				}
				if ((!lastX) || (lastX<(fields[0]*1))) {
					lastX=fields[0]*1;
				}
				if ((!firstY) || (firstY>(fields[1]*1))) {
					firstY=fields[1]*1;
				}
				if ((!lastY) || (lastY<(fields[1]*1))) {
					lastY=fields[1]*1;
				}
			}
			buf[k]=(fields[0]*1)+"\t"+(fields[1]*1)+"\r";
			k++;
		}
		
		var header="";
		header+="##TITLE=\r";
		header+="##JCAMP-DX=4.24\r";
		header+="##DATA TYPE=NMR SPECTRUM\r";
		header+="##ORIGIN=\r";
		header+="##XUNITS=\r";
		header+="##YUNITS=\r";
		header+="##FIRSTX="+firstX+"\r";
		header+="##LASTX="+lastX+"\r";
		header+="##FIRSTY="+firstY+"\r";
		header+="##LASTY="+lastY+"\r";
		header+="##NPOINTS="+lines.length+"\r";
		header+="##PEAK TABLE=(XY..XY)\r";
		
		this.applet.addJcamp(header+buf.join(''));
	}
	
	this.canonizeMolfile=function(molfile){
         return this.applet.canonizeMolfile(molfile);
	}
		
	
};
