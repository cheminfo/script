package org.cheminfo.script.utility;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.cheminfo.function.scripting.SecureFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class URLAccessHelper {

	
	public String getWriteFileURL(String basedir, String key, String filename, String requestURL) {
		if (SecureFileManager.exists(basedir, key, filename)==1) {
			return URLFileManager.getFileWriteURL(basedir+"/"+filename, requestURL);
		} else {
			return "";
		}
	}
	
	public String getReadFileURL(String basedir, String key, String filename, String requestURL) {
		if (SecureFileManager.exists(basedir, key, filename)==1) {
			return URLFileManager.getFileReadURL(basedir+"/"+filename, requestURL);
		} else {
			return "";
		}
	}
	
	public String getLoginURL(String basedir, String key, String foldername, String requestURL) {
		switch (SecureFileManager.exists(basedir, key, foldername)) {
		case 1:
			return "getLoginURL must point to a folder and not a file";
		case 2:
			return URLFileManager.getLoginURL(basedir+"/"+foldername, requestURL);			
		default:
			return "NO ACCESS";
		}
	}
	
}
