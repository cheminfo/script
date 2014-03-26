//Define a function
function htmlColor(batch){
	//MD5 function
	//See http://pajhome.org.uk/crypt/md5 for more info.
	var md5 = hex_md5(batch);
	return "#"+md5.substring(22,23)+md5.substring(5,6)+md5.substring(17,8);
}

//Use this function
var myColorforBatch = htmlColor(72342);//<==Define a html color for a batch
var myLighterColor = lighterColor(myColorforBatch, 0.25);

var newColor1=lighterColor('#013ADF', 0.25);
var newColor2=darkerColor('#013ADF', 0.58);



