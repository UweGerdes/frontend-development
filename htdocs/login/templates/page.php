<!DOCTYPE html>
<html lang="de">
<?php
require 'head.php';
?>
<body class="<?php echo $pageId ?>">
	<div class="container" role="main">
		<div class="jumbotron">
			<h1>Login <?php echo $title; ?></h1>
		</div>
<?php echo $content ?>
	</div>
	<script src="/js/vendor/jquery.min.js"></script>
	<script src="/js/vendor/bootstrap.min.js"></script>
</body>
</html>
