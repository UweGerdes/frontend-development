<?php
$title = 'Login Zugang löschen';
$pageId = 'deleteAccountBody';
?>
<?php ob_start() ?>
	<div class="form-small container">
		<form action="<?php echo $htmlroot; ?>/index.php?deleteAccount" method="POST" accept-charset="utf-8" name="deleteAccount"
			id="deleteAccount" role="form" class="form-horizontal<?php if($_POST && ! $deleteAccountOk) {echo ' inputError';} ?>">
			<h2 id="headline">Wirklich löschen?</h2>
			<?php
				if ($messages) {
					echo "<p id=\"deleteAccountError\" class=\"col-sm-offset-3 error messages\">".join("<br />", $messages)."</p>\n";
				}
			?>
			<p>Zur Kontrolle hier noch einmal die gespeicherten Daten:</p>
			<div id="NameContainer" class="form-group onlyText">
				<label for="Name" class="col-sm-3 control-label">Name</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData["Name"]; ?></p></div>
			</div>
			<div id="eMailContainer" class="form-group onlyText">
				<label for="eMail" class="col-sm-3 control-label">E-Mail</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData["eMail"]; ?></p></div>
			</div>
			<div id="UsernameContainer" class="form-group onlyText">
				<label for="Username" class="col-sm-3 control-label">Anmeldename</label>
				<div class="col-sm-9"><p class="form-control-static"><?php echo $loginData["Username"]; ?></p></div>
			</div>
			<div id="PasswordContainer" class="form-group<?php if($_POST) {echo ' inputError';} ?>">
				<label for="Password" class="col-sm-3 control-label">Passwort</label>
				<div class="col-sm-9">
					<input type="password" name="Password" id="Password" class="Password" placeholder="Passwort">
				</div>
			</div>
			<div id="deleteConfirmContainer" class="form-group<?php if($_POST && (!array_key_exists('deleteConfirm', $_POST) || $_POST['deleteConfirm'] != 'true')) {echo ' inputError';} ?>">
				<div class="col-sm-offset-3 col-sm-9">
					<label for="deleteConfirm" class="checkbox">
						<input type="checkbox" name="deleteConfirm" id="deleteConfirm" value="true" />
						wirklich löschen?
					</label>
				</div>
			</div>
			<div id="submitContainer" class="form-group">
				<div class="col-sm-3">
					<button type="submit" name="submit" id="submit" value="deleteSubmit" class="btn btn-danger">Löschen</button>
				</div>
				<div class="col-sm-9">
					<a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn btn-success inputWidth">nein - zurück zum Start</a>
				</div>
			</div>
		</form>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted";} ?> deleteAccount">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
