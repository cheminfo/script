package org.cheminfo.script.websocket;

import java.util.ArrayList;

public class WSManager {
	
	private static WSManager instance = null;
	private static ArrayList<WSMessageInbound> mmiList = new ArrayList<WSMessageInbound>();
	
	private WSManager(){
	}
	
	public static synchronized WSManager getInstance(){
		if (instance==null){
			instance=new WSManager();
		}
		return instance;
	}
	
	public void addMessageInbound(WSMessageInbound inbound){
		mmiList.add(inbound);
	}
	
	public void deleteMessageInbound(WSMessageInbound inbound){
		mmiList.remove(inbound);
	}
	
	public boolean textToToken(String text, String token){
		return this.messageToToken("{\"type\":\"text\",\"content\":\""+text+"\"}", token);
	}
	
	public boolean jsonToToken(String json, String token){
		return this.messageToToken("{\"type\":\"json\",\"content\":"+json+"}", token);
	}
	
	private boolean messageToToken(String message, String token){
		try{
			for(WSMessageInbound mmib: mmiList){
				if(mmib.token.equals(token)){
					mmib.sendMessage(message);
					return true;
				}
			}
			return false;
		}
		catch(Exception e){
			return false;
		}
	}

}
