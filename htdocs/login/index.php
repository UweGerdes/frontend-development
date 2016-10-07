<?php
header('Content-Type: text/html; charset=utf-8');

include 'include/controllers.php';
include 'include/model.php';

$login = check_login();
$uri = preg_replace('/^\/[^\/]+/', '', $_SERVER["SCRIPT_NAME"]);
$query = $_SERVER['QUERY_STRING'];
$html = "";

if (preg_match("/^deleteAccount&username=testuser$/", $query)) {
	$html = delete_test_user_action();

} elseif ('/index.php' === $uri && 'lastUnseenMail' === $query) {
	// this is only for testing
	$html = last_unseen_mail_action();

} elseif (!$login['loginOk']) {

	if ('' === $query || 'logout=true' === $query) {
		$html = login_action($login);

	} elseif ('newAccount' === $query) {
		$html = new_account_action();

	} elseif (preg_match("/^newAccountConfirm&confirm=/", $query)) {
		$html = new_account_confirm_action(preg_replace('/newAccountConfirm&confirm=/', '', $query));

	} else {
		$html = "<html><head><title>404 not found: $query</title></head><body><h1>Error 404: $query</h1><p class=\"notLoggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
	}
} else {

	if ('' === $query) {
		$html = index_action($login['loginOk'], $login['lastLoginText'], $login['notConfirmed'], $login['messages']);

	} elseif ('editAccount' === $query) {
		$html = edit_account_action($login['loginOk'], $login['loginData'], $login['messages']);

	} elseif ('deleteAccount' === $query) {
		$html = delete_account_action($login['loginOk'], $login['loginData'], $login['messages']);

	} else {
		$html = "<html><head><title>404 not found: $query</title></head><body><h1>Error 404: $query</h1><p class=\"loggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
	}
}

echo $html.'<!-- complete -->';
?>
