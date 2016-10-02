<?php
header('Content-Type: text/html; charset=utf-8');

include 'include/controllers.php';
include 'include/model.php';

$login = check_login();
$uri = preg_replace('/(\/|\?.+)$/', '', str_replace($_SERVER["SCRIPT_NAME"], '', $_SERVER['REQUEST_URI']));
$query = $_SERVER['QUERY_STRING'];
$html = "";
if (!$login['loginOk']) {
	if ('' === $query ||
		'logout=true' === $query ||
		'/index.php' === $uri ||
		dirname($_SERVER["SCRIPT_NAME"]) === $uri) {
		$html = login_action($login);
	} elseif ('newAccount' === $query) {
		$html = new_account_action();
	} elseif (preg_match("/^newAccountConfirm&confirm=/", $query)) {
		$html = new_account_confirm_action(preg_replace('/newAccountConfirm&confirm=/', '', $query));
	} elseif (preg_match("/^deleteAccount&username=testuser$/", $query)) {
		$html = delete_test_user_action();
	} else {
		$html = "<html><head><title>404 not found: $query</title></head><body><h1>Error 404: $query</h1><p class=\"notLoggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
	}
} else {
	if ('' === $query ||
		'/index.php' === $uri ||
		dirname($_SERVER["SCRIPT_NAME"]) === $uri) {
		$html = index_action($login['loginOk'], $login['lastLoginText'], $login['notConfirmed'], $login['messages']);
	} elseif ('editAccount' === $query) {
		$html = edit_account_action($login['loginOk'], $login['loginData'], $login['messages']);
	} elseif ('deleteAccount' === $query) {
		$html = delete_account_action($login['loginOk'], $login['loginData'], $login['messages']);
	} elseif (preg_match("/^deleteAccount&username=testuser$/", $query)) {
		$html = delete_test_user_action();
	} else {
		$html = "<html><head><title>404 not found: $query</title></head><body><h1>Error 404: $query</h1><p class=\"loggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
	}
}

echo $html;
?>
