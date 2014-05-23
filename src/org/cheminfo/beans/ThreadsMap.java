package org.cheminfo.beans;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;

import javax.faces.bean.ApplicationScoped;
import javax.faces.bean.ManagedBean;



@ManagedBean(eager=true)
@ApplicationScoped
public class ThreadsMap extends HashMap<String, HashSet<Thread>> implements Serializable{

	private static final long serialVersionUID = -122283061348834617L;

	
}