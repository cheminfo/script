package org.cheminfo.script;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;
import org.cheminfo.script.action.Action;
import org.cheminfo.script.action.ActionManager;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.Shared;


/**
 * Servlet implementation class JavaScriptServlet
 */
public class Run extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems

	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Run() {
        super();
        // TODO Auto-generated constructor stub
        //interpreter = new ScriptingInstance();
    }

	public void init(ServletConfig config) throws ServletException{
		super.init(config);
		
		Shared.setServletContext(config.getServletContext());
		
		// In order to create the help we need to have a scripting instance
		Shared.updateHelp(Shared.getScriptingInstance(null, true));
	}
    
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(final HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//System.out.println("Saved to: "+pathToSavedFiles+"/");
		Data data=new Data(request);
		String action = data.getAction();
			
		if (action==null) {
			action="RunScript";
		}

		// now we create the action
		final Action currentAction=ActionManager.getInstance(action);
		if (currentAction!=null) {
			currentAction.initialize(data, response, this);
			currentAction.execute();
		} else {
			returnResponse("The action "+action+" is not defined", response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request,  response);
	}

	public void returnResponse (String toReturn, HttpServletResponse response) {
		try {
			response.setContentType("text/plain");
			PrintWriter out = response.getWriter();
			out.println(toReturn);
			out.close();
		} catch (IOException e) {throw new RuntimeException("Exception: "+e.toString());}
	}
	
	@SuppressWarnings("unchecked")
	public static void addThreadPoolIfNotExist(HttpServletRequest request,
			String path) {
		HashMap<String, ThreadPoolExecutor> executorsMap = (HashMap<String, ThreadPoolExecutor>) request
				.getServletContext().getAttribute("executorsMap");
		if (executorsMap.get(path) == null) {
			executorsMap.put(path, UserManager.getNewPool(path));
		}
	}

	
}
