/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/Data.java,v 1.2 2013/09/25 06:21:51 lpatiny Exp $
*/

package org.cheminfo.script.utility;

import http.utils.multipartrequest.MultipartRequest;
import http.utils.multipartrequest.ServletMultipartRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.StringTokenizer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;




/**
 * Class to store the information contained in a form taking into account that a
 * form can contain attached files like pictures, map or spectra.
 * 
 * This class allows to generalize the request.getParameter by taking into
 * account the possibility to have a multipart mimeType. The parameters are
 * stored in a HashMap of Field. A Field contains the value (a InputStream or a
 * String) as well as the mimeType of the parameter.
 */

public class Data {

    private HashMap<String, Field> allParameters=new HashMap<String, Field>(); // will contain all the
													// parameters in a HashMap

    private String username="";
    public HttpSession session=null;
    public HttpServletRequest request=null;
    
    public boolean containsKey(String parameterName) {
    	return allParameters.containsKey(parameterName);
    }
    
    public String getServerURL() {
    	String serverURL=request.getScheme()+"://"+request.getServerName();
    	if (request.getScheme().equals("http") && request.getServerPort()==80) {
    		return serverURL;
    	} else if (request.getScheme().equals("https") && request.getServerPort()==443) {
    		return serverURL;
    	} else {
    		return serverURL+":"+request.getServerPort();
    	}
    }
    
    
    
/**
 * Creates a FormData based on an HttpServletRequest
 * 
 * @param request
 *            the incoming submission of the form
 */   
	
    public Data(HttpServletRequest request) throws IOException {
    	request.setCharacterEncoding("UTF-8");
        this.session=request.getSession();
        this.request=request;
        setParameters(request);
        
        // Should we make a kind of autologin
        // there should be key and path
        if (this.containsKey("path") && this.containsKey("key")) {
        	String path=this.getParameterAsString("path");
        	String key=this.getParameterAsString("key");
			if (URLFileManager.checkWriteFileKey(path, key)) {
				this.session.setAttribute("homeDir", path);
			}
        }
     }

//    public Data() {
//    	
//    }
    
    public boolean isAdmin() {
    	return request.isUserInRole("webautomator-admin");
    }
  
    public boolean isUser() {
    	if (isAdmin()) return true;
    	return request.isUserInRole("webautomator-user");
    }
    
    public boolean isGuest() {
    	return request.isUserInRole("webautomator-guest");
    }
    
    /** Does an admin pretends he is somebody else ?*/
    
    public boolean isPretending() {
    	if (! username.equals(request.getRemoteUser()) && isAdmin()) {
    		return true;
    	}
    	return false;
    }
    
/**
 * Get the value of a form parameter as a Field
 * 
 * @param name
 *            name of the parameter
 * @return the field data corresponding to the name
 */ 
    public Field getField(String name) {
	    	Object o = allParameters.get(name);
	    	if (o != null) return (Field)o;	
	    	else return null;
	}
    
    public Set<String> getKeySet() {
    	return allParameters.keySet();
    }
    
    public String getParameterAsNonNullString(String name) {
    	String value=getParameterAsString(name);
    	if (value==null) return "";
    	return value;
}

/**
 * Get the value of a form parameter as a String
 * 
 * @param name
 *            name of the parameter
 * @return the value of the field corresponding to the name as a String
 */ 
    public String getParameterAsString(String name) {
    	Field o = allParameters.get(name);
    	if (o == null) return null;
    	if (o.isStream()) {
    		try {
				return Convert.inputStreamToString(o.getValueAsInputStream());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    	}
    	return o.toString();	
    }

    /**
	 * Get the value of a form parameter as a String
	 * 
	 * @param name
	 *            name of the parameter
	 * @return the value of the field corresponding to the name as a String
	 */ 
        public boolean getParameterAsBoolean(String name) {
        		Object o = allParameters.get(name);
    	    	if (o == null) return false;
    	    	String value=((Field)o).toString().toLowerCase();	
    	    	if (value.equals("true")) return true;
    	    	if (value.equals("ok")) return true;
    	    	if (value.equals("on")) return true;
    	    	if (value.equals("1")) return true;
    	    	return false;
    	}
    
/**
 * Get the value of a form parameter as a Integer
 * 
 * @param name
 *            name of the parameter
 * @return the value of the field corresponding to the name as a Integer
 */ 
    public Integer getParameterAsInteger(String name) {
    	Object o = allParameters.get(name);
    	if (o != null) return ((Field)o).getValueAsInteger();	
    	else return null;
	}

/**
 * Get the value of a form parameter as a Double
 * 
 * @param name
 *            name of the parameter
 * @return the value of the field corresponding to the name as a Double
 */ 
    public Double getParameterAsDouble(String name) {
	    	Object o = allParameters.get(name);
	    	if (o != null) return ((Field)o).getValueAsDouble();	
	    	else return null;
	}

/**
 * Get the value of a form parameter as an InputStream
 * 
 * @param name
 *            name of the parameter
 * @return the field data corresponding to the name as an InputStream
 */   
    public InputStream getParameterAsInputStream(String name) {
	    	Field field;
	    	try {
	    		field=getField(name);
	    		return field.getValueAsInputStream();	
	    	} catch (NullPointerException e) {return null;}
	}

    /**
	 * Get the value of a form parameter as an OutputStream
	 * 
	 * @param name
	 *            name of the parameter
	 * @return the field data corresponding to the name as an InputStream
	 */   
        public OutputStream getParameterAsOutputStream(String name) {
    	    	Field field;
    	    	try {
    	    		field=getField(name);
    	    		return field.getValueAsOutputStream();	
    	    	} catch (NullPointerException e) {return null;}
    	}
/**
 * Get the value of a form parameter as an Object (String of InputStream).
 * 
 * @param name
 *            name of the parameter
 * @return the field data corresponding to the name as an Object
 */  
    public Object getParameter(String name) {
	    	Field field;
	    	try {
	    		field=getField(name);
	    	} catch (NullPointerException e) {
	    		throw new RuntimeException("Parameter "+name+ " is null");
	    	}	
	    	if (field!=null) return field.getValue();	
	    	return null;
    }

/**
 * Get the value of the parameter "action" and return it as a String.
 * 
 * @return the parameter action
 */ 
    public String getAction() {
    		return this.getParameterAsString("action");
    }
    
/**
 * Get the value of the parameter "pipelineName" and return it as a String.
 * 
 * @return the parameter action
 */ 
public String getPipelineName() {
	return this.getParameterAsString("pipelineName");
}

public String getUsername() {
	return username;
}

public void setUsername(String username) {
	this.username=username;
}

/**
 * Add a parameter
 * 
 */ 
    private void setParameters(HttpServletRequest request) throws IOException  {

    	
    	// "ordinary" form (not multipart)
        Enumeration params = request.getParameterNames();
        setNormalParameters(params, request);
        
    	
    	String ctype=request.getContentType();
        if (ctype==null) ctype=""; 
        
        else ctype=ctype.trim().toLowerCase();

        if (ctype.toLowerCase().startsWith("multipart/form-data")) { // a
																		// multipart
																		// form
        
        	
        	MultipartRequest multiPartForm = new ServletMultipartRequest(request, 256*1024*1024); // 256MB max
        	
            // we deal will all the usuals parameters (not a file)
            params = multiPartForm.getParameterNames();
            
            setNormalParameters(params, multiPartForm);
            
            // we check now the parameters corresponding to file
            // we will also try to "unzip" on the fly ...
            // in fact we just take the first entry ...
            Enumeration fileParams = multiPartForm.getFileParameterNames(); 
            while  (fileParams.hasMoreElements()) {
           	String name=(String)fileParams.nextElement();
            	
            	InputStream value=multiPartForm.getFileContents(name);
             	
				if (value==null) continue;
				String fileName=multiPartForm.getFileSystemName(name);
				
				if (multiPartForm.getFileSize(name)==0) continue;
				
				String contentType=multiPartForm.getContentType(name);

				
				if (fileName.toLowerCase().indexOf("zip")!=-1)
				contentType="application/zip";
				else if (fileName.toLowerCase().indexOf("xml")!=-1)
				contentType="text/xml";
				
				if (contentType==null) {
				    contentType="unknown";
				}
				
				
			    Field field=new Field(value,contentType);
				field.setFilename(fileName);
			    
			    allParameters.put(name, field);

            } 
       
        }
        
        

        String sessionUsername=(String)session.getAttribute("username");
        
        if ((sessionUsername!=null) && (! sessionUsername.equals(""))) {
        	this.username=sessionUsername;
        } else {
        	this.username=request.getRemoteUser();
        	session.setAttribute("username",this.username);
        }
    }
    
    
  	private void setNormalParameters(Enumeration params, Object object) {
		while (params.hasMoreElements()) {
			
			
			
        	String name=(String) params.nextElement();
        	String value;
        	if (object instanceof HttpServletRequest) {
        		value=((HttpServletRequest)object).getParameter(name);
        	} else {
        		value=((MultipartRequest)object).getURLParameter(name);
        	}
        	
        	if (name.equals("batchArea")) {
        		parseBatchArea(value);		
        	} else {
	            Field field=new Field(value);
	            allParameters.put(name, field);
	        }
        }
  	}
      	
/**
 * Put the value of a form parameter as a String.
 * 
 * @param name
 *            name of the parameter
 * @param value
 *            value of this parameter
 */  
    public void putParameter(String name, Object value) {
    	// Object should be of type String or InputStream
    	allParameters.put(name, new Field(value));
    }
    
   
    
// SHOULD BE IMPROVED !!!
    private void parseBatchArea(String content)
    {
    	String delims = "\t\n\r\f=";
    	StringTokenizer tokenizer = new StringTokenizer(content, delims);
    	while (tokenizer.hasMoreTokens())
    	{
    		String fieldName = tokenizer.nextToken();
    		String fieldValue = tokenizer.nextToken();
    		Field field=new Field(fieldValue);
	        allParameters.put(fieldName, field);
    	} 	
    }

  /** Returns an iterator over parameter names */    
    public Iterator getIterator() {
    	return this.allParameters.keySet().iterator();
    }

/** Returns an iterator over parameter values */        
    public Iterator getFieldIterator() {
        return this.allParameters.values().iterator();
    }
/** Returns a debug list of contents of this object, in HTML */	
	public String toHtml() {
		String html="";
		html+="<h3>FormData: allParameters</h3><table border=1>";
		Iterator i=this.getIterator();
		while (i.hasNext()) {
        	html+="<tr><td>";
        	Object o=i.next();
			html+=o.toString()+"</td><td><PRE>"+((Field)allParameters.get(o)).toString()+"</PRE></td></tr>";
      	}
      	html+="</table>";
		return html;
	}
	/**
	 * Removes a parameter
	 * 
	 * @param parName
	 *            name of the parameter
	 */
	public void removeParameter(String parName) {
		allParameters.remove(parName);
	}
}
