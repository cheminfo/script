
function AcsFormatter(json) {
	this.json=json;
	this.acsString="";
	this.parenthesis="";
	this.spectro="";

	this.formatAcs=function () {
		if (this.json["spectraDisplay"]) {
			for (var i=0; i<this.json["spectraDisplay"].length; i++) {
				var spectraDisplay=this.json["spectraDisplay"][i];
				if (spectraDisplay.label=="mainDisplay") {
					if (spectraDisplay["spectra"]) {
						for (var j=0; j<spectraDisplay["spectra"].length; j++) {
							var spectra=spectraDisplay["spectra"][j];
							this.appendSeparator();
							if (spectra["type"]=="NMR SPEC") {
								if (spectra["nucleus"]=="1H") {
									this.formatAcs_default(spectra, false, 2, 1);
								} else if (spectra["nucleus"]=="13C") {
									this.formatAcs_default(spectra, false, 1, 0);
								}
							} else if (spectra["type"]=="IR") {
								this.formatAcs_default_IR(spectra, false, 0, true);
							} else if (spectra["type"]=="MASS") {
								this.formatAcs_default(spectra, false, 2);
							}
						}
					}
				}
			}
		}
		if (this.acsString.length>0) this.acsString+=".";
		return this.acsString;
	}

	this.formatAcs_default_IR=function(spectra, ascending, decimalValue, smw) {
		this.appendSeparator();
		this.appendSpectroInformation(spectra);
		if (spectra["peakLabels"]) {
			var numberPeakLabels=spectra["peakLabels"].length;
			var minIntensity= 9999999;
			var maxIntensity=-9999999;
			for (var i=0; i<numberPeakLabels; i++) {
				if (spectra["peakLabels"][i].intensity<minIntensity) minIntensity=spectra["peakLabels"][i].intensity;
				if (spectra["peakLabels"][i].intensity>maxIntensity) maxIntensity=spectra["peakLabels"][i].intensity;
			}
			for (var i=0; i<numberPeakLabels; i++) {
				if (ascending) {
					var peakLabel=spectra["peakLabels"][i];
				} else {
					var peakLabel=spectra["peakLabels"][numberPeakLabels-i-1];
				}
				if (peakLabel) {
					this.appendSeparator();
					this.appendValue(peakLabel,decimalValue);
					if (smw) { // we need to add small / medium / strong
						if (peakLabel.intensity<((maxIntensity-minIntensity)/3+minIntensity)) this.acsString+=" (s)";
						else if (peakLabel.intensity>(maxIntensity-(maxIntensity-minIntensity)/3)) this.acsString+=" (w)";
						else this.acsString+=" (m)";
					}
				}
			}			
		}
	}
	
	this.formatAcs_default=function(spectra, ascending, decimalValue, decimalJ) {
		this.appendSeparator();
		this.appendSpectroInformation(spectra);
		if (spectra["smartPeakLabels"]) {
			var numberSmartPeakLabels=spectra["smartPeakLabels"].length;
			for (var i=0; i<numberSmartPeakLabels; i++) {
				if (ascending) {
					var smartPeakLabel=spectra["smartPeakLabels"][i];
				} else {
					var smartPeakLabel=spectra["smartPeakLabels"][numberSmartPeakLabels-i-1];
				}
				if (smartPeakLabel) {
					this.appendSeparator();
					this.appendDelta(smartPeakLabel,decimalValue);
					this.appendParenthesis(smartPeakLabel,decimalJ);
				}
			}
		} else if (spectra["peakLabels"]) {
			var numberPeakLabels=spectra["peakLabels"].length;
			for (var i=0; i<numberPeakLabels; i++) {
				if (ascending) {
					var peakLabel=spectra["peakLabels"][i];
				} else {
					var peakLabel=spectra["peakLabels"][numberPeakLabels-i-1];
				}
				if (peakLabel) {
					this.appendSeparator();
					this.appendValue(peakLabel,decimalValue);
				}
			}			
		}
	}

	this.appendSpectroInformation=function(spectrum) {
		if (spectrum.type=="NMR SPEC") {
			if (spectrum.nucleus) {
				this.acsString+=this.formatNucleus(spectrum.nucleus);
			}
			this.acsString+=" NMR";
			if ((spectrum.solvent) || (spectrum.frequency)) {
				this.acsString+=" (";
				if (spectrum.frequency) {
					this.acsString+=(spectrum.frequency*1).toFixed(0)+" MHz";
					if (spectrum.solvent) this.acsString+=", ";
				}
				if (spectrum.solvent) {
					this.acsString+=this.formatMF(spectrum.solvent);
				}
				this.acsString+=")";
			}
			this.acsString+=" δ ";
		} else if (spectrum.type=="IR") {
			this.acsString+=" IR ";
		} else if (spectrum.type=="MASS") {
			this.acsString+=" MASS ";
		}
	}

	this.appendDelta=function(line, nbDecimal) {
		if (line.delta1) {
			if (line.delta2) {
				if (line.delta1<line.delta2) {
					this.acsString+=line.delta1.toFixed(nbDecimal)+"-"+line.delta2.toFixed(nbDecimal);
				} else {
					this.acsString+=line.delta2.toFixed(nbDecimal)+"-"+line.delta1.toFixed(nbDecimal);
				}
			} else {
				this.acsString+=line.delta1.toFixed(nbDecimal);
			}
		}
	}

	this.appendValue=function(line, nbDecimal) {
		if (line.xPosition) {
			this.acsString+=line.xPosition.toFixed(nbDecimal);
		}
	}
	
	this.appendParenthesis=function(line, nbDecimal) {
		// need to add assignment - coupling - integration
		this.parenthesis="";
		this.appendMultiplicity(line);
		this.appendIntegration(line);
		this.appendCoupling(line,nbDecimal);
		this.appendAssignment(line);
		
		
		if (this.parenthesis.length>0) {
			this.acsString+=" ("+this.parenthesis+")";
		}
	}

	this.appendIntegration=function(line) {
		if (line.pubIntegration) {
			this.appendParenthesisSeparator();
			this.parenthesis+=line.pubIntegration;
		} else if (line.integration) {
			this.appendParenthesisSeparator();
			this.parenthesis+=line.integration.toFixed(0)+" H";
		}
	}

	this.appendAssignment=function(line) {
		if (line.pubAssignment) {
			this.appendParenthesisSeparator();
			this.parenthesis+=this.formatAssignment(line.pubAssignment);
		}
	}

	this.appendMultiplicity=function(line) {
		if (line.pubMultiplicity) {
			this.appendParenthesisSeparator();
			this.parenthesis+=line.pubMultiplicity;
		} else if (line.multiplicity) {
			this.appendParenthesisSeparator();
			this.parenthesis+=line.multiplicity;
		}
	}

	this.appendCoupling=function(line, nbDecimal) {
		if (line.couplings) {
			var j="<i>J</i> = ";
			for (var i=0; i<line.couplings.length; i++) {
				var coupling=line.couplings[i];
				if (j.length>11) j+=", ";
				j+=coupling.value.toFixed(nbDecimal);
			}
			this.appendParenthesisSeparator();
			this.parenthesis+=j+" Hz";
		}

	}
	
	this.formatAssignment=function (assignment) {
		assignment=assignment.replace(/([0-9])/g,"<sub>$1</sub>");
		assignment=assignment.replace(/\"([^\"]*)\"/g,"<i>$1</i>");
		return assignment;
	}

	this.formatMF=function (mf) {
		mf=mf.replace(/([0-9])/g,"<sub>$1</sub>");
		return mf;
	}
	
	this.formatNucleus=function (nucleus) {
		nucleus=nucleus.replace(/([0-9])/g,"<sup>$1</sup>");
		return nucleus;
	}
	
	this.appendSeparator=function() {
		if ((this.acsString.length>0) && (! this.acsString.match(/ $/))) {
			this.acsString+=", ";
		}
	}

	this.appendParenthesisSeparator=function() {
		if ((this.parenthesis.length>0) && (! this.parenthesis.match(", $"))) this.parenthesis+=", ";
	}
	
}
