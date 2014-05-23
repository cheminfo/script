package org.cheminfo.script;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.URLFileManager;


/**
 * Servlet implementation class JavaScriptServlet
 */
public class Login extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private final static boolean DEBUG=false;
	
	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Data data=new Data(request);
		String parameters=request.getRequestURI().replaceAll("^/+[^/]*/+[^/]*/?","");
		String key=parameters.replaceAll("^([^/]*)/(.*)$", "$1");
		String path=parameters.replaceAll("^([^/]*)/(.*)$", "$2");
		data.putParameter("key", key);
		data.putParameter("path", path);
		
		login(request, response, data);
	}

		
	public static void login(HttpServletRequest request, HttpServletResponse response, Data data) throws IOException {
		String redirect=data.getParameterAsNonNullString("redirect");
		String path=data.getParameterAsNonNullString("path");
		String key=data.getParameterAsNonNullString("key");
		if (DEBUG) {
			System.out.println("path: "+path);
			System.out.println("key: "+key);
		}
		
		if (URLFileManager.checkWriteFileKey(path, key)) {
			if (DEBUG) {
				System.out.println("Login successful");
			}
			request.getSession().setAttribute("homeDir", path);
			if (! redirect.equals("")) {
				response.sendRedirect(redirect);
			} else {
			//	String newURL=request.getRequestURI().replaceAll("Login.*","index.jsp");
				response.sendRedirect("/script/index.html");
			}
			
		} else {
			request.getSession().removeAttribute("homeDir");
			String newURL=request.getRequestURI().replaceAll("Login.*","nologin.jsp");
			response.sendRedirect(newURL);
		}
		
	}
}
