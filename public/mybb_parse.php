<?php 

define("IN_MYBB", 1);
include "global.php";

/* get the variables */
$username = $mybb->user['username'];

if($mybb->usergroup['cancp']) {
	$username_color = 'purple'; // format? hex?
	$user_group = 'admin';
}
else if($mybb->usergroup['issupermod']) {
	$username_color = 'purple';
	$user_group = 'mod';
}
else {
	$username_color = 'black';
	$user_group = 'user';
}

/* build the array */
$json = array(
					'username'			=> $username,
					'username_color' 	=> $username_color,
					'user_group'			=> $user_group
);

/* print it */
$json = json_encode($json);
print_r($json);

?>