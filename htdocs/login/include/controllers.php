<?php
require_once 'config.php';

function login_action($login) {
	$html = render_template('templates/loginBody.php', $login);
	return $html;
}

function index_action($loginOk, $lastLoginText, $notConfirmed, $messages) {
	$result = array('lastLoginText' => $lastLoginText);
	$html = render_template('templates/indexBody.php', $result);
	return $html;
}

function new_account_action() {
	$result = new_user();
	if (!$result['newAccountOk']) {
		$html = render_template('templates/newAccountBody.php', $result);
	} else {
		$html = render_template('templates/newAccountBodyOk.php', $result);
	}
	return $html;
}

function new_account_confirm_action($confirmString) {
	$result = confirm_new_user($confirmString);
	$html = render_template('templates/newAccountConfirmBody.php', $result);
	return $html;
}

function edit_account_action($loginOk, $loginData, $messages) {
	$result = edit_user($loginData);
	if (!$result['editAccountOk']) {
		$html = render_template('templates/editAccountBody.php', $result);
	} else {
		$html = render_template('templates/editAccountBodyOk.php', $result);
	}
	return $html;
}

function delete_account_action($loginOk, $loginData, $messages) {
	$result = delete_user($loginData);
	if (!$result['deleteAccountOk']) {
		$html = render_template('templates/deleteAccountBody.php', $result);
	} else {
		$html = render_template('templates/deleteAccountBodyOk.php', $result);
	}
	return $html;
}

function delete_test_user_action() {
	$result = delete_test_user();
	$html = render_template('templates/deleteAccountBodyOk.php', $result);
	return $html;
}

// helper function to render templates
function render_template($path, array $args) {
	global $htmlroot;
	extract($args);
	ob_start();
	require $path;
	$html = ob_get_clean();
	return $html;
	}

?>
