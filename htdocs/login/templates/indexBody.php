<?php
$title = 'Startseite';
$pageId = 'indexBody';
?>
<?php ob_start() ?>
		<h1 id="headline">Vielen Dank für die Anmeldung!</h1>
		<div class="row">
			<div class="col-md-4">
				<div><a href="<?php echo $htmlroot; ?>/index.php?editAccount" id="editAccountLink">Daten bearbeiten</a></div>
				<div><a href="<?php echo $htmlroot; ?>/index.php?deleteAccount" id="deleteAccountLink">Meine Zugangsdaten löschen</a></div>
<?php
if ($lastLoginText != "")
	echo "				<div id=\"lastLogin\">".$lastLoginText."</div>\n";
?>
				<div><a href="<?php echo $htmlroot; ?>/index.php?logout=true" id="logoutLink">abmelden</a></div>
			</div>
		</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
