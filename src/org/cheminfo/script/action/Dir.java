package org.cheminfo.script.action;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Dir extends Action {

    public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			String path=data.getParameterAsString("path");
			if (path==null) path=".";
			String filter=data.getParameterAsString("filter");
			if (FileTreatment.isInFolder(path, homeDir)) {
				JSONArray list=URLFileManager.dirAsJSON(homeDir+path, this.data.request.getRequestURL().toString(), filter, true);
	    		if (list!=null) {
	    			ServletUtilities.returnResult(response,list);
	    		} else {
	    			ServletUtilities.returnError(response, "List folder content "+path+" failed");
	    		}
			} else {
				ServletUtilities.returnError(response,"Security problem: no access");
			}
		}
	}
}
