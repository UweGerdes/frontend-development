<?php
$title = 'Startseite';
$pageId = 'indexBody';
?>
<?php ob_start() ?>
	<div class="container">
		<div id="index" class="row">
			<div class="span12">
				<h1 id="headline">Vielen Dank für die Anmeldung!</h1>
			</div>
		</div>
		<div class="row">
			<div class="span4">
				<div><a href="<?php echo $htmlroot; ?>/index.php/editAccount" id="editAccountLink">Daten bearbeiten</a></div>
				<div><a href="<?php echo $htmlroot; ?>/index.php/deleteAccount" id="deleteAccountLink">Meine Zugangsdaten löschen</a></div>
<?php
if ($lastLoginText != "")
	echo "				<div id=\"lastLogin\">".$lastLoginText."</div>\n";
?>
				<div><a href="<?php echo $htmlroot; ?>/index.php?logout=true" id="logoutLink">abmelden</a></div>
			</div>
		</div>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete loginOk<?php if ($_POST) { echo " submitted";} ?>">Seite geladen</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
