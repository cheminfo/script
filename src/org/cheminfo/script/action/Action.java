package org.cheminfo.script.action;

import java.io.File;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;

import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.Shared;

public class Action {
	Data data=null;
	

	final static boolean DEBUG=false;

	HttpServletResponse response=null;
	HttpServlet httpServlet=null;
	String homeDir=null;
	
	public void initialize(Data data, HttpServletResponse response, HttpServlet httpServlet) {
		this.data=data;
		this.response=response;
		this.httpServlet=httpServlet;
		this.homeDir=this.getHomeDir();
	}
	
	public void execute() {
    		// based on the current data and the parameters we should
    		// modify the data
    }
 
	// To use with care, this could be a security hole !!!!!
	public void setHomeDir(String homeDir) {
		this.homeDir=homeDir;
		
	}
	
	public String getHomeDir() {
		if (data.request.getSession().getAttribute("homeDir")==null) return null;
		String homeDir=data.request.getSession().getAttribute("homeDir").toString();
		if (! homeDir.endsWith("/")) {
			homeDir+="/";
		}
		if (homeDir==null || homeDir.equals("")) return null;
		String folder=Shared.getGlobalDataFolder()+homeDir;
		if (DEBUG) {
			System.out.println("getHomeDir: "+folder);
		}
		if (! FileTreatment.pathExists(folder)) {
			FileTreatment.createFolder(folder);
		}
		
		folder=folder.replaceAll("//+","/");
		
		return folder;
	}
	

	
	public static void main(String args[]){
		String filename = "lpatiny/data//XTC/images/png/1147B-2-01.png";
		String extension=filename.replace("[^.]","").toLowerCase();
		System.out.println(filename+"   "+extension );
	}
	
}