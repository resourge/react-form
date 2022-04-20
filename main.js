/* eslint-env node */

if (process.env.NODE_ENV === "production") {
	module.exports = require("devFile");
} 
else {
	module.exports = require("prodFile");
}