/*
 * In the JavaScript file, write a program to perform
 * a GET request using https.get on the route
 * https://coderbyte.com/api/challenges/json/rest-get-simple
 * and then print to the console the hobbies property
 * in the following format: ITEM1, ITEM2, ...
 */

const https = require('https');

const options = {
	hostname: 'coderbyte.com',
	path: '/api/challenges/json/rest-get-simple',
	method: 'GET',
};

const req = https.get(options, (res) => {
	let data = '';

	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		const response = JSON.parse(data);
		if (response.hasOwnProperty('hobbies')) {
			const hobbies = response.hobbies.join(', ');
			console.log(hobbies);
		} else {
			console.log('Hobbies not found');
		}
	});
});

req.on('error', (error) => {
	console.error('Error making request:', error);
});

req.end();

/*
 * 'data' event and concatenated into the data variable.
 * When the response ends, the data is parsed as JSON,
 * and the presence of the hobbies property is checked.
 * If it exists, the hobbies are joined into a comma-separated
 * string and printed to the console. If the hobbies property
 * is not found, a message indicating so is printed.
 * In case of any errors during the request,
 * an error message is printed to the console.
 *
 */
