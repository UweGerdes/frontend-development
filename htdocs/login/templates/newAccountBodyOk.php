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
					echo "<p class=\"newAccountMessage messages\">".join("<br />", $messages)."</p>\n";
				}
				if ($sendSuccess) {
					echo "<p>Eine E-Mail mit einem Aktivierungslink wurde verschickt</p>\n";
				} else {
					echo "<p>Eine E-Mail mit einem Aktivierungslink konnte nicht verschickt werden</p>\n";
				}
			?>
			<div id="NameContainer" class="control-group">
				<label for="Name" class="control-label">Name</label>
				<div class="controls"><?php echo $_POST['Name']; ?></div>
			</div>
			<div id="eMailContainer" class="control-group">
				<label for="eMail" class="control-label">E-Mail</label>
				<div class="controls"><?php echo $_POST['eMail']; ?></div>
			</div>
			<div id="UsernameContainer" class="control-group">
				<label for="Username" class="control-label">Anmeldename</label>
				<div class="controls"><?php echo $_POST['Username']; ?></div>
			</div>
			<div id="PasswordContainer" class="control-group">
				<label for="Password" class="control-label">Passwort</label>
				<div class="controls">*****</div>
			</div>
		</div>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted";} ?> newAccountAccept">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
