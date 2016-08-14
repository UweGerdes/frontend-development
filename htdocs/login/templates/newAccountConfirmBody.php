<?php
$pageId = 'newAccountConfirmBody';
?>
<?php ob_start() ?>
	<div class="container" class="form-small">
<?php
if (!$newAccountOk) {
$title = 'Login Zugang nicht bestätigt';
?>
		<div id="newAccountFail" class="form-horizontal">
			<h3 id="headline" confirm="<?php echo $_GET['confirm']; ?>">Keine gültige Bestätigung</h3>
<?php
if ($messages) {
	echo "			<p id=\"newAccountConfirmError\" class=\"error messages\">" . join("<br />\n", $messages) . "</p>\n";
}
?>
			<div class="text-center">
				<a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn btn-info inputWidth">zur Anmeldeseite</a>
			</div>
		</div>
<?php
} else { # newAccountOK
$title = 'Login Zugang bestätigt';
?>
		<div id="newAccountConfirm" class="form-horizontal">
			<h3 id="headline">Bestätigung der Freischaltung</h3>
<?php
if ($messages) {
	echo "			<p class=\"messages\">" . join("<br />\n", $messages) . "</p>";
}
?>
			<p>Zur Kontrolle hier noch einmal die eingegebenen Daten:</p>
			<div id="NameContainer" class="control-group">
				<label for="Name" class="control-label">Name</label>
				<div class="controls"><?php echo $loginData['Name']; ?></div>
			</div>
			<div id="eMailContainer" class="control-group">
				<label for="eMail" class="control-label">E-Mail</label>
				<div class="controls"><?php echo $loginData['eMail']; ?></div>
			</div>
			<div id="UsernameContainer" class="control-group">
				<label for="Username" class="control-label">Anmeldename</label>
				<div class="controls"><?php echo $loginData['Username']; ?></div>
			</div>
			<div id="PasswordContainer" class="control-group">
				<label for="Password" class="control-label">Passwort</label>
				<div class="controls">*****</div>
			</div>
			<div id="submitContainer" class="control-group">
				<div class="controls">
					<a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn btn-success inputWidth">zur Anmeldeseite</a>
				</div>
			</div>
			</div>
<?php
} # newAccountOK
?>
	</div>
	<!-- /container -->
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($newAccountOk) { echo " newAccountConfirm";} ?>">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
