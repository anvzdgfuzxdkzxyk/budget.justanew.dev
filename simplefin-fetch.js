const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

accessUrl = process.env.SIMPLEFIN_ACCESS_URL


// Function to extract API endpoint, username and password from access url
function parseAccessUrl (accessUrl) {
	const [scheme, rest] = accessUrl.split('//'); // Removes "scheme" (https part)
	const [auth, hostRest] = rest.split('@'); // Splits via @ to seperate host + auth

	const [username, password] = auth.split(':'); // Splits via : to seperate username and password
	const url = `${scheme}//${hostRest}/accounts`; // Constructs accounts endpoint url

	return { url, username, password }; // Returns endpoint url, username and password as standard javascript object
}

// Function to retreive JSON data from API endpoint using previously generated username and password
async function fetchAccountData ({url, username, password}) {
	try {
		const response = await axios.get(url, { // Axios promise to get data from endpoint (JSON/error)
			auth: { username, password },
			params: { version: '2' } // Using 2026-03-19 v2 update, see https://www.simplefin.org/protocol.html#v2.0.0---2026-03-19
		});
		return response.data; // Returns json data
	} catch (error) { // For more information about errors check https://www.simplefin.org/protocol.html#get-accounts
		console.error('fetchAccountData Error: ', error.message);
		throw error;
	}
}

// Function to write JSON data to a file
function writeJsonToFile(data, filename) {
	try {
		const jsonString = JSON.stringify(data, null, 4); // 4-space indentation
		const filePath = path.resolve(filename);
		fs.writeFileSync(filePath, jsonString, 'utf-8'); // Don't need to close file because writeFileSync does this automatically
	} catch (error) {
		console.error('writeJsonToFile Error: ', error.message);
	}
}

async function main () { // Example main function just for debugging at this point
	const result = parseAccessUrl(accessUrl);
	console.log(result);
	const result2 = await fetchAccountData(result);
	console.log(result2);
	const filename = 'simplefin-latest.json'
	writeJsonToFile(result2, filename);
}

main()
