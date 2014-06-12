package org.cheminfo.script.utility;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class ScriptInfo {
	private long launchTime;
	private long startTime;
	private String path;
	private String status = "waiting";
	private long endTime;
	private long timeout;
	private String viewURL;
	private String dataURL;

	public Date getLaunchTime() {
		return new Date(launchTime);
	}

	public void setLaunchTime(long launchTime) {
		this.launchTime = launchTime;
	}

	public Date getStartTime() {
		return new Date(startTime);
	}

	public void setStartTime(long launchTime) {
		this.startTime = launchTime;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Date getEndTime() {
		if (endTime == 0) {
			return null;
		} else {
			return new Date(endTime);
		}
	}

	public void setEndTime(long endTime) {
		this.endTime = endTime;
	}
	
	public long getTimeout() {
		return timeout;
	}

	public void setTimeout(long timeout) {
		this.timeout = timeout;
	}
	
	public String getViewURL() {
		return viewURL;
	}
	
	public void setViewURL(String viewURL) {
		this.viewURL = viewURL;
	}

	public String getDataURL() {
		return dataURL;
	}

	public void setDataURL(String dataURL) {
		this.dataURL = dataURL;
	}


	public String getRunTime() {
		if (endTime != 0) {
			Date date = new Date(endTime - startTime);
			DateFormat formatter = new SimpleDateFormat("HH:mm:ss:SSS");
			formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
			return formatter.format(date);
		} else {
			Date date = new Date(System.currentTimeMillis() - startTime);
			DateFormat formatter = new SimpleDateFormat("HH:mm:ss:SSS");
			formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
			return formatter.format(date);
		}

	}
	
	public String getTimeLeft(){
		if(endTime==0){
				long timeLeft= (launchTime+timeout)-System.currentTimeMillis();
				Date d= new Date(timeLeft>0?timeLeft:0);
				return d.toString();
		}else return "00:00:00";
	}
	
	public String getRunUntil(){
		if(endTime!=0){
			return "";
		}else{
			return ""+(launchTime+timeout);
		}
	}
	
	
//	public String getTimeLeft(){
//		if(endTime==0){
//			if(timeout>1000*60*60*24){
//				return "> "+ (timeout%(1000*60*60*24))+" day";
//			}else{
//				long timeLeft= (launchTime+timeout)-System.currentTimeMillis();
//				Date d= new Date(timeLeft>0?timeLeft:0);
//				DateFormat formatter = new SimpleDateFormat("HH:mm:ss");
//				formatter.setTimeZone(TimeZone.getTimeZone("GMT"));
//				return formatter.format(d);
//			}
//		}else return "00:00:00";
//	}
}
