package org.cheminfo.script.action;

import java.io.File;

import org.cheminfo.script.utility.ServletUtilities;


public class ListScript extends Action {

    public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
	
			String optionsList = "";
			File dir = new File(homeDir);
			String[] files = dir.list();
	
			if (files == null) {
				System.out.println("Directory does not exist or is not a Directory: "+homeDir);
			} else {
				for (int i=0; i<files.length; i++) {
					optionsList += files[i]+"\r";
				}
			}
	    	
	    	ServletUtilities.returnResponse(response,optionsList);
		}
	}
}
