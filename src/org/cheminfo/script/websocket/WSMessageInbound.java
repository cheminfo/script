package org.cheminfo.script.websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;

import org.apache.catalina.websocket.MessageInbound;
import org.apache.catalina.websocket.WsOutbound;
import org.json.JSONException;
import org.json.JSONObject;

public class WSMessageInbound extends MessageInbound{
	
	String token;
	
	public void sendMessage(String message){
		CharBuffer buffer = CharBuffer.wrap(message);
		try {
			getWsOutbound().writeTextMessage(buffer);
		} catch (IOException e) {
			WSManager.getInstance().deleteMessageInbound(this);
			System.out.println("WebSocket connection closed. Cannot send messages anymore.");
		}
	}
    
    @Override
    public void onOpen(WsOutbound outbound){
        try {
            System.out.println("Open Client.");
            outbound.writeTextMessage(CharBuffer.wrap("{\"type\":\"text\",\"content\":\"Connected to server\"}"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onClose(int status){
    	System.out.println("Close client.");
    	WSManager.getInstance().deleteMessageInbound(this);
    }

    @Override
    public void onTextMessage(CharBuffer cb) throws IOException{
    	
    	System.out.println("Received message : "+ cb);
    	
    	JSONObject parameter;
		try {
			parameter = new JSONObject(cb.toString());
		} catch (JSONException e) {
			parameter = new JSONObject();
			e.printStackTrace();
		}
    	
    	String type = parameter.optString("type","");
    	
    	if(type.equals("wsToken")){
    		this.token = parameter.optString("value","");
    	}
    	else{
    		sendMessage("Wrong type:"+parameter.toString());
    	}
    		
    }

    @Override
    public void onBinaryMessage(ByteBuffer bb) throws IOException{
    }
}