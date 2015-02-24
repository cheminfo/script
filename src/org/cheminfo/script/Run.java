package org.cheminfo.script;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;
import org.cheminfo.script.action.Action;
import org.cheminfo.script.action.ActionManager;
import org.cheminfo.script.action.RunScript;
import org.cheminfo.script.utility.CircularFifoQueue;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.ScriptInfo;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.Shared;
import org.cheminfo.script.utility.UserManager;


/**
 * Servlet implementation class JavaScriptServlet
 */
public class Run extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	// NOT allowed to set common variables !!!!!!!
	// otherwise competition (multiprocess) problems
	Thread currentThread;
	
	public void setCurrentThread(Thread currentThread) {
		this.currentThread = currentThread;
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

			if (action.equals("RunScript") || action.equals("RunService")) {
				
				//TODO check if null
				final String path=(String) request.getSession().getAttribute("homeDir");
				addThreadPoolIfNotExist(request,path);
				addThreadListIfNotExist(request,path);
				addScriptInfoListIfNotExist(request,path);
				ThreadPoolExecutor pool=((HashMap<String, ThreadPoolExecutor>) request.getSession().getServletContext().getAttribute("executorsMap")).get(request.getSession().getAttribute("homeDir"));
				
				if(pool!=null){
					final ScriptInfo scriptInfo=new ScriptInfo();
					((RunScript) currentAction).setScriptInfo(scriptInfo);
					((HashMap<String, CircularFifoQueue<ScriptInfo>>) request.getSession().getServletContext().getAttribute("scriptInfoMap")).get(request.getSession().getAttribute("homeDir")).add(scriptInfo);
					Runnable scriptThread = new Runnable() {
						@Override
						public void run() {
							scriptInfo.setStartTime(System.currentTimeMillis());
							String scriptName=request.getParameter("currentDir")+"/"+request.getParameter("resultBranch");
							scriptInfo.setPath(scriptName);
							scriptInfo.setStatus("Running");
							setCurrentThread(Thread.currentThread());
							Thread.currentThread().setName(scriptName);
							((HashMap<String, HashSet<Thread>>) request.getSession().getServletContext().getAttribute("threadsMap")).get(path).add(Thread.currentThread());
							currentAction.execute();
						}
					};
					scriptInfo.setLaunchTime(System.currentTimeMillis());
					Future<?> f=pool.submit(scriptThread);
					try {
						scriptInfo.setTimeout(UserManager.getTimeout(path));
						f.get(UserManager.getTimeout(path), TimeUnit.MILLISECONDS);
						scriptInfo.setStatus("Terminated");
					} catch (InterruptedException e) {
						scriptInfo.setStatus("Interrupted");
						ServletUtilities.returnError(response, "Thread was interrupted");
					} catch (ExecutionException e) {
						scriptInfo.setStatus("Interrupted");
						ServletUtilities.returnError(response, "Thread was interrupted: "+e.toString());	
						e.printStackTrace(System.out);
					} catch (TimeoutException e) {
						if(currentThread.isAlive()){
							scriptInfo.setStatus("Timed Out");
							currentThread.stop();//change tu interrupt and make eval interreptuble by adding boolean to chekc in each loop and function
							//JOptionPane.showMessageDialog(null, "To much time to execute aborted", "Aborted", JOptionPane.ERROR_MESSAGE);
							ServletUtilities.returnError(response, "To much time to execute aborted");
						}
					}finally{
						scriptInfo.setEndTime(System.currentTimeMillis());
						((HashMap<String, HashSet<Thread>>) request.getSession().getServletContext().getAttribute("threadsMap")).get(path).remove(currentThread);
					}
				}else{
					System.out.println("oups (SHould never happen)");
				}
			} else {
				currentAction.execute();
			}

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

	@SuppressWarnings("unchecked")
	public static void addThreadListIfNotExist(HttpServletRequest request,
			String path) {
		HashMap<String, HashSet<Thread>> threadMap = (HashMap<String, HashSet<Thread>>) request
				.getServletContext().getAttribute("threadsMap");
		if (threadMap.get(path) == null) {
			threadMap.put(path, new HashSet<Thread>());
		}
	}
	
	@SuppressWarnings("unchecked")
	public static void addScriptInfoListIfNotExist(HttpServletRequest request,
			String path) {
		HashMap<String, CircularFifoQueue<ScriptInfo>> scriptInfoMap = (HashMap<String, CircularFifoQueue<ScriptInfo>>) request
				.getServletContext().getAttribute("scriptInfoMap");
		if (scriptInfoMap.get(path) == null) {
			scriptInfoMap.put(path, new CircularFifoQueue<ScriptInfo>(UserManager.getHistoriqueSize(path)));
		}
	}
}
