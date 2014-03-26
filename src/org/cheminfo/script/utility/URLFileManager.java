package org.cheminfo.script.utility;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Comparator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class URLFileManager {
	
	/**
	 * We check if we are allowed to read or read/write a specific file.
	 * The key may be the one of the file or any key of the higher hierarchy
	 * @param filename
	 * @param key
	 * @param mayWrite
	 * @return
	 */
	protected static boolean checkFileKey(String filename, String key, boolean mayWrite) {
		if (getFileKey(filename,true).equals(key) || (!mayWrite && getFileKey(filename,false).equals(key))) return true;
		String parts[]=filename.split("(?=/)");
		String path="";
		for (String part : parts) {
			path+=part;
			if (getFileKey(path+"/",true).equals(key) || (!mayWrite && getFileKey(path+"/",false).equals(key))) return true;
		}
		return false;
	}
	
	public static boolean checkReadFileKey(String filename, String key) {
		return checkFileKey(filename, key, false);
	}
	
	public static boolean checkWriteFileKey(String filename, String key) {
		return checkFileKey(filename, key, true);
	}

	
	public static String getFileKey(String filename, boolean mayWrite) {
		String type="read";
		if (mayWrite) {
			type="write";
		}
		return Digest.getUrlSafeDigest(filename+Shared.getProperty("SEED_KEY","")+type);
	}
	
	private static String cleanPath(String filename) {
		try {
			return new File(filename).getCanonicalPath().replaceFirst(Shared.getGlobalDataFolder(), "");
		} catch (IOException e) {
			return null;
		}
	}
	
	
	public static String getFileReadURL(String filename, String requestURL) {
		try {
			boolean isDirectory=new File(filename).isDirectory();
			String baseURL=getBaseURL(requestURL);
			String relativeFilename=cleanPath(filename);
			String key=getFileKey(relativeFilename, false);
			String action="Load";
			if (isDirectory) action="Dir";
			return baseURL+action+"/"+key+"?filename="+URLEncoder.encode(relativeFilename,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	public static String getFileWriteURL(String filename, String requestURL) {
		try {
			String baseURL=getBaseURL(requestURL);
			String relativeFilename=cleanPath(filename);
			String key=getFileKey(relativeFilename, true);
			return baseURL+"Save/"+key+"?filename="+URLEncoder.encode(relativeFilename,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	public static String getRevisionURL(String filename, String requestURL, boolean mayWrite) {
		try {
			String baseURL=getBaseURL(requestURL).replaceAll("[^/]+/$","Revision/");
			
			URI uri=new URI(baseURL);
			
			String relativeFilename=cleanPath(filename);
			String key=getFileKey(relativeFilename, mayWrite);
		//	String fullURL=baseURL+key+"/"+relativeFilename;
			
			URI finalUri=new URI(uri.getScheme(),uri.getUserInfo(), uri.getHost(),uri.getPort(),uri.getPath()+key+"/"+relativeFilename,uri.getQuery(),uri.getFragment());
			
			return finalUri.toString();
		} catch (URISyntaxException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	public static String getLoginURL(String path, String requestURL) {
		try {
			String baseURL=getBaseURL(requestURL);
			String relativeFilename=cleanPath(path);
			String key=getFileKey(relativeFilename, true);
			return baseURL+"Login/"+key+"?path="+URLEncoder.encode(relativeFilename,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	public static String getFolderWriteURL(String path, String requestURL) {
		try {
			String baseURL=getBaseURL(requestURL);
			String relativeFilename=cleanPath(path);
			String key=getFileKey(relativeFilename, true);
			return baseURL+"Save/"+key+"?path="+URLEncoder.encode(relativeFilename,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	
	public static String getFolderDirURL(String path, String requestURL) {
		try {
			String baseURL=getBaseURL(requestURL);
			String relativeFilename=cleanPath(path);
			String key=getFileKey(relativeFilename, true);
			return baseURL+"Dir/"+key+"?path="+URLEncoder.encode(relativeFilename,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace(System.out);
			return null;
		}
	}
	
	private static String getBaseURL(String requestURL) {
		return requestURL.replaceAll("(//[^/]+/[^/]+).*$","$1")+"/HD/";
	}
	
	public static JSONArray dirAsJSON(String foldername, String requestURL, String filter, boolean mayWrite) {
		return dirAsJSON(foldername, requestURL, filter, mayWrite, false);
	}
	
	public static JSONArray dirAsJSON(String foldername, String requestURL, String filter, boolean mayWrite, boolean recursive) {
		JSONArray json=new JSONArray();
		try {
			File dir = new File(foldername);
			if (dir.exists() && dir.isDirectory()) { 
				File[] files = dir.listFiles();
				
				Arrays.sort(files,new Comparator<File>() {
					@Override
					public int compare(File o1, File o2) {
						try {
							if(o1.isDirectory() && o2.isFile())
								return -1;
							if(o1.isFile() && o2.isDirectory())
								return 1;
							return o1.getCanonicalPath().toLowerCase().compareTo(o2.getCanonicalPath().toLowerCase());
						} catch (IOException e) {
							e.printStackTrace();
						}
						return 0;
					}
				});
				
				for (File file : files) {
					if (filter==null || filter.equals("") || file.getName().matches(filter)) {
						JSONObject jsonFile=addFile(file,file.getName(), requestURL, mayWrite);
						if (file.isDirectory() && recursive) {
							// we also need to add the values
							jsonFile.put("values", dirAsJSON(file.getAbsolutePath(), requestURL, filter, mayWrite, recursive));
						}
						json.put(jsonFile);
					}
				}
				if (filter==null || filter.equals("")) {
					json.put(addFile(dir, ".", requestURL, mayWrite));
				}
			} else {
				return null;
			}
			return json;		
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
	
	private static JSONObject addFile(File file, String name, String baseURL, boolean mayWrite) throws IOException, JSONException {
		JSONObject jsonFile=new JSONObject();
//		jsonFile.put("key", getFileKey(file.getCanonicalPath(), baseURL, false));
		jsonFile.put("name", name);
		jsonFile.put("title", name);
		if (file.isDirectory()) {
			jsonFile.put("isFolder", true);
			jsonFile.put("isLazy", true);
			jsonFile.put("dirURL", getFolderDirURL((file.getCanonicalPath()+"/").replaceAll("\\\\", "/"), baseURL));
			if (mayWrite) {
				jsonFile.put("addURL", getFolderWriteURL((file.getCanonicalPath()+"/").replaceAll("\\\\", "/"), baseURL));
				jsonFile.put("loginURL", getLoginURL((file.getCanonicalPath()+"/").replaceAll("\\\\", "/"), baseURL));
			}
        } else { 
        	jsonFile.put("isFolder", false);
			jsonFile.put("readURL", getFileReadURL(file.getCanonicalPath().replaceAll("\\\\", "/"), baseURL));
			if (mayWrite) {
				jsonFile.put("writeURL", getFileWriteURL(file.getCanonicalPath().replaceAll("\\\\", "/"), baseURL));
			}
			jsonFile.put("size",file.length());
			jsonFile.put("lastModified",file.lastModified());
        }
		return jsonFile;
	}
}
