package org.cheminfo.script.sse;

import java.io.OutputStream;
import java.util.ArrayList;

public class SSEOutputs extends ArrayList<OutputStream> {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public void sendEvent(String eventName, String eventValue){
		ArrayList<OutputStream> toDelete = null;
		for (OutputStream out : this) {
			try{
				out.write(("event: "+eventName+"\n").getBytes("UTF-8"));
				out.write(("data: "+eventValue+"\n\n").getBytes("UTF-8"));
				out.flush();
			} catch(Exception e) {
				if(toDelete==null) toDelete = new ArrayList<OutputStream>();
				toDelete.add(out);
			}
		}
		if(toDelete != null) this.removeAll(toDelete);
	}

	public void sendLog(String value, String label, String SSEToken) {
		sendEvent("logEvent", "{\"description\":\""+value.replace("\"", "\\\"").replaceAll("[\r\n]", "<br>")+"\",\"label\":\""+label+"\",\"SSEToken\":\""+SSEToken+"\"}");
	}
	
	public void sendClear(String SSEToken) {
		sendEvent("clearEvent","");
	}
}
