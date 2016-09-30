<?php
$title = 'Login Zugangsdaten gespeichert';
$pageId = 'editAccountBodyOk';
?>
<?php ob_start() ?>
	<div class="container form-small">
		<div id="editAccountAccept" class="form-horizontal">
			<h2 id="headline">Daten gespeichert:</h2>
			<?php
				if ($messages) {
					echo "<p id=\"editAccountError\" class=\"col-sm-offset-3 error messages\">" . join("<br />", $messages) . "</p>\n";
				}
			?>
			<div id="NameContainer" class="form-group">
				<label for="Name" class="col-sm-3 control-label">Name:</label>
				<div id="submittedName" class="col-sm-9"><?php echo $_POST['Name']; ?></div>
			</div>
			<div id="eMailContainer" class="form-group">
				<label for="eMail" class="col-sm-3 control-label">E-Mail:</label>
				<div id="submittedEMail" class="col-sm-9"><?php echo $_POST['eMail']; ?></div>
			</div>
			<div id="UsernameContainer" class="form-group">
				<label for="Username" class="col-sm-3 control-label">Anmeldename:</label>
				<div id="submittedUsername" class="col-sm-9"><?php echo $_POST['Username']; ?></div>
			</div>
			<div id="PasswordContainer" class="form-group">
				<label for="Password" class="col-sm-3 control-label">Passwort:</label>
				<div class="col-sm-9"><?php
					if ($_POST['Password'] == "" && $_POST['Password2'] == "") {
						echo "nicht geändert";
					} else {
						echo "*****";
					}
				?></div>
			</div>
			<div id="submitContainer" class="form-group">
				<div class="col-sm-offset-3 col-sm-9">
					<a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn btn-success inputWidth">zurück zum Start</a>
				</div>
			</div>
		</div>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted"; }?> editAccountAccept">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
