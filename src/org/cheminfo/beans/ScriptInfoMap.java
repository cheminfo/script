package org.cheminfo.beans;

import java.io.Serializable;
import java.util.HashMap;

import javax.faces.bean.ApplicationScoped;
import javax.faces.bean.ManagedBean;

import org.cheminfo.script.utility.CircularFifoQueue;
import org.cheminfo.script.utility.ScriptInfo;



@ManagedBean(eager=true)
@ApplicationScoped
public class ScriptInfoMap extends HashMap<String,CircularFifoQueue<ScriptInfo>> implements Serializable{


	private static final long serialVersionUID = -7833586893489632595L;



	
}