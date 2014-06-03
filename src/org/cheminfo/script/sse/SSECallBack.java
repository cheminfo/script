package org.cheminfo.script.sse;

import org.cheminfo.function.scripting.callback.CallBack;
import org.json.JSONException;
import org.json.JSONObject;

public class SSECallBack extends CallBack {
	
	SSEOutputs logOutputs;
	String sseToken;

	public SSECallBack(String sseToken, SSEOutputs logOutputs) {
		this.logOutputs = logOutputs;
		this.sseToken = sseToken;
	}

	public void callback(JSONObject entry) {
		String type = entry.optString("type");
		JSONObject value = null;
		if(type != null)
			value = entry.optJSONObject("value");
		if(type.equals("log")) {
			try {
			logOutputs.sendLog(new JSONObject().put("description", value.get("description")).put("label", value.get("label")).put("SSEToken", sseToken));
			} catch(JSONException e) {
				e.printStackTrace();
			}
		}
		else if(type.equals("clear"))
			logOutputs.sendClear(sseToken);
	}
	
}
