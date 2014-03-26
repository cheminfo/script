package org.cheminfo.script;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONObject;


/**
 * Servlet for direct access of hard disk (HD)
 */

public class Revision extends HttpServlet {
	private static final long serialVersionUID = 1L;
	final static boolean DEBUG=false;
	
	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems


	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Data data=new Data(request);
		Safety safety=setKeyPath(data);
		
		
		ServletUtilities ServletUtilities=new ServletUtilities();
		if (DEBUG) System.out.println("Revision: action="+safety.action);
		if (DEBUG) System.out.println("Revision: readAccess="+safety.readAccess);
		if (DEBUG) System.out.println("Revision: writeAccess="+safety.writeAccess);
		if (DEBUG) System.out.println("Revision: filename="+safety.filename);
		if (safety.action==null || safety.action.equals("")) {
			ServletUtilities.returnError(response, "The parameter action must be specified");
		} else if (safety.action.equals("Load")) {
			if (safety.readAccess) {
				// We will append ".json"
				safety.filename=safety.filename+".json";
				if (FileTreatment.pathExists(safety.filename)) {
					try {
						OutputStream output=ServletUtilities.getOutputStream(response, ServletUtilities.getMimetype(safety.filename));
						FileTreatment.copyFile(safety.filename, output);
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnResponse(response, "{}");
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (safety.action.equals("Save")) {
			// We are not allowed to save under the same name ????
			if (safety.writeAccess) {
				try {
					FileTreatment.createFolder(safety.filename.replaceAll("[^/]*$", ""));
					InputStream in=data.getParameterAsInputStream("content");
					FileOutputStream out = new FileOutputStream(safety.filename+".json");
					IOUtils.copy(in, out);
					in.close();
					out.close();
					JSONObject result=new JSONObject();
					result.put("revision", Long.parseLong(safety.revision));
					result.put("branch", safety.branch);
					/*
					result.put("loadURL", URLFileManager.getFileReadURL(safety.filename, request.getRequestURL()+""));
					result.put("saveURL", URLFileManager.getFileWriteURL(safety.filename, request.getRequestURL()+""));
					*/
					ServletUtilities.returnStatus(response, "Saved successfuly",result);
				} catch (Exception e) {
					ServletUtilities.returnError(response, e.toString());
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
/*		} else if (safety.action.equals("Upload")) {
			if (writeAccess) {
				if (FileTreatment.pathExists(safety.filename)) {
					try {
			    		Field file=data.getField("file");
			    		BufferedOutputStream output=new BufferedOutputStream(new FileOutputStream("/Users/lpatiny/Desktop/"+file.getFilename()));
			    		IOUtils.copy(data.getParameterAsInputStream("file"), output);
			    		output.close();
			    		ServletUtilities.returnResult(response, "Saved successfuly");
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "File does not exists"+safety.filename);
				}

			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
			*/
		} else if (safety.action.equals("Dir")) {
			if (safety.readAccess) {
				File directory=new File(safety.filename);
				if (FileTreatment.pathExists(safety.filename) && directory.isDirectory()) {
					JSONObject result=new JSONObject();
					try {
						File[] branches=directory.listFiles();
						
						for (File branch : branches) {
							JSONObject jsonBranch=new JSONObject();
							result.put(branch.getName(),jsonBranch);
							jsonBranch.put("mayWrite", safety.writeAccess);
							JSONArray branchRevisions=new JSONArray();
							jsonBranch.put("revisions", branchRevisions);
							if (branch.isDirectory()) {
								String[] revisions=branch.list();
								Arrays.sort(revisions);
								for (String revision : revisions) {
									try {
										branchRevisions.put(Long.parseLong(revision.replaceAll("\\..*","")));
									} catch (Exception e) {
										e.printStackTrace(System.out);
									}
								}
							}
						}
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
					ServletUtilities.returnResponse(response, result.toString());
				} else {
					ServletUtilities.returnError(response, "Folder does not exists"+safety.filename);
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (safety.action.equals("GetKeys")){
			try {
				JSONObject results=new JSONObject();
				//results.put("readURL",URLFileManager.getFileReadURL(safety.filename, data.request.getRequestURL()+""));
				//results.put("writeURL",URLFileManager.getFileWriteURL(safety.filename, data.request.getRequestURL()+""));

				results.put("revisionWriteURL",URLFileManager.getRevisionURL(safety.filename, data.request.getRequestURL()+"",true));
				results.put("revisionReadURL",URLFileManager.getRevisionURL(safety.filename, data.request.getRequestURL()+"",false));
				ServletUtilities.returnResult(response,results);
			} catch (Exception e) {
				ServletUtilities.returnError(response, e.toString());
			}				
		} else {
			ServletUtilities.returnError(response, "Wrong action: "+safety.action);
		}
	}

	


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}


	private Safety setKeyPath(Data data) {
		Safety safety=new Safety();
		safety.action=data.getParameterAsString("action");
		safety.branch=data.getParameterAsString("branch");
		
		// the safety.filename can contain some special fields !!!

		URI requestURI=null;
		try {
			requestURI = new URI(data.request.getRequestURI());
		} catch (URISyntaxException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		String parameters=requestURI.getPath().replaceAll("^/+[^/]*/+[^/]*/?","");
		String key=parameters.replaceAll("^([^/]*)/(.*)$", "$1");
		String baseDir=parameters.replaceAll("^([^/]*)/(.*)$", "$2");
		
		safety.readAccess=URLFileManager.checkReadFileKey(baseDir, key);
		safety.writeAccess=URLFileManager.checkWriteFileKey(baseDir, key);
		
		if ((safety.readAccess || safety.writeAccess) && (FileTreatment.isInFolder(Shared.getGlobalDataFolder()+"/"+baseDir,Shared.getGlobalDataFolder()))) {
			safety.filename=baseDir;
			if (safety.action!=null) {
				if (safety.action.equals("Dir")) {
					if (safety.branch!=null && ! safety.branch.equals("")) {
						safety.filename+="/"+safety.branch;
					}
				} else if (safety.action.equals("GetKeys")) {
					String newFile=safety.filename+"/"+data.getParameterAsString("filename").replaceAll("[^a-zA-Z0-9-_@\\.]","");
					if (FileTreatment.isInFolder(newFile, safety.filename)) {
						safety.filename=newFile;
					} else {
						safety.readAccess=false;
						safety.writeAccess=false;
					}
				} else {
					if (safety.branch==null || safety.branch.equals("")) safety.branch="Master";
					safety.revision=data.getParameterAsString("revision");
					if (safety.revision==null || safety.revision.equals("")) {
						safety.revision="<timestamp>";
						if (safety.action.equals("Load")) {
							// need to find the last one ...
							File directory=new File(Shared.getGlobalDataFolder()+safety.filename+"/"+safety.branch);
							if (directory.isDirectory()) {
								String[] dirs=directory.list();
								Arrays.sort(dirs);
								if (dirs.length>0) {
									safety.revision=dirs[dirs.length-1].replace(".json","");
								}
							}
						}
					}
					safety.revision=FileTreatment.updateFilenameFields(safety.revision);
					safety.filename+="/"+safety.branch+"/"+safety.revision;
				}
			}
			safety.filename=Shared.getGlobalDataFolder()+"/"+safety.filename;
		}
		return safety;
	}

	public void returnResponse (String toReturn, HttpServletResponse response) {
		try {
			response.setContentType("text/plain");
			PrintWriter out = response.getWriter();
			out.println(toReturn);
			out.close();
		} catch (IOException e) {throw new RuntimeException("Exception: "+e.toString());}
	}

	class Safety {
		String filename=null;
		String branch="";
		String revision="";
		String path=null;
		String action=null;
		boolean readAccess=false;
		boolean writeAccess=false;
	}

	
}


