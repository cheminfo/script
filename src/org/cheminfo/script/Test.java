package org.cheminfo.script;

import java.net.URLClassLoader;

import org.cheminfo.function.scripting.ScriptingInstance;
import org.json.JSONObject;

public class Test {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		ScriptingInstance interpreter = new ScriptingInstance("/usr/local/script/plugins/",(URLClassLoader) ClassLoader.getSystemClassLoader());
		interpreter.setSafePath("./");
		JSONObject result=null;

		String script="jexport('dd',mkdir('jjj'));";/*var table='1	1H	2			1	2	d	5	3	d	15\\n';";
		script+="table+='2	1H	2.02			1	3	d	3\\n';";
		script+="table+='3	1H	4			1';";
		script+="var spectraData = SD.simulateNMRSpectrum(table,{from:0,to:10,linewidth:1,maxClusterSize:9,nbPoints:16*1024,scale:'PPM'});";
		script+="spectraData.fourierTransform();";
		script+="jexport('spectrum',spectraData.toJcamp(,'DIFDUP',1,'SIMPLE',[]),'jcamp');";
		script+="var treeComp = Distance.getComparator({'name':'Tree2Similarity','minWindow':16});";
		script+="var map=spectraData.getEquallySpacedDataInt(0, 10, 1024);";
		script+="var mm = treeComp.getMap(map,1);";
		script+="jexport('tree',mm.toString())";
		
		/*String script="var t=0;jexport('t',t);";
		script+="var treeComp = Distance.getComparator({'name':'Tree2Similarity','minWindow':16});";
		script+="var table+='1	1H	2			1	2	d	5	3	d	15\\n';";
		script+="table+='2	1H	2.02			1	3	d	3\\n';";
		script+="table+='3	1H	4			1';";
		script+="var spectraData = SD.simulateNMRSpectrum(table,{from:0,to:10,linewidth:1,maxClusterSize:9,nbPoints:16*1024,scale:'PPM'});";
		*/
		result = interpreter.runScript(script);
		
		System.out.println(result);	
		
	}

}
