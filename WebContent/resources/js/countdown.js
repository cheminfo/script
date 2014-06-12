function countdownFunction(element, target_date) {
	var days, hours, minutes, seconds;
	// update the tag with id "countdown" every 1 second
	var myInterval = setInterval(function() {
		// find the amount of "seconds" between now and target
		var current_date = new Date().getTime();
		var seconds_left = (target_date - current_date) / 1000;

		if(seconds_left < 1){
			clearInterval(myInterval);//stop the loop
		}
		// do some time calculations
		days = parseInt(seconds_left / 86400);
		seconds_left = seconds_left % 86400;

		hours = parseInt(seconds_left / 3600);
		seconds_left = seconds_left % 3600;

		minutes = parseInt(seconds_left / 60);
		seconds = parseInt(seconds_left % 60);
		element.text(days + "d, " + hours + "h, " + minutes + "m, " + seconds
				+ "s");
		//console.log(days + "d, " + hours + "h, " + minutes + "m, " + seconds + "s")
	}, 1000);
}