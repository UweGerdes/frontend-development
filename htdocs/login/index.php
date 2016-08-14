<?php
header('Content-Type: text/html; charset=utf-8');

include 'include/controllers.php';
include 'include/model.php';

$login = check_login();
$uri = preg_replace('/(\/|\?.+)$/', '', str_replace($_SERVER["SCRIPT_NAME"], '', $_SERVER['REQUEST_URI']));
parse_str($_SERVER['QUERY_STRING'], $urlparams);
$html = "";
$httpStatusCode = "200";
if (!$login['loginOk']) {
	if ('' === $uri ||
		'/index.php' === $uri ||
		dirname($_SERVER["SCRIPT_NAME"]) === $uri) {
		$html = login_action($login);
	} elseif ('/newAccount' === $uri) {
		$html = new_account_action();
	} elseif ('/newAccountConfirm' === $uri) {
		$html = new_account_confirm_action();
	} else {
		$html = "<html><head><title>404 not found: $uri</title></head><body><h1>Error 404: $uri</h1><p class=\"notLoggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		$httpStatusCode = "404";
	}
} else {
	if ('' === $uri ||
		'/index.php' === $uri ||
		dirname($_SERVER["SCRIPT_NAME"]) === $uri) {
		$html = index_action($login['loginOk'], $login['lastLoginText'], $login['notConfirmed'], $login['messages']);
	} elseif ('/editAccount' === $uri) {
		$html = edit_account_action($login['loginOk'], $login['loginData'], $login['messages']);
	} elseif ('/deleteAccount' === $uri) {
		$html = delete_account_action($login['loginOk'], $login['loginData'], $login['messages']);
	} else {
		$html = "<html><head><title>404 not found: $uri</title></head><body><h1>Error 404: $uri</h1><p class=\"loggedIn\">".join("<br>", $login['messages'])."</p></body></html>";
		$httpStatusCode = "404";
	}
}

echo $html;
?>
