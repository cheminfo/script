package org.cheminfo.script.action;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;

public class DeleteDir extends Action {

	public void execute() {
		String filename=data.getParameterAsString("filename");
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			if (FileTreatment.isInFolder(filename, homeDir)) {
				if (FileTreatment.pathExists(homeDir+filename)) {
					boolean ok=FileTreatment.deleteFolder(homeDir+filename);
					if (ok) {
						ServletUtilities.returnResult(response,"Delete successful");
					} else {
						ServletUtilities.returnError(response,"Delete failed");
					}
				} else {
					ServletUtilities.returnError(response,"File does not exists");
				}
			} else {
				ServletUtilities.returnError(response,"Security problem: no access");
			}
		}
	}
}