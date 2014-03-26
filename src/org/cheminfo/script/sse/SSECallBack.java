package org.cheminfo.script.sse;

import org.cheminfo.function.scripting.callback.CallBack;
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
		if(type.equals("log"))
			logOutputs.sendLog(value.optString("description",""), value.optString("label",""), sseToken);
		else if(type.equals("clear"))
			logOutputs.sendClear(sseToken);
	}
	
}
