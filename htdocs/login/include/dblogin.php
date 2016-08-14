<?php

function open_database_connection() {
	$dbhost="db";
	$dbname="demoDb";
	$dbuser="demoUser";
	$dbpass="demoPass";
	$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
	return $mysqli;
}

function close_database_connection($mysqli) {
	$mysqli->close();
    $mysqli = null;
}

?>
