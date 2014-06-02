package org.cheminfo.script.action;


import org.cheminfo.script.utility.ServletUtilities;
import org.json.JSONObject;

public class RunService extends RunScript {
	
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
