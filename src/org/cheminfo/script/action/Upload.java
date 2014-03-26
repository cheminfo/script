package org.cheminfo.script.action;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.HashMap;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.cheminfo.script.utility.Field;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;

public class Upload extends Action {

    public void execute() {
		if (homeDir==null) {
			ServletUtilities.returnError(response,"Security problem: no home directory - please login!");
		} else {
			String path=data.getParameterAsNonNullString("path");
			if (FileTreatment.isInFolder(path, homeDir)) {
				try {
			    	if (data.containsKey("file")) {
			    		Field file=data.getField("file");
			    		BufferedOutputStream output=new BufferedOutputStream(new FileOutputStream(homeDir+path+"/"+file.getFilename()));
			    		IOUtils.copy(data.getParameterAsInputStream("file"), output);
			    		output.close();
			    		
			    		HashMap<String,String> parameters=new HashMap<String,String>();
			    		parameters.put("filename",file.getFilename());
			    		
			    		
			    		ServletUtilities.returnResult(response,"Save successful",parameters);
			    	}
		    	} catch (Exception e) {
		    		ServletUtilities.returnError(response,"action: UploadFile: "+e.toString());
		    	}
			} else {
				ServletUtilities.returnError(response,"action: UploadFile: Security problem");
			}
		 	
		}
	}
}
