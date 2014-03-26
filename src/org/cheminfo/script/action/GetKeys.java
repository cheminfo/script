package org.cheminfo.script.action;

import java.io.File;
import java.io.OutputStream;

import org.apache.commons.io.IOUtils;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.URLAccessHelper;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class GetKeys extends Action {

    public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			try {
				JSONObject results=new JSONObject();
				for (String key : data.getKeySet()) {
					String filename=data.getParameterAsString(key);
					if (FileTreatment.isInFolder(filename, homeDir)) {
						JSONObject aFile=new JSONObject();
						
						aFile.put("name", filename);
//						aFile.put("readURL",URLFileManager.getFileReadURL(homeDir+"/"+filename, data.request.getRequestURL()+""));
//						aFile.put("writeURL",URLFileManager.getFileWriteURL(homeDir+"/"+filename, data.request.getRequestURL()+""));
						aFile.put("revisionWriteURL",URLFileManager.getRevisionURL(homeDir+"/"+filename, data.request.getRequestURL()+"",true));
						aFile.put("revisionReadURL",URLFileManager.getRevisionURL(homeDir+"/"+filename, data.request.getRequestURL()+"",false));
						
						results.put(key, aFile);
					}
				}
				
				ServletUtilities.returnResult(response,results);
			} catch (JSONException e) {
				ServletUtilities.returnError(response,"Exception: "+e.toString());
			}
		}
    }
}
