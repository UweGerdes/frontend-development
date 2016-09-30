<?php
$title = 'Login Zugangsdaten gespeichert';
$pageId = 'editAccountBodyOk';
?>
<?php ob_start() ?>
	<div class="container form-small">
		<div id="editAccountAccept" class="loginform">
			<h2 id="headline">Daten gespeichert:</h2>
			<?php
				if ($messages) {
					echo "<p id=\"editAccountError\" class=\"error messages\">" . join("<br />", $messages) . "</p>\n";
				}
			?>
			<div id="NameContainer" class="control-group">
				<label for="Name" class="control-label">Name:</label>
				<div id="submittedName" class="controls"><?php echo $_POST['Name']; ?></div>
			</div>
			<div id="eMailContainer" class="control-group">
				<label for="eMail" class="control-label">E-Mail:</label>
				<div id="submittedEMail" class="controls"><?php echo $_POST['eMail']; ?></div>
			</div>
			<div id="UsernameContainer" class="control-group">
				<label for="Username" class="control-label">Anmeldename:</label>
				<div id="submittedUsername" class="controls"><?php echo $_POST['Username']; ?></div>
			</div>
			<div id="PasswordContainer" class="control-group">
				<label for="Password" class="control-label">Passwort:</label>
				<div class="controls"><?php
					if ($_POST['Password'] == "" && $_POST['Password2'] == "") {
						echo "nicht geändert";
					} else {
						echo "*****";
					}
				?></div>
			</div>
			<div id="submitContainer" class="control-group">
				<div class="controls">
					<a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn btn-success inputWidth">zurück zum Start</a>
				</div>
			</div>
		</div>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted"; }?> editAccountAccept">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
