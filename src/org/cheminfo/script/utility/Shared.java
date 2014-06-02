/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/Shared.java,v 1.8 2013/11/26 14:49:01 mzasso Exp $
*/

package org.cheminfo.script.utility;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLClassLoader;
import java.util.Properties;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpSession;

import org.cheminfo.function.scripting.ScriptingInstance;


/**
 *  Shared used the SingleTon principle. For more information check:
 * http://www.javaworld.com/javaworld/jw-04-2003/jw-0425-designpatterns.html
 */

public class Shared {
	private final static boolean DEBUG=false;
	
	private static Shared instance = null;
	private ServletContext servletContext=null;
	
	int hashOfHelp=0;
	
	// Tells if the Properties have been initialised
	private Properties properties = null;
	
	protected Shared() {
		// Exists only to defeat instantiation.
	}
	
	public static synchronized Shared getInstance() {
		if (instance == null) {
			instance = new Shared();
		}
		return instance;
	}
	

	public static void setServletContext(ServletContext servletContext) {
		getInstance().servletContext=servletContext;
	}
	
	
	public static String getServletRealPath() {
		return getInstance().servletContext.getRealPath("");
	}
	
	public static String getContextProperty(String propertyName, String defaultValue) {
		try {
			String value=getInstance().servletContext.getInitParameter(propertyName);
			if (value!=null) return value;
		} catch (Exception e) {}
		return defaultValue;
	}
      
	public static String getProperty(String propertyName, String defaultValue) {
		initProperties();
		return getInstance().properties.getProperty(propertyName,defaultValue);
	}

	
	private static void initProperties() {
		if (getInstance().properties!=null) return;
		String filename=getInstance().getContextProperty("PROPERTY_FILENAME","/usr/local/script/script.properties");
		if (! new File(filename).exists()) {
			filename=getInstance().getContextProperty("PROPERTY_FILENAME2","C:/script/script.properties");
		}
		try {
			InputStream is=null;
			is = new FileInputStream(filename);
			getInstance().properties=new Properties();
			getInstance().properties.load(is);
			is.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}


	public static void updateHelp(ScriptingInstance interpreter) {
		try {
			String help = interpreter.getScriptingHelp().toString();
			if (DEBUG) System.out.println(help);
			if (help.hashCode()!=getInstance().hashOfHelp) {
				if (DEBUG) System.out.println("Shared: updating help");
				getInstance().hashOfHelp=help.hashCode();
				if (Shared.getServletRealPath()!=null) {
					String helpFile = Shared.getProperty("HELP_FILE",null);
					File file = new File(Shared.getServletRealPath()+helpFile);
					BufferedWriter writer = new BufferedWriter(new FileWriter(file));
					writer.write(help);
					writer.close();
				} else {
					System.out.println("Shared.getServletRealPath() is null");
				}
			} else {
				if (DEBUG) System.out.println("Shared: no need to update help");
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
	
	
	public static ScriptingInstance getScriptingInstance(HttpSession session, boolean forceNew) {
		if (DEBUG) System.out.println("Shared: getting scripting instance");
		
		if (! forceNew && session!=null && (ScriptingInstance)session.getAttribute("scripting")!=null) {
			if (DEBUG) System.out.println("Shared: return existing scripting instance: "+session.getAttribute("scripting"));
			ScriptingInstance interpreter=(ScriptingInstance)session.getAttribute("scripting");
			interpreter.getConsole().clear();
			return interpreter;
		} else {
			ScriptingInstance interpreter=new ScriptingInstance(Shared.getProperty("PLUGINS_FOLDER",null),(URLClassLoader)getInstance().getClass().getClassLoader());				
			// we will add in the context our method for file access
			interpreter.getJsEngine().put("URLAccessHelper",new URLAccessHelper());
			
			if (session!=null) {
				session.setAttribute("scripting", interpreter);
			}
			if (DEBUG) System.out.println("Shared: creating new scripting instance");
			return interpreter;
		}
	}

	public static String getGlobalDataFolder() {
		String folder=Shared.getProperty("DATA_FOLDER",null);
		if (folder==null) {
			System.out.println("The configuration parameter DATA_FOLDER is unspecified");
			return null;
		} else {
			File path = new File(folder);
			if (! path.exists()) {
				FileTreatment.createFolder(folder);
			}
			try {
				return (path.getCanonicalPath()+"/").replaceAll("\\\\", "/");
			} catch (IOException e) {
				e.printStackTrace();
				return null;
			}
		}
	}
	
	public static boolean isFirstLevel(String path) {
		if(path==null) return false;
		String dataFolder = getGlobalDataFolder();
		if(path.indexOf(dataFolder)!=0) return false;
		path = path.replace(dataFolder, "");
		if(path.substring(0, path.length()-1).contains("/"))
			return false;
		return true;
	}
}
