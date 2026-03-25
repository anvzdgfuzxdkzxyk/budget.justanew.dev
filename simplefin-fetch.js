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

const result = parseAccessUrl(accessUrl);
console.log(result);
