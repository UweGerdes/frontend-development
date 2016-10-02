<!DOCTYPE html>
<html lang="de">
<?php
require 'head.php';
?>
<body class="<?php echo $pageId ?>">
	<div class="container" role="main">
		<div class="jumbotron">
			<h1><?php echo $title; ?></h1>
		</div>
<?php echo $content ?>
	</div>
	<script src="/js/vendor/jquery.min.js"></script>
	<script src="/js/vendor/bootstrap.min.js"></script>
	<div id="pagecomplete" class="hidden pagecomplete<?php if ($login && $login['loginOk']) { echo " loginOk";}; if ($_POST) { echo " submitted";} ?>">Seite geladen</div>
</body>
</html>
