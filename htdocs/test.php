<!DOCTYPE html>
<html lang="de">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Show PHP $_SERVER</title>
<meta name="author" content="Uwe Gerdes, entwicklung@uwegerdes.de">
<meta name="copyright" content="Uwe Gerdes, ELWoMS Systems GmbH">
<link rel="stylesheet" type="text/css" href="/css/layout.css" />
<link rel="stylesheet" type="text/css" href="/css/print.css" media="print" />
</head>
<body class="body">
	<div class="main">
		<div class="content">
			<h1>Show PHP $_SERVER</h1>
			<p>DON'T USE THIS IN PRODUCTION ENVIRONMENT</p>
			<h4>Open <a href="http://<?php echo $_SERVER['HTTP_HOST']; ?>/test.php/foo/bar.php?v=1">http://<?php echo $_SERVER["HTTP_HOST"]; ?>/test.php/foo/bar.php?v=1</a> for a full list of request elements.</h4>
<pre>
$_SERVER = <?php var_export($_SERVER)?>
</pre>
		</div>
	</div>
</body>
</html>
