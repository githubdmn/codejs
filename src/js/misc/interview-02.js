/*
 * In the JavaScript file, write a program to perform a GET request
 * using https.get  on the route
 * https://coderbyte.com/api/challenges/json/age-counting
 * which contains a data key and the value is a string
 *  which contains items in the format: key=STRING, age=INTEGER.
 *  Your goal is to count how many items exist that have an age equal to 32.
 *  Then you should create a write stream to a file called output.txt
 *  and the contents should be the key values (from the json) each on a
 *  separate line in the order they appeared in the json file
 *  (the file should end with a newline character on its own line).
 *  Finally, then output the SHA1 hash of the file.
 */

const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const options = {
	hostname: 'coderbyte.com',
	path: '/api/challenges/json/age-counting',
	method: 'GET',
};

const req = https.get(options, (res) => {
	let data = '';

	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		const response = JSON.parse(data);
		const items = response.data.split(', ');

		const filteredItems = items.filter((item) => {
			const [, age] = item.split('=');
			return Number(age) === 32;
		});

		const keyValues = filteredItems.map((item) => item.split('=')[1]);
		const output = keyValues.join('\n') + '\n';

		fs.writeFile('output.txt', output, (err) => {
			if (err) {
				console.error('Error writing to file:', err);
			} else {
				console.log('Data written to output.txt');
				const hash = crypto.createHash('sha1');
				const stream = fs.createReadStream('output.txt');

				stream.on('data', (data) => {
					hash.update(data);
				});

				stream.on('end', () => {
					const sha1Hash = hash.digest('hex');
					console.log('SHA1 Hash:', sha1Hash);
				});
			}
		});
	});
});

req.on('error', (error) => {
	console.error('Error making request:', error);
});

req.end();

/*
 * This program performs a GET request to the specified route and
 * collects the response data. It then parses the response as JSON
 * and extracts the items from the data key. It filters the items
 * to include only those with an age equal to 32.
 * It extracts the values (key values) from these filtered items.
 * The program writes the key values to the output.txt
 * file using the fs.writeFile() function. It then calculates the SHA1
 * hash of the file using the crypto.createHash() function
 * and the fs.createReadStream() function to read the file.
 * The SHA1 hash is printed to the console.
 */
