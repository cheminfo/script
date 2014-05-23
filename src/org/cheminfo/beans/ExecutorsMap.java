package org.cheminfo.beans;

import java.io.Serializable;
import java.util.HashMap;

import javax.faces.bean.ApplicationScoped;
import javax.faces.bean.ManagedBean;

import org.apache.tomcat.util.threads.ThreadPoolExecutor;



@ManagedBean(eager=true)
@ApplicationScoped
public class ExecutorsMap extends HashMap<String, ThreadPoolExecutor> implements Serializable{

	private static final long serialVersionUID = -6031070719027008525L;


	
}