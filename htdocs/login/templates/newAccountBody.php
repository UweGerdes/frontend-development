<?php
$title = 'Login Zugang beantragen';
$pageId = 'newAccountBody';
?>
<?php ob_start() ?>
	<div class="form-small" class="container">
		<form action="<?php echo $htmlroot; ?>/index.php/newAccount" method="POST" accept-charset="utf-8" name="newAccount"
			id="newAccount" role="form" class="form-horizontal<?php if($_POST && !($inputNameOk && $inputEMailOk && $inputUsernameOk && $inputPasswordOk)) {echo ' inputError';} ?>">
			<h2 id="headline">Zugang beantragen</h2>
			<?php
				if ($messages) {
					echo "<p id=\"newAccountError\" class=\"error messages\">".join("<br />", $messages)."</p>\n";
				}
			?>
			<div id="NameContainer" class="control-group<?php if($_POST && !$inputNameOk) {echo ' inputError';} ?>">
				<label for="Name" class="control-label">Name</label>
				<div class="controls">
					<input type="text" name="Name" id="Name" class="input-large Name"
						placeholder="Name" value="<?php if ($_POST) { echo $_POST["Name"]; } ?>">
				</div>
			</div>
			<div id="eMailContainer" class="control-group<?php if($_POST && !$inputEMailOk) {echo ' inputError';} ?>">
				<label for="eMail" class="control-label">E-Mail</label>
				<div class="controls">
					<input type="text" name="eMail" id="eMail" class="input-large eMail"
						placeholder="E-Mail" value="<?php if ($_POST) { echo $_POST["eMail"]; } ?>">
				</div>
			</div>
			<div id="UsernameContainer" class="control-group<?php if($_POST && !$inputUsernameOk) {echo ' inputError';} ?>">
				<label for="Username" class="control-label">Anmeldename</label>
				<div class="controls">
					<input type="text" name="Username" id="Username" class="input-medium Username"
						placeholder="Benutzername"
						value="<?php if ($_POST) { echo $_POST["Username"]; } ?>">
				</div>
			</div>
			<div id="PasswordContainer" class="control-group<?php if($_POST && !$inputPasswordOk) {echo ' inputError';} ?>">
				<label for="Password" class="control-label">Passwort</label>
				<div class="controls">
					<input type="password" name="Password" id="Password"
						class="input-medium Password" placeholder="Passwort">
				</div>
			</div>
			<div id="Password2Container" class="control-group<?php if($_POST && !$inputPasswordOk) {echo ' inputError';} ?>">
				<label for="Password2" class="control-label">Wiederholung</label>
				<div class="controls">
					<input type="password" name="Password2" id="Password2"
						class="input-medium Password" placeholder="Wiederholung">
				</div>
			</div>
			<div id="submitContainer" class="control-group">
				<div class="controls">
					<button name="submit" id="submit" class="btn btn-primary"
						type="submit">Anmelden</button>
				</div>
			</div>
		</form>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($_POST) { echo " submitted";} ?> newAccount">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
