package org.cheminfo.script.action;

import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.TinyURL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GetTinyURL extends Action {

    public void execute() {
    	try {
    		String baseURL=data.getServerURL()+data.request.getRequestURI().replaceAll("[^/]+$","Tiny");
	    	String url=data.getParameterAsString("url");
	    	JSONObject json=new JSONObject();
	    	if (url!=null && ! url.equals("")) {
	     		json.put("url", baseURL+"/"+TinyURL.create(url));
	    	} else {
	    		json.put("error", "Parameters 'url' is mandatory");
	    	}
	    	ServletUtilities.returnResponse(response,json.toString());
		} catch (JSONException e) {
	    	e.printStackTrace(System.out);
	    }
	}
}
