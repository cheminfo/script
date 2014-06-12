package org.cheminfo.listeners;

import java.util.HashMap;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;

public class CheminfoSessionListener implements HttpSessionListener {
	 
	  private static int totalActiveSessions;
	 
	  public static int getTotalActiveSession(){
		return totalActiveSessions;
	  }
	 
	  @Override
	  public void sessionCreated(HttpSessionEvent arg0) {
		totalActiveSessions++;
		System.out.println("sessionCreated - add one session into counter");
	  }
	 
	  @Override
	  public void sessionDestroyed(HttpSessionEvent arg0) {
		String homeDir=(String) arg0.getSession().getAttribute("HomeDir");
		if(homeDir !=null){
			HashMap<String, ThreadPoolExecutor> executorsMap=(HashMap<String, ThreadPoolExecutor>) arg0.getSession().getServletContext().getAttribute("executorsMap");
			ThreadPoolExecutor executorService=executorsMap.get(homeDir);
			if(((ThreadPoolExecutor) executorService).getActiveCount()==0){
				executorService.shutdownNow();
				executorsMap.remove(executorService);
			}
		}
		totalActiveSessions--;
		System.out.println("sessionDestroyed - deduct one session from counter");
	  }	
	}