/* BEGIN CONFIGURATION FILE
 * Anywhere configuration options are needed, just require() this script.
 */

var config = {}

config.motd = "Message of the day!"; // message of the day; shows up in the top of the chat
config.autoaway = 15 //amount of time a user has to idle to trigger auto away (in minutes)

module.exports = config;