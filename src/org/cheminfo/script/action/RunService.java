package org.cheminfo.script.action;


import java.util.HashMap;

import javax.servlet.ServletContext;

import org.cheminfo.function.scripting.ScriptingInstance;
import org.cheminfo.script.sse.SSEOutputs;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONException;
import org.json.JSONObject;

public class RunService extends RunScript {
	
	private static boolean DEBUG=false;

	String script="";
	
    public void execute() {
    	try {
	    	String initScript = "";
	    	JSONObject form=new JSONObject();
	    	for (String key : data.getKeySet()) {
	    		form.put(key, data.getParameterAsString(key));
	    	}
	    	initScript="var form="+form.toString()+";";
	    	
	    	String currentDir = "/";
	    	String resultBranch = "Master";
	    	String viewBranch="Master";
	    	String description = "";
	    			    

	    	runScript(initScript, script, currentDir, resultBranch, viewBranch, description, RESULT_ONLY, true);
	    	
    	} catch (Exception e) {
    		ServletUtilities.returnError(response, e.toString());
	    	e.printStackTrace(System.out);
    	}
	}
    
    public void setScript(String script) {
    	this.script=script;
    }
    
}
