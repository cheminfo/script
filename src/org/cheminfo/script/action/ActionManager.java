package org.cheminfo.script.action;



public class ActionManager {


	private final static String STEP_PACKAGE_NAME = "org.cheminfo.script.action.";	

/**
 * Returns a <code>Action</code> object for the given action name
 * or <code>DefaultAction</code> if not found.
 */

    public static Action getInstance(String className) {

        // Note that if the Step class is in a subpackage, it won't work

        String fullClassName=STEP_PACKAGE_NAME+className;

        // the class of the corresponding Action

        try {
            Class<?> actionClass = Class.forName(fullClassName);
            return (Action)(actionClass.newInstance());

        } catch (Exception e) {
        	System.out.println (e.toString());
            return null;
        }
    }
}

