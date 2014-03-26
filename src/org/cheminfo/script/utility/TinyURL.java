/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/TinyURL.java,v 1.2 2013/07/29 13:14:55 lpatiny Exp $
*/

package org.cheminfo.script.utility;

import http.utils.multipartrequest.MultipartRequest;
import http.utils.multipartrequest.ServletMultipartRequest;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.StringTokenizer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.LineIterator;
import org.json.JSONException;
import org.json.JSONObject;


/**
 * Class to store the information contained in a form taking into account that a
 * form can contain attached files like pictures, map or spectra.
 * 
 * This class allows to generalize the request.getParameter by taking into
 * account the possibility to have a multipart mimeType. The parameters are
 * stored in a HashMap of Field. A Field contains the value (a InputStream or a
 * String) as well as the mimeType of the parameter.
 */

public class TinyURL {

	
	public static String create(String url) {
		String digest=Digest.getUrlSafeDigest(url);
    	String uniqueID=Digest.getUniqueID();
    	String folder=uniqueID.substring(0,4);
    	String name=uniqueID.substring(0,10).replaceAll("-","");
    	String path=getTinyFolder()+folder;
    	if (! FileTreatment.pathExists(path)) {
    		FileTreatment.createFolder(path);
    	}
    	String filename=path+"/"+name+".txt";
    	
    	if (retrieve(name+"/"+digest).equals("")) {
    	
	    	// we will append this key in the text file
	    	try {
	    	    PrintWriter out = new PrintWriter(new BufferedWriter(new FileWriter(filename, true)));
	    	    out.println(digest+"\t"+url);
	    	    out.close();
	    	} catch (IOException e) {
	    	    e.printStackTrace(System.out);
	    	}
    	}

    	return name+"/"+digest;

	}
	
	public static String retrieve(String key) {
		String[] parts=key.split("/");

		if ((parts.length==2) && (parts[0].length()==8)) {
			String filename=getTinyFolder()+parts[0].substring(0,4)+"/"+parts[0]+".txt";
			LineIterator it=null;
			File file=new File(filename);
			if (file.exists()) {
		        try {
					it = FileUtils.lineIterator(file, "UTF-8");
		            while (it.hasNext()) {
		                String line = it.nextLine();
		                if (line.matches("^"+parts[1]+"\\t.*")){
		                    return line.replaceAll(".*\\t", "");
		                }
		            }
		         } catch (Exception e) {
		        	 e.printStackTrace(System.out);
		         } finally {LineIterator.closeQuietly(it);}
			}
		}
		return "";
	}

	private static String getTinyFolder() {
		String folder=Shared.getProperty("TINY_FOLDER",null);
		if (folder!=null) {
			File path = new File(folder);
			if (! path.exists()) {
				FileTreatment.createFolder(folder);
			}
			try {
				return (path.getCanonicalPath()+"/").replaceAll("\\\\", "/");
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return null;
			}
		}
		return null;
	}
	
	public static void main(String[] args) {
		System.out.println(create("http://www.epfl.ch/XX?asdf"));
		System.out.println(retrieve("20121019/1SnSqxGFA7"));
	}

	
}
