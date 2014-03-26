/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/FileTreatment.java,v 1.9 2013/09/06 07:31:52 mzasso Exp $
*/

package org.cheminfo.script.utility;


import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedList;
import java.util.Random;

import name.fraser.neil.plaintext.DiffMatchPatch;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.comparator.NameFileComparator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



/**
 * This class allow to make some treatment concerning 
 * file.
 * It allow to read, write, modify a file
 * @author sgaillar
 *
 */
public class FileTreatment{
	final static String CRLF="\r\n";
	final static boolean DEBUG=false;
	
	
	
	/**
	* Save the content into the specified file
	* @param content	value of  content
	* @param filename	value of the name file
	*/  
	public static boolean save(String content, String filename) {
		if (DEBUG) System.out.println("FileTreatment: saving to: "+filename);
		String parentFolder=filename.replaceAll("/[^/]*$", "");
		if (! pathExists(parentFolder)) {
			createFolder(parentFolder);
		}
		try {
			BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filename), "UTF-8"));
			bw.write(content);
			bw.close();
			return true;
		} catch(Exception ex){
			ex.printStackTrace();
		}
		return false;
	}
	
	/**
	* Append the content to the specified file
	* @param content	value of  content
	* @param filename	value of the name file
	*/  
	public static boolean append(String content, String filename){
		try {
			BufferedWriter bw = new BufferedWriter(new FileWriter(filename, true));
			bw.write(content);
			bw.close();
			return true;
		} catch(Exception ex){
			ex.printStackTrace();
		}
		return false;
	}
	
	public static boolean renameFile(String oldName, String newName) {
		File file = new File(oldName);
		
		// File (or directory) with new name
		File file2 = new File(newName);
		
		// Rename file (or directory)
		boolean success = file.renameTo(file2);
		if (!success) {
		    return false;
		}
		return true;
	}
	
	/**
	* Read a file by giving the namefile
	* @param filename	value of the name file
	*/  	
	public static String readFile(String filename){
		String line="";
		StringBuffer text=new StringBuffer();
		try{
			BufferedReader br = new BufferedReader(new FileReader(filename));
			while((line = br.readLine())!=null){
				text.append(line+"\r");
			}
			br.close();
		} catch (Exception ex){
			//ex.printStackTrace();
			return null;
		}
		return text.toString();
	}
	
	
	
	
	/**
	* Read a file by giving the namefile
	* @param filename	value of the name file
	*/  	
	public static void copyFile(String filename, OutputStream out) throws Exception {
		FileInputStream in = new FileInputStream(filename);
		IOUtils.copy(in, out);
		in.close();
		out.close();
	}


	/**
	 * Allow to create a directory by giving a name
	 * @param directoryName name of the directory to create
	 * @return true if the directory define by the directoryName
	 * is existing
	 */
	public static boolean createFolder(String directoryName) {
		boolean success = (new File(directoryName)).mkdirs();
		return success;
    }
	
	public static boolean deleteFile(String filename) {
		File path = new File(filename);
		if (path.exists() && path.isFile()) {
			path.delete();
			return true;
		}
		return false;
	}
	
	/**
	 * Allow to delete a directory or a file by giving the name
	 * of the file or directory to delete
	 * @param directoryName name of the directory to get
	 * @return true if the deleting action is OK
	 */
	public static boolean deleteFolder(String directoryName) { 
		boolean resultat = true; 
		File path = new File(directoryName);
		if (path.exists() && path.isDirectory()) { 
			File[] files = path.listFiles(); 
			for (int i=0; i<files.length; i++) { 
                if (files[i].isDirectory()) { 
                	resultat = deleteFolder(files[i].getAbsolutePath()); 
                } else { 
                	resultat &= files[i].delete(); 
                } 
			} 
		} 
		resultat &= path.delete(); 
		return resultat; 
	}
	
	/**
	 * Allow to check if a path exists or not
	 * by giving the name of the path
	 * @param pathString define the path
	 * @return true if the path exist
	 */
	public static boolean pathExists(String pathString) { 
		File path = new File(pathString);
		return path.exists();
	}
	
	public static boolean dirAsJSON(String pathString, JSONArray json) throws JSONException {
		boolean result=true;
		File dir = new File(pathString);
		if (dir.exists() && dir.isDirectory()) { 
			File[] files = dir.listFiles();
			Arrays.sort(files, new FileSorter());
			for (File file : files) {
				if (file.isDirectory()) {
					JSONObject folder=new JSONObject();
					json.put(folder);
					JSONArray list=new JSONArray();
					folder.put(file.getName(), list);
                } else { 
                	json.put(file.getName());
                }
			}
		} else {
			result=false;
		}
		return result;		
	}
	
	public static boolean dirAsJSON2(String pathString, JSONArray json) throws JSONException {
		boolean result=true;
		File dir = new File(pathString);
		if (dir.exists() && dir.isDirectory()) { 
			File[] files = dir.listFiles();
			Arrays.sort(files, new FileSorter());
			for (File file : files) {
				if (file.isDirectory()) {
					JSONObject folder=new JSONObject();
					json.put(folder);
					JSONArray list=new JSONArray();
					folder.put(file.getName(), list);
                } else { 
                	json.put(file.getName());
                }
			}
		} else {
			result=false;
		}
		return result;		
	}

	

	
	public static boolean resursiveDirAsJSON(String pathString, JSONArray json) throws JSONException {
		boolean result=true;
		File dir = new File(pathString);
		if (dir.exists() && dir.isDirectory()) { 
			File[] files = dir.listFiles(); 
			for (File file : files) {
				if (file.isDirectory()) {
					JSONObject folder=new JSONObject();
					json.put(folder);
					JSONArray list=new JSONArray();
					folder.put(file.getName(), list);
                	result &= dirAsJSON(file.getAbsolutePath(), list); 
                } else { 
                	json.put(file.getName());
                }
			}
		} else {
			result=false;
		}
		return result;		
	}
	
	
    /**
     * Method to check that nobody is trying to use filename that jumps to another folder
     * 
     * @param filename (relative to the homeDir folder)
     * @param folder
     * @return
     */
	public static boolean isInFolder(String filename, String folder) {
		
		if (DEBUG) System.out.println("FileTreatment: isInfolder: filename: "+filename+" - folder: "+folder);
		
		if ((filename==null) || (folder==null)) return false;
		String canonicalFilename=getCanonicalFilename(folder+"/"+filename);
		String canonicalFolder=getCanonicalFilename(folder);
		if (canonicalFilename==null || canonicalFolder==null) return false;
		if (canonicalFilename.startsWith(canonicalFolder)) return true;
		return false;
	}
	
	protected static String getCanonicalFilename(String filename) {
		try {
			if (DEBUG) System.out.println("FileTreatment: getCanonicalfilename of: "+filename);
			if (DEBUG) System.out.println("FileTreatment: getCanonicalfilename result: "+new File(filename).getCanonicalPath().replaceAll("\\\\", "/"));
			return new File(filename).getCanonicalPath().replaceAll("\\\\", "/");
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}
	
	
	/**
	 * Get the last filename for a project. If it does not exists we create a new file
	 * @param homeDir
	 * @param currentPath
	 * @param branch
	 * @param info
	 * @param extension
	 * @return
	 */
	
	public static String getLastFilename(String homeDir, String currentPath, String type, String branch, String info, String extension) {
		return getFilename(homeDir, currentPath, type, branch, info, extension, false);
	}
	
	public static String getNewFilename(String homeDir, String currentPath, String type, String branch, String info, String extension)  {
		return getFilename(homeDir, currentPath, type, branch, info, extension, true);
	}
	
	private static String getSafeName(String name) {
		return name.replaceAll("[^a-zA-Z0-9._ -]","");
	}
	
	public static String updateFilenameFields(String name) {
		name=name.replaceAll("<timestamp>", new Date().getTime()+"");
		if (name.indexOf("<random>")>0) {
			byte[] bytes=new byte[200];
			new Random().nextBytes(bytes);
			String randomString=new String(bytes).replaceAll("[^a-zA-Z0-9]", "").substring(0,10);
			name=name.replaceAll("<random>", randomString);
		}
		
		return name;
	}
	
	private static String getFilename(String homeDir, String currentPath, String type, String branch, String info, String extension, boolean forceCreate)  {
		if (branch==null || branch.equals("")) branch="Master";
		branch=getSafeName(branch);
		
   		if (info==null) info="";
       	info=getSafeName(info);
    
       	if (extension==null) extension="";
       	extension=getSafeName(extension);
       	
       	if (currentPath==null) currentPath="";
    //   	currentPath=currentPath.replaceAll("[^a-zA-Z0-9._-]","");

       	if (type==null) type="";
       	type=getSafeName(type);

       	
       	String relativeDir=currentPath+"/"+type+"/"+branch+"/";
       	
       	String directory=homeDir+relativeDir;
       	directory=directory.replaceAll("^\\.","");
       	
		if (DEBUG) System.out.println("FileTreatment: getFilename: directory="+directory);
       	
       	if (! forceCreate) {
       		// we check if the folder exists and if there is a file with the correct extension
       		// in this case we retrieve the last one
       		if (pathExists(directory)) {
       			File dir = new File(directory);
       			if (dir.exists() && dir.isDirectory()) {
       				
       				File[] files = dir.listFiles();
       				Arrays.sort(files, NameFileComparator.NAME_REVERSE);
       				for (File file : files) {
       					if (file.getName().endsWith("."+extension)) {
       						System.out.println("EXISTING: "+file.getAbsolutePath());
       					}
       					String filename=file.getAbsolutePath();
       					if (FileTreatment.isInFolder(filename, homeDir)) {
       						return filename;
       					}
   	                }
   				}
       		}
       	}
       	
       	String uniqueID=new Date().getTime()+"";
       	
    	String filename=relativeDir+uniqueID;
    	if (! info.equals("")) filename+="_"+info;
    	filename=filename.replaceAll("//+","/");
		if (! filename.endsWith("."+extension)) {
			filename+="."+extension;
		}
		
		if (DEBUG) System.out.println("FileTreatment: getFilename: filename: "+filename+" - homeDir: "+homeDir);

		if (FileTreatment.isInFolder(filename, homeDir)) {
			return homeDir+filename;
		}
		return null;
	}
	
	
	public static StringBuffer getDiff(String filename1, String filename2) {
		String[] x=FileTreatment.readFile(filename1).split("\r\n?");
		String[] y=FileTreatment.readFile(filename2).split("\r\n?");
		return getDiff(x,y);
	}
	
    public static StringBuffer getColorDiff(String filename1, String filename2) {
    	String oldText=FileTreatment.readFile(filename1);
		String newText=FileTreatment.readFile(filename2);
    	DiffMatchPatch dmp=new DiffMatchPatch();
		LinkedList< name.fraser.neil.plaintext.DiffMatchPatch.Diff> diffs=dmp.diff_main(oldText, newText);
		return new StringBuffer(dmp.diff_prettyHtml(diffs));
    }
	
	private static StringBuffer getDiff(String[] x, String[] y) {
		// number of lines of each file
		int M = x.length;
		int N = y.length;
		StringBuffer toReturn=new StringBuffer();
		
		// opt[i][j] = length of LCS of x[i..M] and y[j..N]
		int[][] opt = new int[M+1][N+1];
		
		// compute length of LCS and all subproblems via dynamic programming
		for (int i = M-1; i >= 0; i--) {
		    for (int j = N-1; j >= 0; j--) {
		        if (x[i].equals(y[j]))
		            opt[i][j] = opt[i+1][j+1] + 1;
		        else 
		            opt[i][j] = Math.max(opt[i+1][j], opt[i][j+1]);
		    }
		}
		
		// recover LCS itself and print out non-matching lines to standard output
		int i = 0, j = 0;
		while(i < M && j < N) {
		    if (x[i].equals(y[j])) {
		        i++;
		        j++;
		    }
		    else if (opt[i+1][j] >= opt[i][j+1]) toReturn.append("< " + x[i++]+CRLF);
		    else                                 toReturn.append("> " + y[j++]+CRLF);
		}
		
		// dump out one remainder of one string if the other is exhausted
		while(i < M || j < N) {
		    if      (i == M) toReturn.append("> " + y[j++]+CRLF);
		    else if (j == N) toReturn.append("< " + x[i++]+CRLF);
		}
		
		return toReturn;
	}
	
}

class FileSorter implements Comparator<File> {
    public int compare(File f1, File f2) {
 	   return f1.getName().toLowerCase().compareTo(f2.getName().toLowerCase());
   }
}