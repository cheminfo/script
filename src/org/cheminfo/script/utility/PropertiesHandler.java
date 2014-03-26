package org.cheminfo.script.utility;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
/**
 * This class allow to initialize a variable
 * will  contain a define path in a file and
 * will  call in all the program
 * @author Luc patiny
 *
 */
public class PropertiesHandler {
	/**
	 * Define an object properties
	 */
 	private static Properties properties=new Properties();	// we have there the properties from the config file and temporary properties
	/**
	 * Define a boolean to know if the object properties
	 * is initialized or not
	 */
 	private static boolean initPropertiesHandler=false;
 	/**
 	 * Define a separator to write correctly path for file
 	 */
	public final static String SEPARATOR="/";

	// TODO we may move the propertiesFilename in this class and just call the getProperty from everywhere
	/**
	 * Creates a new PropertiesHandler instance with the name of the properties file
	 */
	public PropertiesHandler(String propertiesFilename) {
		initPropertiesHandler(propertiesFilename);
	}	
	
	/** This method returns the property value 
	 * @param property String which define the value that we want
	 * @param defaultValue
	 * @return the value of the property given in entry
	 */
	
	public static String getProperty(String property, String defaultValue) {
		if (initPropertiesHandler) {	
			return properties.getProperty(property, defaultValue);
		}
		return "";
	}

	
	/**
	 * This function allow to control if the objet properties
	 * is already instatiated or not
	 * @param propertiesFilename define the path of the properties file
	 * @return if the reading of the properties file is ok
	 */
	private boolean initPropertiesHandler(String propertiesFilename) {
	    try {
			if(!initPropertiesHandler) {
				// System.out.println("Loading property file: "+propertiesFilename);
				InputStream is = new FileInputStream(propertiesFilename);
				properties.load(is);
				initPropertiesHandler=true;
			}
		} catch (IOException e) {
			System.out.println("Property file not found: "+propertiesFilename);
			return false;
		}
		return true;
	}
}
