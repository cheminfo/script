package org.cheminfo.script.action;

import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class FileManager extends Action {

    public void execute() {
    	try {
	    	JSONObject json=new JSONObject();
			if (homeDir==null) {
				json.put("error", "Undefined path");   
			} else {
				String event=data.getParameterAsNonNullString("event");
				String name=data.getParameterAsNonNullString("name").replaceAll("/$", "");
			
				if (! FileTreatment.isInFolder(name, homeDir)) {
					json.put("error", "Access to "+name+" denied");
				} else {
					if (event.equals("delete")) {
						if (FileTreatment.deleteFile(homeDir+name)) {
							json.put("result","Delete successful");
						} else {
							json.put("error", "Delete "+name+" failed");
						}
					} else if (event.equals("deleteFolder")) {
						if (FileTreatment.deleteFolder(homeDir+name)) {
							json.put("result","Delete folder successful");
						} else {
							json.put("error", "Delete folder "+name+" failed");
						}
					} else if (event.equals("rename")) {
						String newName=data.getParameterAsNonNullString("newName");
						if (! FileTreatment.isInFolder(name, homeDir)) {
							json.put("error", "Access to "+name+" denied");
						} else if (! FileTreatment.isInFolder(newName, homeDir)) {
							json.put("error", "Access to "+newName+" denied");
						} else {
							if (!newName.equals("")) {
								if (FileTreatment.renameFile(homeDir+name,homeDir+newName)) {
									json.put("result","Rename successful");
								} else {
									json.put("error", "Rename "+name+" failed");
								}
							} else {
								json.put("error", "Rename "+name+" failed, the newName may not be null");
							}
						}
					} else if (event.equals("diff")) {
						String secondName=data.getParameterAsNonNullString("secondName");
						if (! FileTreatment.isInFolder(secondName, homeDir)) {
							json.put("error", "Access to "+secondName+" denied");
						} else if (!name.equals("") && !secondName.equals("")) {
							try {
								StringBuffer result=FileTreatment.getDiff(homeDir+name, homeDir+secondName);
								json.put("result", result.toString());
							} catch (Exception e) {
								json.put("error", "Diff failed: "+e.toString());
							}
						} else {
							json.put("error", "Diff failed, name and file2 has to be specified");
						}
					} else if (event.equals("colorDiff")) {
						String secondName=data.getParameterAsNonNullString("secondName");
						if (! FileTreatment.isInFolder(secondName, homeDir)) {
							json.put("error", "Access to "+secondName+" denied");
						} else if (!name.equals("") && !secondName.equals("")) {
							try {
								StringBuffer result=FileTreatment.getColorDiff(homeDir+name, homeDir+secondName);
								json.put("result", result.toString());
							} catch (Exception e) {
								json.put("error", "Diff failed: "+e.toString());
							}
						} else {
							json.put("error", "Diff failed, name and file2 has to be specified");
						}
					} else if (event.equals("load")) {
						String result=FileTreatment.readFile(homeDir+name);
						if (result!=null) {
							json.put("result",result);
						} else {
							json.put("error", "Load "+name+" failed");
						}
					} else if (event.equals("save")) {
						String content=data.getParameterAsString("content");
						if (content==null) {
							json.put("error", "Save "+name+" failed - content variable is null");
						} else {
							if (FileTreatment.save(content, homeDir+name)) {
								json.put("result","Save content successful");
							} else {
								json.put("error", "Save to "+name+" failed");
							}
						}
					} else if (event.equals("createFolder")) {
						if (FileTreatment.createFolder(homeDir+name)) {
							json.put("result","Create folder successful");
						} else {
							json.put("error", "Create folder "+name+" failed");
						}
					} else if (event.equals("dir")) {
						String filter=data.getParameterAsNonNullString("filter");
						JSONArray list=URLFileManager.dirAsJSON(homeDir+name, this.data.request.getRequestURL().toString(), filter, true, false);
						if (list!=null) {
							json.put("result",list);
						} else {
							json.put("error", "Dir folder content "+name+" failed");
						}	
					} else {
						json.put("error", "Event unknown: "+event);
					}
				}
		    }
			ServletUtilities.returnResponse(response,json.toString());
    	} catch (JSONException e) {
    		ServletUtilities.returnResponse(response,e.toString());
    	}
    }
}