function replacer(key, value) {
	if (typeof value === 'string'){
		if(value.substr(0, 1)=='{'&&value.substr(value.length-1, 1)=='}')
			return json_parse(value,replacer);
	    if(value.substr(0, 1)=='['&&value.substr(value.length-1, 1)==']')
	    	return json_parse(value,replacer);
	}
	return value;
}