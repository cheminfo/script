/*
* $Header: /usr/local/cvs/cvsrep/script/src/org/cheminfo/script/utility/Digest.java,v 1.1 2013/07/24 14:35:15 lpatiny Exp $
*/

package org.cheminfo.script.utility;


import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Random;


public class Digest{
	
	public static String getUniqueID() {
		byte[] bytes=new byte[200];
		new Random().nextBytes(bytes);
		String date=new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(Calendar.getInstance().getTime());
		String theString=date+new String(bytes).replaceAll("[^a-zA-Z0-9]", "").substring(0,10);
		return theString;
	}

	public static String getDigest(byte[] toDigest) {
		if ((toDigest==null) || (toDigest.length==0)) return null;
		String digest="";
		try {				
			// we create a hash for the id
			MessageDigest algorithm = MessageDigest.getInstance("MD5");
			digest = Base64.encodeBytes(algorithm.digest(toDigest));
		} catch (NoSuchAlgorithmException e) {throw new RuntimeException (e.toString());}
		return digest;
	}
    
	public static String getDigest(String toDigest) {
		return getDigest(toDigest.getBytes());
	}
	
	public static String getUrlSafeDigest(String toDigest) {
		String toReturn=getDigest(toDigest).replaceAll("[^a-zA-Z0-9]","").substring(0,10);
	//	System.out.println("DIGEST: "+toDigest+" = "+toReturn);
		return toReturn;
	}
	
	public static void main (String args[]) throws UnsupportedEncodingException, NoSuchAlgorithmException {
		for (int i=0; i<500; i++) {
			System.out.println(Digest.getUniqueID());
		}
	}
	
}