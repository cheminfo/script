package org.cheminfo.script.action;

import java.io.OutputStream;

import org.apache.commons.io.IOUtils;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;

public class Load extends Action {

    public void execute() {
		String filename=data.getParameterAsString("filename");
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			if (FileTreatment.isInFolder(filename, homeDir)) {
				if (FileTreatment.pathExists(homeDir+filename)) {
					ServletUtilities.returnResult(response,FileTreatment.readFile(homeDir+filename));
				} else {
					ServletUtilities.returnError(response,"File does not exists");
				}
			} else {
				ServletUtilities.returnError(response,"Security problem: no access");
			}
		}
    }
}
