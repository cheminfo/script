package org.cheminfo.script.action;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;

import javax.servlet.ServletContext;

import org.cheminfo.script.sse.SSEOutputs;
import org.cheminfo.script.utility.Data;
import org.cheminfo.script.utility.FileTreatment;
import org.cheminfo.script.utility.ServletUtilities;
import org.cheminfo.script.utility.URLFileManager;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class SSE extends Action {

	public void execute() {
		try {
			SSEOutputs outputs=null;
			response.setContentType("text/event-stream");
			response.setCharacterEncoding("UTF-8");

			OutputStream out = response.getOutputStream();
			if (homeDir!=null) {
				ServletContext context = this.httpServlet.getServletContext();
				if(context.getAttribute("SSE")==null){
					context.setAttribute("SSE", new HashMap<String,SSEOutputs>());
				}

				HashMap<String,SSEOutputs> hashMap = (HashMap<String,SSEOutputs>)context.getAttribute("SSE");
				if (! hashMap.containsKey(this.homeDir)) {
					hashMap.put(this.homeDir, new SSEOutputs());
				}
				outputs=hashMap.get(homeDir);
				outputs.add(out);
			}

			while(true){
				if(outputs==null || !outputs.contains(out)) break;
				outputs.sendEvent("touch", "");
				Thread.sleep(10000);
			}

		} catch (Exception e) {
			e.printStackTrace(System.out);
		}
	}
}
