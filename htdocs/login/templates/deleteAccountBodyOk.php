<?php
$title = 'Login Zugang gelöscht';
$pageId = 'deleteAccountBodyOk';
?>
<?php ob_start() ?>
	<div class="form-small container">
		<div id="deleteAccountSuccess" class="form-horizontal">
			<h2 id="headline">Daten gelöscht.</h2>
			<?php
				if ($messages) {
					echo "<p class=\"col-sm-offset-3 messages\">".join("; ", $messages)."</p>\n";
				}
			?>
			<p><a href="<?php echo $htmlroot; ?>/index.php" class="homeLink btn">zurück zur Anmeldeseite</a></p>
		</div>
	</div>
<?php $content = ob_get_clean() ?>
<?php include 'page.php' ?>
