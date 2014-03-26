package org.cheminfo.script.websocket;

import javax.servlet.http.HttpServletRequest;

import org.apache.catalina.websocket.StreamInbound;
import org.apache.catalina.websocket.WebSocketServlet;


public class WSRun extends WebSocketServlet {

	private static final long serialVersionUID = 1L;
	
    public StreamInbound createWebSocketInbound(String protocol,HttpServletRequest request){

    	WSMessageInbound mm = new WSMessageInbound() ;
    	
    	WSManager manager = WSManager.getInstance();
    	manager.addMessageInbound(mm);
    	
    	return mm ;
    }
}
