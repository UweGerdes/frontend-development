<?php
$title = 'Bitte anmelden';
$pageId = 'loginBody';
?>
<?php ob_start() ?>
	<div class="form-small container">
		<form action="<?php echo $_SERVER['SCRIPT_NAME']; ?>" method="POST" accept-charset="utf-8" name="login"
			id="login" role="form" class="form-horizontal<?php if($_POST && $messages) {echo ' inputError';} ?>">
			<h2 id="headline">Anmelden</h2>
<?php
if ($_POST && $_POST['Username'] != "") {
	if ($notConfirmed) {
		echo "			<p id=\"loginError\" class=\"error\">Anmeldung fehlgeschlagen!</p>\n";
		echo "			<p id=\"notConfirmedError\">Zugang noch nicht aktiviert, bitte E-Mail-Eingang prüfen.</p>\n";
	} else {
		echo "			<p id=\"loginError\" class=\"error\">Anmeldung fehlgeschlagen!</p>\n";
	}
}
if ($messages) {
	echo "			<p class=\"messages\">" . join("<br />", $messages) . "</p>\n";
}
?>
			<input type="text" name="Username" class="input-block-level Username" placeholder="Benutzername" value="<?php if ($_POST && $_POST['Username'] && $_POST['Username'] != "") { echo $_POST['Username']; } ?>" />
			<input type="password" name="Password" class="input-block-level Password" placeholder="Passwort" submittedValue="<?php if ($_POST && $_POST['Password'] && $_POST['Password'] != "") { echo $_POST['Password']; } ?>" />
			<label id="rememberMe" class="checkbox rememberMe">
				<input type="checkbox" name="rememberMe" value="ja"<?php
				if ($_POST && array_key_exists('rememberMe', $_POST) && $_POST['rememberMe'] != "") {
					echo ' checked="checked"';
				} ?> />Auf diesem Computer angemeldet bleiben
			</label>
			<button name="submit" class="btn btn-large btn-primary" type="submit">Anmelden</button>
			<a href="<?php echo $htmlroot; ?>/index.php?newAccount" class="newAccountLink">Login beantragen</a>
		</form>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete login notLoggedIn">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
