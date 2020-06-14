<!DOCTYPE html>
<html lang="de">
<?php
require 'head.php';
?>
<body class="<?php echo $pageId ?>">
	<div class="container" role="main">
		<div class="jumbotron">
			<h1><?php echo $title; ?></h1>
			<h2 class="hidden" style="color: #cc0000;">Please generate missing files with bower install and gulp build!</h2>
		</div>
<?php echo $content ?>
	</div>
	<script src="/js/vendor/jquery.min.js"></script>
	<script src="/js/vendor/bootstrap.min.js"></script>
	<div class="footer">
		<span class="copyright">&copy; 2020 by <a href="mailto:entwicklung@uwegerdes.de">Uwe Gerdes</a></span>
	</div>
	<div id="pagecomplete" class="hidden pagecomplete<?php if (isset($login) && $login['loginOk']) { echo " loginOk";}; if ($_POST) { echo " submitted";} ?> <?php echo $pageId; ?>">Seite geladen</div>
</body>
</html>
