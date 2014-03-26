package org.cheminfo.script.action;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class FileManagerOld extends Action {

	
    public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
	
	    	String target=data.getParameterAsNonNullString("target");
	    	String action=data.getParameterAsNonNullString("event");
	    	
	    	String name=data.getParameterAsNonNullString("name");
	    	String path=homeDir;
	    	
	    	if (DEBUG) System.out.println("FileManager OLD: action: "+action);
	    	if (DEBUG) System.out.println("FileManager OLD: path: "+path+name);
	    	
	    	try {
	    	
		    	JSONObject json=new JSONObject();
		    	
		    	
		    	if (action.equals("save")) {
		    		String content=data.getParameterAsNonNullString("content");
		    		name=FileTreatment.updateFilenameFields(name);
		    		if (FileTreatment.save(content,path+name)) {
		    			json.put("result","Save successful");
		    		} else {
		    			json.put("error", "Save as "+name+" failed");
		    		}	    		
		    	} else if (action.equals("delete")) {
		    		if (FileTreatment.deleteFile(path+name)) {
		    			json.put("result","Delete successful");
		    		} else {
		    			json.put("error", "Delete "+name+" failed");
		    		}
		    	} else if (action.equals("deleteFolder")) {
		    		if (FileTreatment.deleteFolder(path+name)) {
		    			json.put("result","Delete folder successful");
		    		} else {
		    			json.put("error", "Delete folder "+name+" failed");
		    		}
		    	} else if (action.equals("rename")) {
		    		String newName=data.getParameterAsNonNullString("newName");
		    		if (!newName.equals("")) {
			    		if (FileTreatment.renameFile(path+name,path+newName)) {
			    			json.put("result","Rename successful");
			    		} else {
			    			json.put("error", "Rename "+name+" failed");
			    		}
		    		} else {
		    			json.put("error", "Rename "+name+" failed, the newName may not be null");
		    		}
		    	} else if (action.equals("createFolder")) {
		    		if (FileTreatment.createFolder(path+name)) {
		    			json.put("result","Create folder successful");
		    		} else {
		    			json.put("error", "Create folder "+name+" failed");
		    		}
		    	} else if (action.equals("list")) {
		    		JSONArray list=new JSONArray();
		    		if (FileTreatment.dirAsJSON(path+name, list)) {
		    			json.put("result",list);
		    		} else {
		    			json.put("error", "List folder content "+name+" failed");
		    		}
		    		
		    	} else if (action.equals("fullList")) {
		    		JSONArray list=new JSONArray();
		    		if (FileTreatment.resursiveDirAsJSON(path+name, list)) {
		    			json.put("result",list);
		    		} else {
		    			json.put("error", "List folder content "+name+" failed");
		    		}
		    		
		    	} else if (action.equals("load")) {
		    		ServletUtilities.returnResponse(response,FileTreatment.readFile(path+name));
		    		return;
		    	} else {
		    		json.put("error", "Event unknown: "+action);
		    	}
		    	ServletUtilities.returnResponse(response,json.toString());
	    	} catch (JSONException e) {
				// TODO Auto-generated catch block
	    		ServletUtilities.returnResponse(response,e.toString());
			}
		}
	}
}
