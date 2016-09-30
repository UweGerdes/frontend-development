<?php
$title = 'Login Zugang beantragt';
$pageId = 'newAccountBodyOk';
?>
<?php ob_start() ?>
	<div class="form-small" class="container">
		<div id="newAccountAccept" class="form-horizontal">
			<h3 id="headline">Vielen Dank für die Anmeldung</h3>
			<?php
				if ($messages) {
					echo "<p class=\"col-sm-offset-3 newAccountMessage messages\">".join("<br />", $messages)."</p>\n";
				}
				if ($sendSuccess) {
					echo "<p>Eine E-Mail mit einem Aktivierungslink wurde verschickt</p>\n";
				} else {
					echo "<p>Eine E-Mail mit einem Aktivierungslink konnte nicht verschickt werden</p>\n";
				}
			?>
			<div id="NameContainer" class="form-group">
				<label for="Name" class="col-sm-3 control-label">Name</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $_POST['Name']; ?></p></div>
			</div>
			<div id="eMailContainer" class="form-group">
				<label for="eMail" class="col-sm-3 control-label">E-Mail</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $_POST['eMail']; ?></p></div>
			</div>
			<div id="UsernameContainer" class="form-group">
				<label for="Username" class="col-sm-3 control-label">Anmeldename</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $_POST['Username']; ?></p></div>
			</div>
			<div id="PasswordContainer" class="form-group">
				<label for="Password" class="col-sm-3 control-label">Passwort</label>
				<div class="col-sm-9">*****</p></div>
			</div>
		</div>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted";} ?> newAccountAccept">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
