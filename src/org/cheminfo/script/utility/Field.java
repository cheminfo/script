/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/Field.java,v 1.1 2013/07/24 14:35:15 lpatiny Exp $
*/
package org.cheminfo.script.utility;
/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/Field.java,v 1.1 2013/07/24 14:35:15 lpatiny Exp $
*/

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;


 /**
* FieldData is designed to store a value that may be a String or an
* InputStream as well as the mimeType of this value.
* 
* The main reason of the existence of this class is to be able to keep
* in memory a value containing a String or an InputStream.
* There are 2 fields in this Object :<ul>
* <li>fieldValue: contains either the String or the InputStream
* <li>mimeType: a String containing the mimeType of the fieldValue
* </ul>
*
* @author	Michal Krompiec
* @author	Luc Patiny
*/

public class Field{
	
    private Object fieldValue; 	
    private String mimeType="";
    private String filename="";
    private String streamValue=null;
	final static String DEFAUT_MIME_TYPE=null;

/**
* Create a new FieldData and set the fieldValue, the mimeType is by default "text/plain".
* 
* @param fieldValue		the value of the field
*/ 
    public Field(String fieldValue) {
  	    this.fieldValue=new String(fieldValue);
  	    mimeType=DEFAUT_MIME_TYPE;
    }
    
/**
* Create a new FieldData and set the fieldValue, the mimeType is set to the value of mimeType.
* 
* @param fieldValue		the value of the field
* @param mimeType	the mimeType of the value
*/ 
    public Field(Object fieldValue, String mimeType) {
        this.fieldValue=fieldValue;
        this.mimeType=mimeType;
    }
    
/**
* Create a new FieldData and set the fieldValue, the mimeType is by default empty.
* 
* @param fieldValue		the value of the field
*/         
    public Field(Object fieldValue) {
        this.fieldValue=fieldValue;
        mimeType=DEFAUT_MIME_TYPE;
    }
    
/**
* Returns the value of the "fieldValue" (String or InputStream).
* 
* @return the value of the field
*/  
    public Object getValue() {
        return fieldValue;
    }
    
/**
* Returns the mimeType of the "fieldValue".
* 
* @return the mimeType
*/  
    public String getMimeType() {
        return mimeType;
    }
    
    public String getFilename() {
	return filename;
}

public void setFilename(String filename) {
	this.filename = filename;
}

	/**
* Set the mimeType of the "fieldValue".
*/  
    public void setMimeType(String mimeType) {
        this.mimeType=mimeType;
    }
    
    
	/**
	* Returns true if the size is greater than 0 or an existing InputStream.
	* 
	* @return true if size greater than 0
	*/      
    public boolean isNotNull() {
    	if (fieldValue==null) return false;
    	if (fieldValue instanceof InputStream) {
    		return true;
    	}
        return (fieldValue.toString().length()>0);
    }

	/**
	* Returns true if it is an InputStream. This function will be usefull
	* to check for the mimetype. If it is a stream the mimetype can
	* be stored transparently in a field call _fieldNameMimeType.
	* 
	* @return true if size greater than 0
	*/      
    public boolean isStream() {
    	if (fieldValue instanceof InputStream) {
    		return true;
    	}
        return false;
    }


/**
* Set the value of the field data (the fieldValue).
* 
* fieldValue value of the FieldData
*/      
    public void setValue(Object fieldValue) {
    	this.fieldValue=fieldValue;
    }
    
    
/**
* Same as "toString".
* 
* @return the value of the field as a String, null if the field is null.
*/      
    public String getValueAsString() {
    	if (fieldValue==null) return null;
    	if (fieldValue instanceof InputStream) {
    		return getInputStreamAsString();
    	}
        return fieldValue.toString();
    }

/**
* Returns the value where <, > and & are converted;
* 
* @return the value of the field as a String, null if the field is null.
*/      
    public String getValueAsXml() {
    	if (fieldValue==null) return null;
    	if (fieldValue instanceof InputStream) {
    		return "File, content type is "+mimeType;
    	}
    	return fieldValue.toString().replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
    }
    



/**
* @return the value of the field as Integer, null if it can not be converted
*/      
    public Integer getValueAsInteger() {
    	if (fieldValue==null) return null;
    	if (fieldValue instanceof InputStream) 
            return null;
        try {
        	return Integer.valueOf(fieldValue.toString());
        } catch (Exception e) {return null;}
    }
    
/**
* @return the value of the field as Double, null if it can not be converted
*/      
    public Double getValueAsDouble() {
    	if (fieldValue==null) return null;
    	if (fieldValue instanceof InputStream) 
            return null;
        try {
        	return Double.valueOf(fieldValue.toString());
        } catch (Exception e) {return null;}
    }
    
    
/**
* Returns the value of the field as an InputStream
* 
* @return the value of the field as a String.
*/      
    public InputStream getValueAsInputStream() {
    	if (fieldValue instanceof InputStream) {
    		try {
				return this.getInputStreamCopy();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    	}
    	ByteArrayInputStream inputStream=new ByteArrayInputStream(((String)fieldValue).getBytes());
        return inputStream;
    }
    
    /**
    * Returns the value of the field as an OutputStream
    * 
    * @return the value of the field as a String.
    */      
        public OutputStream getValueAsOutputStream() {
        	if (fieldValue instanceof OutputStream) return (OutputStream)fieldValue;
        	ByteArrayOutputStream inputStream=new ByteArrayOutputStream();
            return inputStream;
        }
    
    
      
    private byte[] bytes=null;
    
    
/**
 * Copies the current field value to a byta array and returns a ByteArrayInputStream 
 * based on the array.
 */
    public InputStream getInputStreamCopy() throws IOException {
        if (!(fieldValue instanceof InputStream)) return getValueAsInputStream();
        if (bytes!=null) {
            return new ByteArrayInputStream(bytes);
        }
        InputStream is=(InputStream)fieldValue;
        ByteArrayOutputStream baos=new ByteArrayOutputStream(); 
        int howMany=0;
        int BUFFER=16*1024;
        byte[] chunk=new byte[BUFFER];
        while((howMany = is.read(chunk, 0,BUFFER)) != -1) {
            baos.write(chunk, 0, howMany);
        }
        bytes=baos.toByteArray();
        fieldValue=new ByteArrayInputStream(bytes);
        return new ByteArrayInputStream(bytes);
    }
/**
 * Converts the field value to a byte array and returns it.
 */
    public byte[] getAsByteArray() throws IOException {
        if (!(fieldValue instanceof InputStream)) 
        		return fieldValue.toString().getBytes();
        if (bytes!=null) {
            return bytes;
        }
        InputStream is=(InputStream)fieldValue;
        ByteArrayOutputStream baos=new ByteArrayOutputStream(); 
        int howMany=0;
        int BUFFER=16*1024;
        byte[] chunk=new byte[BUFFER];
        while((howMany = is.read(chunk, 0,BUFFER)) != -1) {
            baos.write(chunk, 0, howMany);
        }
        bytes=baos.toByteArray();
        fieldValue=new ByteArrayInputStream(bytes);
        return bytes;
    }
    	
    
/**
* trim the value of the field (if it is a String)
*/      
    public void trim() {
    	if (fieldValue!=null)
	    	if (fieldValue instanceof String) {
	    		fieldValue=((String)fieldValue).trim();
	   	}
    }
    
    
    private String getInputStreamAsString() {
    	if (streamValue!=null) return streamValue;
 		try {
			streamValue=Convert.inputStreamToString(getInputStreamCopy());
		} catch (Exception e) {   			
			streamValue="File, content type is "+mimeType;
		} 
		return streamValue; 	
    }
    
    
/**
* Returns the value of the "fieldValue" as a String. If it is an InputStream,
* the value returned is "File, content type is " mimeType. If it is null the
* value is an empty String.
* 
* @return the value of the field as a String.
*/      
    @Override
	public String toString() {
    	if (fieldValue==null) return "";
        if (fieldValue instanceof InputStream) 
    		return getInputStreamAsString();
        else return fieldValue.toString();
    }
    
    public String toDebug() {
    	if (fieldValue==null) return "";
    	// we don't display the stream value because this consume the stream ...
        if (fieldValue instanceof InputStream) 
    		return "A STREAM";
        else return fieldValue.toString();
    }
    
}	

