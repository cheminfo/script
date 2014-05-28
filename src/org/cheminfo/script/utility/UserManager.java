package org.cheminfo.script.utility;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;

import com.sun.org.apache.regexp.internal.recompile;

public class UserManager {
	
	public enum LEVEL {
		ADMIN, LAB_ASSISTANT, STUDENT;
	}
	
	public static LEVEL getLevel(String homeDir){
		int count=0;
		for(char c: homeDir.toCharArray()){
			if(c=='@'){
				count++;
			}
		}
		if(count ==1){
			return LEVEL.ADMIN;
		}else if(count==2){
			return LEVEL.LAB_ASSISTANT;
		}else{
			return LEVEL.STUDENT;
		}
	}
	
	public static ThreadPoolExecutor getNewPool(String homeDir){
		int corePoolSize;
		int maximumPoolSize;
		long keepAliveTime;
		int queueSize;
		TimeUnit unit; 
		LEVEL userLvl = getLevel(homeDir);
		if (userLvl==LEVEL.ADMIN) {
			corePoolSize = 2;
			maximumPoolSize = 5;
			keepAliveTime = Integer.MAX_VALUE;
			unit = TimeUnit.DAYS;
			queueSize = 30;
		} else if (userLvl==LEVEL.LAB_ASSISTANT) {
			corePoolSize = 1;
			maximumPoolSize = 2;
			keepAliveTime = 120;
			unit = TimeUnit.SECONDS;
			queueSize = 10;
		} else {
			corePoolSize = 1;
			maximumPoolSize = 2;
			keepAliveTime = 120;
			unit = TimeUnit.SECONDS;
			queueSize = 5;
		}
		ThreadPoolExecutor executor = new ThreadPoolExecutor(corePoolSize,
				maximumPoolSize, keepAliveTime, unit,
				new ArrayBlockingQueue<Runnable>(queueSize));
		return executor;
	}
	
	
	public static int getHistoriqueSize(String homeDir){
		return 25;
	}
	
	public static long getTimeout(String homeDir){
		long timeout;
		LEVEL userLvl = getLevel(homeDir);
		if (userLvl==LEVEL.ADMIN) {
			timeout=1000*60*60*24*365;
		} else if (userLvl==LEVEL.LAB_ASSISTANT) {
			timeout=1000*60*60*5;
		} else {
			timeout=1000*60*5;
		}
		return timeout;
		//return 30000;
	}
}
