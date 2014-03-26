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


/**
 * Servlet implementation
 */
public class GetResult extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
  

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/event-stream");
		PrintWriter out=response.getWriter();
		while(true) {
			Date date=new Date();
			out.print("data: "+date.toString()+"\n\n");
			out.flush();
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	
}
