/* eslint-env node */

if (process.env.NODE_ENV === "production") {
	module.exports = require("prodFile");
} 
else {
	module.exports = require("devFile");
}