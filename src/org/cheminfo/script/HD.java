package org.cheminfo.script;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLClassLoader;
import java.net.URLDecoder;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.cheminfo.function.scripting.ScriptingInstance;
import org.cheminfo.script.action.Action;
import org.cheminfo.script.action.ActionManager;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.Field;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.TinyURL;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


/**
 * Servlet for direct access of hard disk (HD)
 */

public class HD extends HttpServlet {
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
		String action=safety.action;
		
		if (action.equals("Load")) {
			if (safety.readAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					try {
						OutputStream output=ServletUtilities.getOutputStream(response, ServletUtilities.getMimetype(safety.absoluteFilename));
						FileTreatment.copyFile(safety.absoluteFilename, output);
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "File does not exists"+safety.absoluteFilename);
				}

			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if(action.equals("Download")) {
			if (safety.readAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					try {
						response.setContentType("application/octet-stream");
						response.setHeader("Content-Disposition", "attachment; filename=\""+safety.relativeFilename.replaceFirst(".*/","")+"\"");
						FileTreatment.copyFile(safety.absoluteFilename, response.getOutputStream());
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "File does not exists"+safety.absoluteFilename);
				}

			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Save")) {
			if (safety.writeAccess) {
				if (safety.isFolder) {
					ServletUtilities.returnError(response, "The target file corresponds to a folder. Did you specify the filename and content parameters ?");
				} else {
					try {
						FileTreatment.createFolder(safety.absoluteFilename.replaceAll("[^/]*$", ""));
						InputStream in=data.getParameterAsInputStream("content");
						FileOutputStream out = new FileOutputStream(safety.absoluteFilename);
						IOUtils.copy(in, out);
						in.close();
						out.close();
						JSONObject result=new JSONObject();
						result.put("filename", safety.relativeFilename);
						result.put("loadURL", URLFileManager.getFileReadURL(safety.absoluteFilename, request.getRequestURL()+""));
						result.put("saveURL", URLFileManager.getFileWriteURL(safety.absoluteFilename, request.getRequestURL()+""));
						ServletUtilities.returnStatus(response, "Saved successfuly",result);
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Upload")) {
			if (safety.writeAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					try {
			    		Field file=data.getField("file");
			    		BufferedOutputStream output=new BufferedOutputStream(new FileOutputStream(safety.absoluteFilename+file.getFilename()));
			    		IOUtils.copy(data.getParameterAsInputStream("file"), output);
			    		output.close();
			    		ServletUtilities.returnResult(response, "Saved successfuly");
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "File does not exists"+safety.absoluteFilename);
				}

			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Delete")) {
			if (safety.writeAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					try {
						FileTreatment.deleteFile(safety.absoluteFilename);
						ServletUtilities.returnResult(response, "Deleted successfuly");
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "File does not exists"+safety.absoluteFilename);
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Dir")) {
			if (safety.readAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					try {
						JSONArray result=URLFileManager.dirAsJSON(safety.absoluteFilename, request.getRequestURL()+"", "", safety.writeAccess);
						if (result!=null) {
							ServletUtilities.returnResult(response, result);
						} else {
							ServletUtilities.returnError(response, "Could not retrieve directory");
						}
					} catch (Exception e) {
						ServletUtilities.returnError(response, e.toString());
					}
				} else {
					ServletUtilities.returnError(response, "Folder does not exists"+safety.absoluteFilename);
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Login")) {
			if (safety.writeAccess) {
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					data.putParameter("key", safety.key);
					Login.login(request, response, data);
				} else {
					ServletUtilities.returnError(response, "Folder does not exists"+safety.absoluteFilename);
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		} else if (action.equals("Run")) {
			// other action are allowed if the name ends with "/XXX" where XXX is the name of the action
			if (safety.writeAccess) {
				if (! FileTreatment.pathExists(safety.absoluteFilename)) {
					FileTreatment.createFolder(safety.absoluteFilename);
				}
				if (FileTreatment.pathExists(safety.absoluteFilename)) {
					// now we create the action
					Action currentAction=ActionManager.getInstance("RunScript");
					data.putParameter("currentDir", "");
					currentAction.initialize(data, response, this);
					currentAction.setHomeDir(safety.absoluteFilename);
					currentAction.execute();

				} else {
					ServletUtilities.returnError(response, "Folder does not exists"+safety.absoluteFilename);
				}
			} else {
				ServletUtilities.returnError(response, "Wrong access key");
			}
		}
	}



	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request,  response);
	}


	private Safety setKeyPath(Data data) {
		Safety safety=new Safety();
		String key=null;
		String path=data.getParameterAsString("path");
		safety.relativeFilename=data.getParameterAsString("filename");
		
		if (safety.relativeFilename==null) {
			safety.relativeFilename=path;
		} else if (path!=null) {
			safety.relativeFilename=path+safety.relativeFilename;
		}
		
		String action=null;
		String parameters=data.request.getRequestURI().replaceAll("^/+[^/]*/+[^/]*/?","");
		action=parameters.replaceAll("^([^/]*)/([^/]*)$", "$1");
		key=parameters.replaceAll("^([^/]*)/([^/]*)$", "$2");
		safety.key=key;
		
		safety.readAccess=URLFileManager.checkReadFileKey(safety.relativeFilename, key);
		safety.writeAccess=URLFileManager.checkWriteFileKey(safety.relativeFilename, key);
		if ((safety.readAccess || safety.writeAccess) && (FileTreatment.isInFolder(safety.relativeFilename,Shared.getGlobalDataFolder()))) {
			// the filename can contain some special fields !!!
			safety.relativeFilename=FileTreatment.updateFilenameFields(safety.relativeFilename);
			safety.absoluteFilename=Shared.getGlobalDataFolder()+"/"+safety.relativeFilename;
		}
		safety.isFolder=new File(safety.absoluteFilename).isDirectory();
		if (DEBUG) {
			System.out.println("Parameters: "+parameters);
			System.out.println("Set key: "+key);
			System.out.println("readAccess: "+safety.readAccess);
			System.out.println("writeAccess: "+safety.writeAccess);
			System.out.println("Relative Filename: "+safety.relativeFilename);
			System.out.println("Absolute Filename: "+safety.absoluteFilename);
			System.out.println("Is folder:"+safety.isFolder);
		}
		safety.action=action;
		
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
		String absoluteFilename=null;
		String relativeFilename=null;
		String action=null;
		String key="";
		boolean isFolder=false;
		boolean readAccess=false;
		boolean writeAccess=false;
	}

}




