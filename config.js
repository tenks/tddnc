/* BEGIN CONFIGURATION FILE
 * Anywhere configuration options are needed, just require() this script.
 */

var config = {}

config.motd = "Message of the day!"; // message of the day; shows up in the top of the chat
config.autoaway_time = 0.1 //amount of time a user has to idle to trigger auto away (in minutes)
config.typing_time = 2000; // amount of time chat displays user as typing after last keypress
config.playback = 10; //number of messages that are played back on joining the chat

module.exports = config;
