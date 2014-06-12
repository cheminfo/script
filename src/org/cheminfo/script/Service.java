package org.cheminfo.script;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.cheminfo.script.action.RunService;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.TinyURL;



public class Service extends HttpServlet {
	private static final long serialVersionUID = 1L;

	final static boolean DEBUG=false;
	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Data data=new Data(request);
		String key=request.getRequestURI().replaceAll("^.*Service/", "");
		if (DEBUG) System.out.println("Key: "+key);
		
		String scriptFilename=TinyURL.retrieve(key);
		String homeDir=scriptFilename.replaceAll("/[^/]+$", "/");
		
		if (DEBUG) System.out.println("Script file name: "+scriptFilename);
		
		// Webservice should be accessible from anywhere
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		RunService service=new RunService();
		service.disableSSE();
		service.initialize(data, response, this);
		service.setHomeDir(homeDir);
		service.setScript(FileTreatment.readFile(scriptFilename));
		service.execute();

		
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request,  response);
	}
}
