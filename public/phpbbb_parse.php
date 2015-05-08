<?php
//phpBB includes etc.
define('IN_PHPBB', true);
$phpbb_root_path = (defined('PHPBB_ROOT_PATH')) ? PHPBB_ROOT_PATH : '../../';
$phpEx = substr(strrchr(__FILE__, '.'), 1);
include($phpbb_root_path . 'common.' . $phpEx);

$user->session_begin();
$auth->acl($user->data);

$user->setup();
$user_id = $user->data['user_id'];

if($user_id == ANONYMOUS) {
	die('You need to be logged into the forum to use this chat');
	//TODO catch this and route it to a nicely formatted error page
}

//setup all values we need from user object
$username = $user->data['username'];
$username_color = $user->data['user_colour']; //colour.. fucking britbongs i swear	
$user_group = $user->data['group_id'];

if($user_group == 5)
	$user_group = 'admin';
else if($user_group == 4)
	$user_group = 'mod';
else
	$user_group = 'user';

$json = array(
					'username' 				=> $username,
					'username_color' 	=> $username_color,
					'user_group'				=> $user_group
);

echo json_encode($json);
?>