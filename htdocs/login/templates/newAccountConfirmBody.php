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
	echo "			<p id=\"newAccountConfirmError\" class=\"col-sm-offset-3 error messages\">" . join("<br />\n", $messages) . "</p>\n";
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
	echo "			<p class=\"col-sm-offset-3 messages\">" . join("<br />\n", $messages) . "</p>";
}
?>
			<p>Zur Kontrolle hier noch einmal die eingegebenen Daten:</p>
			<div id="NameContainer" class="form-group">
				<label for="Name" class="col-sm-3 control-label">Name</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData['Name']; ?></p></div>
			</div>
			<div id="eMailContainer" class="form-group">
				<label for="eMail" class="col-sm-3 control-label">E-Mail</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData['eMail']; ?></p></div>
			</div>
			<div id="UsernameContainer" class="form-group">
				<label for="Username" class="col-sm-3 control-label">Anmeldename</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData['Username']; ?></p></div>
			</div>
			<div id="PasswordContainer" class="form-group">
				<label for="Password" class="col-sm-3 control-label">Passwort</label>
				<div class="col-sm-9"><p class="form-control-static">*****</p></div>
			</div>
			<div id="submitContainer" class="form-group">
				<div class="col-sm-offset-3 col-sm-9">
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
