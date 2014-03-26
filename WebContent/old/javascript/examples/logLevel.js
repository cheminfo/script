/* This example shows how to control the verbosity level of your script.
All the classes that extends 'org.cheminfo.function.Function' can store log
information using the methods:
--appendError("caller","This is an error message!");
--appendWarning("caller","This is a warning message!");
--appendInfo("caller","This is an info message!");
You are be able to know the verbosity level on your java code,
by checking the variable: org.cheminfo.function.Function.logLevel*/
//LOGLEVEL=0;No log messages
//LOGLEVEL=1;*'SEVERE' and 'error' messages are displayed.(Default)
//LOGLEVEL=2;'SEVERE', 'error' and 'warning' messages are displayed.
//LOGLEVEL=3;'SEVERE', 'error', 'warning' and 'info' messages are displayed.
logLevel(3);
clearLog();//Remove previous log messages
var k=ChemCalc.test('');