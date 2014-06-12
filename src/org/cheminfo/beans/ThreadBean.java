package org.cheminfo.beans;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map.Entry;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;
import org.cheminfo.script.utility.CircularFifoQueue;
import org.cheminfo.script.utility.ScriptInfo;

@ManagedBean
@SessionScoped
public class ThreadBean implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@ManagedProperty(value = "#{applicationScope.executorsMap}")
	private HashMap<String, ThreadPoolExecutor> executorsMap;
	
	@ManagedProperty(value = "#{applicationScope.threadsMap}")
	private HashMap<String, HashSet<Thread>> threadMap;
	
	@ManagedProperty(value = "#{applicationScope.scriptInfoMap}")
	private HashMap<String, CircularFifoQueue<ScriptInfo>> scriptInfoMap;
	
	public HashMap<String, ThreadPoolExecutor> getPersonalExecutorsMap() {
		if(getHomeDir()!=null && executorsMap!=null ){
			HashMap<String, ThreadPoolExecutor> personalMap=new HashMap<String, ThreadPoolExecutor>();
			for(Entry<String, ThreadPoolExecutor> entry: executorsMap.entrySet()){
				if(entry.getKey().startsWith(getHomeDir())){
					personalMap.put(entry.getKey(), entry.getValue());
				}
			}
			return personalMap;
		}else{
			return null;
		}	
	}
	
	public HashMap<String, HashSet<Thread>> getPersonalThreadMap() {
		if(getHomeDir()!=null && threadMap!=null ){
			HashMap<String, HashSet<Thread>> personalMap=new HashMap<String, HashSet<Thread>>();
			for(Entry<String, HashSet<Thread>> entry: threadMap.entrySet()){
				if(entry.getKey().startsWith(getHomeDir())){
					personalMap.put(entry.getKey(), entry.getValue());
				}
			}
			//JOptionPane jop= new JOptionPane("size: "+personalMap.size());
			return personalMap;
		}else{
			return null;
		}	
	}
	
	public HashMap<String, ArrayList<ScriptInfo>> getPersonalScriptInfoMap() {
		if(getHomeDir()!=null && scriptInfoMap!=null ){
			HashMap<String, ArrayList<ScriptInfo>> personalMap=new HashMap<String, ArrayList<ScriptInfo>>();
			for(Entry<String, CircularFifoQueue<ScriptInfo>> entry: scriptInfoMap.entrySet()){
				if(entry.getKey().startsWith(getHomeDir())){
					personalMap.put(entry.getKey(), new ArrayList<ScriptInfo>(entry.getValue()));
					//filtredScriptList.put(entry.getKey(), new ArrayList<ScriptInfo>(entry.getValue()));
				}
			}
			//JOptionPane jop= new JOptionPane("size: "+personalMap.size());
			return personalMap;
		}else{
			return null;
		}	
	}
	
	
	public void shutDownPool(ThreadPoolExecutor pool){
		FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO,"Info","trying to ShutDown Pool"); 
        FacesContext.getCurrentInstance().addMessage(null, msg);
		pool.shutdownNow();
	}
	
	public void removePool(String key){
		if(executorsMap.get(key).isTerminated()){
			executorsMap.remove(key);
			threadMap.remove(key);
			FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO,"Info","pool removed succefully"); 
	        FacesContext.getCurrentInstance().addMessage(null, msg);
		}else{
			FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_ERROR,"Error","pool can't be removed unless it's shut down and all thread stopped" ); 
	        FacesContext.getCurrentInstance().addMessage(null, msg);
		}
	}
	
	public void stopThread(Thread thread){
		FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO,"Info","trying to stop Thread"); 
        FacesContext.getCurrentInstance().addMessage(null, msg);
        if(thread.getState().equals(Thread.State.RUNNABLE)){
			System.out.println("ThreadBean: "+thread.getName());
			thread.stop();//change tu interrupt and make eval interreptuble by adding boolean to chekc in each loop and function
			//JOptionPane.showMessageDialog(null, "To much time to execute aborted", "Aborted", JOptionPane.ERROR_MESSAGE);
		}
	}
	
//	public void removeThread(String key, Thread thread){
//		if(thread.getState().equals(Thread.State.TERMINATED)){
//			threadMap.get(key).remove(thread);
//			FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_INFO,"Info","thread removed succefully"); 
//	        FacesContext.getCurrentInstance().addMessage(null, msg);
//		}else{
//			FacesMessage msg = new FacesMessage(FacesMessage.SEVERITY_ERROR,"Error","Thread can't be removed unless it's terminated" ); 
//	        FacesContext.getCurrentInstance().addMessage(null, msg);
//		}
//	}
	
	public String getHomeDir() {
		return (String) FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get("homeDir");
	}
	
	public String poolToString(ThreadPoolExecutor pool){
		String s=pool.toString();
		return s.substring(s.indexOf('['));
	}

	public HashMap<String, ThreadPoolExecutor> getExecutorsMap() {
		return executorsMap;
	}

	public void setExecutorsMap(HashMap<String, ThreadPoolExecutor> executorsMap) {
		this.executorsMap = executorsMap;
	}

	public HashMap<String, HashSet<Thread>> getThreadMap() {
		return threadMap;
	}

	public void setThreadMap(HashMap<String, HashSet<Thread>> threadMap) {
		this.threadMap = threadMap;
	}

	public HashMap<String, CircularFifoQueue<ScriptInfo>> getScriptInfoMap() {
		return scriptInfoMap;
	}

	public void setScriptInfoMap(
			HashMap<String, CircularFifoQueue<ScriptInfo>> scriptInfoMap) {
		this.scriptInfoMap = scriptInfoMap;
	}
//	
//	private HashMap<String, ArrayList<ScriptInfo>> filtredScriptList=new HashMap<String, ArrayList<ScriptInfo>>();
//	
//	public HashMap<String, ArrayList<ScriptInfo>> getFiltredScriptList() {
//		return filtredScriptList;
//	}
//
//	public void setFiltredScriptList(HashMap<String, ArrayList<ScriptInfo>> filtredScriptList) {
//		this.filtredScriptList = filtredScriptList;
//	}
}
