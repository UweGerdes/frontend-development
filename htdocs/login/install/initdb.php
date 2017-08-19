<!DOCTYPE html>
<html lang="de">
<?php

$title = "PHPLogin Datenbank einrichten";

$db_root_pw = "123456";

include '../include/head.php';

include '../include/dblogin.php';

?>
<body>
	<div class="container">
		<?php

		$mysqli = new mysqli($dbhost, $dbuser, $dbpass);
		if ( ! $mysqli->connect_error ) {
			echo "    <h1>Datenbank exisitiert schon</h1>";
			$sql = "SELECT * FROM Login";
			$mysqli->select_db($dbname);
			$retval = $mysqli->query( $sql );
			if($retval ) {
				die("    <h1>Tabelle Login bereits angelegt</h1>");
			}
		} else {
			echo "      <h1>Datenbank wird angelegt</h1>".
					"      <h2>Daten zum Anlegen der Datenbank</h2>".
					"      <p>dbhost: $dbhost</p>".
					"      <p>dbname: $dbname</p>".
					"      <p>dbuser: $dbuser</p>".
					"      <p>dbpass: $dbpass</p>";
			$mysqli = new mysqli($dbhost, "root", $db_root_pw);
			if ($mysqli->connect_error) {
				die("Failed to connect to MySQL: " . $mysqli->connect_error);
			}
			$sql = 'CREATE DATABASE '.$dbname;
			$retval = $mysqli->query( $sql );
			if(! $retval ) {
				die("    <h1>Datenbank $dbname kann nicht angelegt werden</h1>");
			}
			echo "    <h1>Datenbank $dbname angelegt</h1>";
			$mysqli->query("GRANT ALL PRIVILEGES ON $dbname.* TO '$dbuser'@'localhost' IDENTIFIED BY '$dbpass'");
			echo "    <h1>Zugriffsrechte für $dbuser angelegt</h1>";
		}
		$mysqli->close();
		$mysqli = new mysqli($dbhost, $dbuser, $dbpass);
		if ($mysqli->connect_error) {
			die("Failed to connect to MySQL: " . $mysqli->connect_error);
		}
		$sql = "CREATE TABLE IF NOT EXISTS `Login` (".
			"  `id` int(11) NOT NULL AUTO_INCREMENT,".
			"  `Name` varchar(250) NOT NULL,".
			"  `eMail` varchar(250) NOT NULL,".
			"  `Username` varchar(250) NOT NULL,".
			"  `Password` varchar(250) NOT NULL,".
			"  `rememberMe` varchar(250) NULL DEFAULT NULL,".
			"  `lastLogin` timestamp NULL DEFAULT NULL,".
			"  `lastActivity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,".
			"  `Status` varchar(250) NOT NULL,".
			"  `HashData` varchar(250) NOT NULL,".
			"  PRIMARY KEY (`id`)".
			") ENGINE=InnoDB DEFAULT CHARSET=utf8;";
		$mysqli->select_db($dbname);
		$retval = $mysqli->query( $sql );
		if( $mysqli->error ) {
			die('Could not create table: ' . $mysqli->error);
		}
		echo "    <h1>Tabelle Login angelegt</h1>";
		$mysqli->close();
		?>
	</div>
	<!-- /container -->
</body>
</html>
