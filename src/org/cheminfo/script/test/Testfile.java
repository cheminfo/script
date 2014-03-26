package org.cheminfo.script.test;

import java.io.File;
import java.io.IOException;

public class Testfile {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		File test=new File("C:/script/../script/script.properties");
		
		try {
			System.out.println(test.getCanonicalPath().replaceAll("\\\\", "/"));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
