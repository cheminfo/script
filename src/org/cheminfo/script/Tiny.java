package org.cheminfo.script;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLClassLoader;
import java.util.Date;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.cheminfo.function.scripting.ScriptingInstance;
import org.cheminfo.script.action.Action;
import org.cheminfo.script.action.ActionManager;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.TinyURL;


/**
 * Servlet implementation class JavaScriptServlet
 */
public class Tiny extends HttpServlet {
	private static final long serialVersionUID = 1L;

	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems

	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String key=request.getRequestURI().replaceAll("^.*Tiny/", "");
		System.out.println(key);
		String newURL=TinyURL.retrieve(key);
		response.sendRedirect(newURL);
	}
}
