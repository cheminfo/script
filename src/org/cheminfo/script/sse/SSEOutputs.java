package org.cheminfo.script.sse;

import java.io.OutputStream;
import java.util.ArrayList;

import org.json.JSONObject;

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

	public void sendLog(JSONObject log) {
		sendEvent("logEvent", log.toString().replaceAll("\\\\[rn]", "<br>"));
	}
	
	public void sendClear(String SSEToken) {
		sendEvent("clearEvent","");
	}
}
