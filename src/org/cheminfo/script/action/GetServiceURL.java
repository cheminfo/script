package org.cheminfo.script.action;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.TinyURL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GetServiceURL extends Action {

    public void execute() {
    	try {
    		String baseURL=data.getServerURL()+data.request.getRequestURI().replaceAll("[^/]+$","Service");
	    	String scriptFilename=data.getParameterAsString("scriptFilename");
	    	
			if (FileTreatment.isInFolder(scriptFilename, homeDir)) {
		    	JSONObject json=new JSONObject();
		    	if (scriptFilename!=null && ! scriptFilename.equals("")) {
		     		json.put("url", baseURL+"/"+TinyURL.create(this.homeDir+scriptFilename));
		    	} else {
		    		json.put("error", "Parameters 'scriptFilename' is mandatory");
		    	}
		    	ServletUtilities.returnResponse(response,json.toString());
			}
		} catch (JSONException e) {
	    	e.printStackTrace(System.out);
	    }
	}
}
