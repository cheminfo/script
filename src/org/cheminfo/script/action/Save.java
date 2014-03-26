package org.cheminfo.script.action;

import java.util.Date;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;

public class Save extends Action {
	
	public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			String filename=data.getParameterAsString("filename");
			filename=FileTreatment.updateFilenameFields(filename);
			String content=data.getParameterAsString("content");
			if (FileTreatment.isInFolder(filename, homeDir)) {
				boolean ok=FileTreatment.save(content,homeDir+filename);
				if (ok) {
					ServletUtilities.returnResult(response,"Save successful");
				} else {
					ServletUtilities.returnError(response,"Save failed");
				}
			} else {
				ServletUtilities.returnError(response,"Security problem: no access");
			}
		}
	}
}
	
