<?php
require_once 'dblogin.php';
require_once 'email.php';
require_once 'config.php';

$cryptosalt = "this string is the salt for password hashing öonws8hnöi34nöb";
$cookieTimeoutDefault = 10 * 60; # 10 min inactivity timeout
$cookieTimeoutStay = 7 * 24 * 60 * 60; # 7 Days inactivity timeout

function check_login() {
	$result = array();
	$result['loginOk'] = false;
	$result['notConfirmed'] = false;
	$result['loginData'] = array();
	$result['lastLoginText'] = "";
	$result['sessionCookie'] = "";
	$result['messages'] = array();
	if ($_COOKIE && $_COOKIE["sessionId"] && $_GET && array_key_exists("logout", $_GET) && $_GET["logout"] == "true") {
		$result['messages'] = log_out_user($_COOKIE["sessionId"]);
		$result['sessionCookie'] = "";
		setcookie("sessionId", $result['sessionCookie'], time());
	} else if ($_COOKIE && $_COOKIE["sessionId"]) {
		$result = check_user_login($result, $_COOKIE["sessionId"]);
	}
	if (!$result['loginOk'] && $_POST && $_POST['Username'] != "" && $_POST['Password'] != "") {
		$result = login_user($result,
				$_POST['Username'],
				hashPassword($_POST['Password']),
				array_key_exists('rememberMe', $_POST) ? $_POST['rememberMe'] : ''
			);
	} else {
		;
	}
	return $result;
}

function hashPassword ($passwordString) {
	global $cryptosalt;
	if (strlen($passwordString) < 6 || strlen($passwordString) > 50) {
		return "";
	}
	return md5($passwordString.$cryptosalt);
}

function check_user_login($result, $sessionCookie) {
	$result = array();
	$result['loginOk'] = false;
	$result['notConfirmed'] = false;
	$result['loginData'] = array();
	$result['lastLoginText'] = "";
	$result['sessionCookie'] = "";
	$result['messages'] = array();
	$mysqli = open_database_connection();
	if (!$mysqli->connect_errno) {
		$stmt = $mysqli->stmt_init();
		$sql = "SELECT `Name`, `eMail`, `Username`, `lastLogin`, `Status` FROM `Login` ".
				"WHERE `HashData`=? AND `Status` IN (\"logged out\", \"logged in\", \"confirmed\")";
		if ($stmt = $mysqli->prepare($sql)) {
			$stmt->bind_param("s", $sessionCookie);
			$stmt->execute();
			$stmt->store_result();
			if ($stmt->num_rows == 1) {
				$stmt->bind_result($result['loginData']["Name"], $result['loginData']["eMail"], $result['loginData']["Username"],
						$result['loginData']["lastLogin"], $result['loginData']["Status"]);
				$stmt->fetch();
				$result['loginOk'] = true;
				$result['messages'] = array_merge($result['messages'], set_user_status($mysqli, $sessionCookie, 'logged in'));
			} else {
				array_push($result['messages'], "Sitzung nicht (mehr) gültig");
			}
		} else {
			$result['messages'][] = "Statement error: ".$mysqli->error;
		}
		$stmt->close();
		close_database_connection($mysqli);
	} else {
		$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
	}
	return $result;
}

function login_user($result, $username, $passwordHash, $rememberMe) {
	global $cookieTimeoutDefault;
	global $cookieTimeoutStay;
	if ($passwordHash != null) {
		$mysqli = open_database_connection();
		if (!$mysqli->connect_errno) {
			$stmt = $mysqli->stmt_init();
			$sql = "SELECT `Name`, `eMail`, `Username`, `lastLogin`, `Status` ".
					"FROM `Login` WHERE `Username`=? AND `Password`=? AND `Status` IN ".
					"(\"logged out\", \"logged in\", \"confirmed\", \"Username changed\", \"Password changed\")";
			if ($stmt = $mysqli->prepare($sql)) {
				$stmt->bind_param("ss", $username, $passwordHash);
				$stmt->execute();
				$stmt->store_result();
				if ($stmt->num_rows == 1) {
					$stmt->bind_result($result['loginData']["Name"], $result['loginData']["eMail"], $result['loginData']["Username"],
							$result['loginData']["lastLogin"], $result['loginData']["Status"]);
					$stmt->fetch();
					$result['loginOk'] = true;
					$result['lastLoginTime'] = new DateTime($result['loginData']["lastLogin"]);
					$result['lastLoginText'] = "zuletzt online: ".$result['lastLoginTime']->format('d.m.Y H:i:s');
					// TOOO: make better cookie
					$dateTime = new DateTime('NOW');
					$dateTimeString = $dateTime->format('Y-m-d H:i:s');
					$result['sessionCookie'] = md5($result['loginData']["Username"].$dateTimeString);
					if ($rememberMe) {
						setcookie("sessionId", $result['sessionCookie'], time()+$cookieTimeoutStay);
					} else {
						setcookie("sessionId", $result['sessionCookie'], time()+$cookieTimeoutDefault);
					}
					$sql = "UPDATE `Login` SET `lastLogin`=?, `lastActivity`=?, `HashData`=?, `Status`=\"logged in\" WHERE `Username`=? AND `Password`=?";
					if ($update = $mysqli->prepare($sql)) {
						$update->bind_param("sssss", $dateTimeString, $dateTimeString, $result['sessionCookie'], $result['loginData']["Username"], $passwordHash);
						$update->execute();
						if ($update->errno != 0) {
							$result['messages'][] = "Daten konnten nicht gesetzt werden: ".$update->error;
						}
						$update->close();
					} else {
						$result['messages'][] = "Daten nicht gesetzt (3): ".$mysqli->error;
					}
					$stmt->close();
				} else {
					$sql = "SELECT `Name`, `eMail`, `Username`, `lastLogin`, `Status` ".
							"FROM `Login` WHERE `Username`=? AND `Password`=? AND ".
							"`Status` IN (\"not confirmed\")";
					if ($stmt = $mysqli->prepare($sql)) {
						$stmt->bind_param("ss", $username, $passwordHash);
						$stmt->execute();
						$stmt->store_result();
						if ($stmt->num_rows == 1) {
							$result['notConfirmed'] = true;
							$result['pageTitle'] = "Anmeldung nicht bestätigt";
							$stmt->close();
						} else {
							$result['messages'][] = "Benutzername / Passwort nicht gültig";
						}
					} else {
						$result['messages'][] = "sql prepare error";
					}
				}
			} else {
				$result['messages'][] = "Statement error: ".$mysqli->error;
			}
			close_database_connection($mysqli);
		} else {
			$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
		}
	} else {
		$result['messages'][] = "Benutzername / Passwort nicht gültig";
	}
	return $result;
}

function new_user() {
	global $htmlroot;
	$result = array();
	$result['messages'] = array();
	$result['newAccountOk'] = false;
	$result['inputNameOk'] = true;
	$result['inputEMailOk'] = true;
	$result['inputUsernameOk'] = true;
	$result['inputPasswordOk'] = true;
	$result['sendSuccess'] = false;
	$result['usernameDuplicate'] = "";
	$result['confirmationCode'] = "";
	global $emailFrom;
	if ($_POST) {
		$mysqli = open_database_connection();
		$result['inputNameOk'] = array_key_exists('Name', $_POST) && $_POST['Name'] != "";
		if (!$result['inputNameOk']) {
			$result['messages'][] = "Anwendername fehlt.";
		}
		$result['inputEMailOk'] = array_key_exists('eMail', $_POST) && $_POST['eMail'] !="" && filter_var($_POST['eMail'], FILTER_VALIDATE_EMAIL);
		if (!array_key_exists('eMail', $_POST) || $_POST['eMail'] == "") {
			$result['messages'][] = "Mail-Adresse fehlt.";
		} elseif (array_key_exists('eMail', $_POST) && $_POST['eMail'] != "" && !filter_var($_POST['eMail'], FILTER_VALIDATE_EMAIL)) {
			$result['messages'][] = "Mail-Adresse falsch.";
		}
		$result['inputUsernameOk'] = array_key_exists('Username', $_POST) && preg_match("/^[a-zA-Z0-9_.-]+$/", $_POST['Username']);
		if (!array_key_exists('Username', $_POST) || $_POST['Username'] == "") {
			$result['messages'][] = "Anmeldename fehlt.";
		} else {
			$stmt = $mysqli->stmt_init();
			$sql = "SELECT * FROM `Login` WHERE `Username`=?";
			if ($stmt = $mysqli->prepare($sql)) {
				$stmt->bind_param("s", $_POST["Username"]);
				$stmt->execute();
				$stmt->store_result();
				if ($stmt->num_rows > 0) {
					$result['inputUsernameOk'] = false;
					$result['messages'][] = "Anwendername '".$_POST['Username']."' bereits vorhanden.";
				}
				$stmt->close();
			} else {
				$result['messages'][] = "Daten konnten nicht gelesen werden: ".$mysqli->error;
			}
		}
		$result['inputPasswordOk'] = strlen($_POST['Password']) >= 6 && $_POST['Password'] == $_POST['Password2'];
		if (!$result['inputPasswordOk']) {
			$result['messages'][] = "Passwort fehlt oder die Passworte stimmen nicht überein.";
		}
		$passwordHash = hashPassword($_POST['Password']);

		if ($result['inputNameOk'] && $result['inputEMailOk'] && $result['inputUsernameOk'] && $result['inputPasswordOk'] && $passwordHash) {
			if ($mysqli->connect_errno) {
				$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
			} else {
				$stmt = $mysqli->stmt_init();
				$sql = "SELECT * FROM `Login` WHERE `Username`=?";
				if ($stmt = $mysqli->prepare($sql)) {
					$stmt->bind_param("s", $_POST["Username"]);
					$stmt->execute();
					$stmt->store_result();
					if ($stmt->num_rows == 0) {
						$result['confirmationCode'] = hashPassword($_POST['Username']);
						$insert = $mysqli->stmt_init();
						$sql = "INSERT INTO `Login` (`Name`, `eMail`, `Username`, `Password`, `HashData`, `Status`) ".
							"VALUES (?, ?, ?, ?, ?, \"not confirmed\")";
						if ($insert = $mysqli->prepare($sql)) {
							$insert->bind_param("sssss", $_POST['Name'], $_POST['eMail'],
									$_POST['Username'], $passwordHash, $result['confirmationCode']);
							$insert->execute();
							if ($insert->errno != 0) {
								$result['messages'][] = "Daten konnten nicht gespeichert werden: ".$insert->error;
							} else {
								$result['messages'][] = "Daten wurden gespeichert.";
								$result['newAccountOk'] = true;
							}
							$insert->close();
						} else {
							$result['messages'][] = "Daten nicht gespeichert, SQL-Fehler ".$mysqli->error;
						}
					}
					$stmt->close();
				} else {
					$result['messages'][] = "Statement error: ".$mysqli->error;
				}
			}
			close_database_connection($mysqli);
		}
		if ($result['newAccountOk']) {
			$email = new Email();
			$email->sentTo($_POST['eMail']);
			$email->subject("Zugangsaktivierung für ".$_POST['Name']);
			$email->from($emailFrom);
			$emailText = array();
			$emailText[] = "Hallo " . $_POST['Name'] . ",";
			$emailText[] = "";
			$emailText[] = "zur Aktivierung des Zugangs bitte folgenden Link öffnen:";
			$emailText[] = "";
			$emailText[] = "http://".$_SERVER['SERVER_NAME'].$htmlroot."/index.php?newAccountConfirm=".$result['confirmationCode'];
			$emailText[] = "";
			$emailText[] = "Viele Grüße\nDas Login-Team";
			$emailText[] = "";
			$email->setText(join("\r\n", $emailText));
			$result['sendSuccess'] = $email->sendEmail();
		}
	}
	return $result;
}

function confirm_new_user($confirmString) {
	$result = array();
	$result['messages'] = array();
	$result['newAccountOk'] = false;
	$result['loginData'] = array();
	if ($confirmString != "") {
			$mysqli = open_database_connection();
		if ($mysqli->connect_errno) {
			$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
		} else {
			$stmt = $mysqli->stmt_init();
			$sql = "SELECT `Name`, `eMail`, `Username` FROM `Login` ".
					"WHERE `HashData`=? AND `Status`=\"not confirmed\"";
			if ($stmt = $mysqli->prepare($sql)) {
				$stmt->bind_param("s", $confirmString);
				$stmt->execute();
				$stmt->store_result();
				if ($stmt->num_rows == 1) {
					$stmt->bind_result($result['loginData']["Name"], $result['loginData']["eMail"], $result['loginData']["Username"]);
					$stmt->fetch();
					$sql = "UPDATE `Login` SET `Status`=\"confirmed\" WHERE `HashData`=? AND `Status`=\"not confirmed\"";
					if ($update = $mysqli->prepare($sql)) {
						$update->bind_param("s", $confirmString);
						$update->execute();
						if ($update->errno != 0) {
							$result['messages'][] = "Daten konnten nicht freigeschaltet werden: ".$update->error;
						} else {
							$result['messages'][] = "Daten wurden freigeschaltet.";
							$result['loginData']["Status"] = "confirmed";
							$result['newAccountOk'] = true;
						}
						$update->close();
					}
				} else {
					$result['messages'][] = "Freischaltung nicht möglich.";
				}
				$stmt->close();
			} else {
				$result['messages'][] = "Daten konnten nicht gelesen werden: ".$mysqli->error;
			}
			if (!$result['newAccountOk']) {
				$sql = "SELECT `Name`, `eMail`, `Username` ".
						"FROM `Login` WHERE `HashData`=? AND `Status` IN ".
						"(\"logged out\", \"logged in\", \"confirmed\", \"Username changed\", \"Password changed\")";
				if ($stmt = $mysqli->prepare($sql)) {
					$stmt->bind_param("s", $confirmString);
					$stmt->execute();
					$stmt->store_result();
					if ($stmt->num_rows == 1) {
						$stmt->bind_result($result['loginData']["Name"], $result['loginData']["eMail"], $result['loginData']["Username"]);
						$stmt->fetch();
						$result['newAccountOk'] = true;
						$result['messages'] = array();
						$result['messages'][] = "Freischaltung bereits erfolgt.";
					} else {
						$result['messages'] = array();
						$result['messages'][] = "Freischaltung nicht möglich!";
					}
					$stmt->close();
				} else {
					$result['messages'][] = "Statement error: ".$mysqli->error;
				}
			}
			close_database_connection($mysqli);
		}
	}
	return $result;
}

function edit_user($loginData) {
	$result = array();
	$result['loginData'] = $loginData;
	$result['messages'] = array();
	$result['editAccountOk'] = false;
	$result['inputNameOk'] = true;
	$result['inputEMailOk'] = true;
	$result['inputUsernameOk'] = true;
	$result['inputPasswordOk'] = true;
	global $cryptosalt;
	if ($_POST) {
		if ($_POST['updateAccount'] != "true") {
			$result['messages'][] = "Daten können geändert werden";
		} else {
			$mysqli = open_database_connection();
			array_pop($result['messages']);
			$result['inputNameOk'] = $_POST['Name'] != "";
			if (!$result['inputNameOk']) {
				$result['messages'][] = "Anwendername fehlt.";
			}
			$result['inputEMailOk'] = $_POST['eMail'] !="" && filter_var($_POST['eMail'], FILTER_VALIDATE_EMAIL);
			if ($_POST['eMail'] == "") {
				$result['messages'][] = "Mail-Adresse fehlt.";
			} elseif (!filter_var($_POST['eMail'], FILTER_VALIDATE_EMAIL)) {
				$result['messages'][] = "Mail-Adresse falsch.";
			}
			$result['inputUsernameOk'] = preg_match("/^[a-zA-Z0-9_.-]+$/", $_POST['Username']);
			if ($result['inputUsernameOk'] && $_POST['Username'] != $result['loginData']["Username"]) {
				$stmt = $mysqli->stmt_init();
				$sql = "SELECT * FROM `Login` WHERE `Username`=?";
				if ($stmt = $mysqli->prepare($sql)) {
					$stmt->bind_param("s", $_POST["Username"]);
					$stmt->execute();
					$stmt->store_result();
					if ($stmt->num_rows > 0) {
						$result['inputUsernameOk'] = false;
						$result['messages'][] = "Anwendername '".$_POST['Username']."' bereits vorhanden.";
					}
					$stmt->close();
				} else {
					$result['messages'][] = "Daten konnten nicht gelesen werden: ".$mysqli->error;
				}
			} else {
				if (!$result['inputUsernameOk']) {
					$result['messages'][] = "Anmeldename fehlt.";
				}
			}

			if (!(($_POST['Password'] == '' && $_POST['Password2'] == '') || $_POST['Password'] == $_POST['Password2'])) {
				$result['messages'][] = "Passworte stimmen nicht überein.";
				$result['inputPasswordOk'] = false;
			} elseif ($_POST['Password'] != '' && strlen($_POST['Password']) < 6) {
				$result['messages'][] = "Passwort zu kurz.";
				$result['inputPasswordOk'] = false;
			} elseif ($result['inputNameOk'] && $result['inputEMailOk'] && $result['inputUsernameOk']) {
				if ($mysqli->connect_errno) {
					$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
				} else {
					$passwordHash = hashPassword($_POST['Password']);
					$stmt = $mysqli->stmt_init();
					$sql = "SELECT * FROM `Login` WHERE `Username`=?";
					if ($stmt = $mysqli->prepare($sql)) {
						$stmt->bind_param("s", $result['loginData']["Username"]);
						$stmt->execute();
						$stmt->store_result();
						if ($stmt->num_rows == 1) {
							$confirmationCode = hashPassword($_POST['Username'].$cryptosalt);
							$update = $mysqli->stmt_init();
							if ($result['inputPasswordOk'] && $passwordHash != null) {
								$sql = "UPDATE `Login` SET `Name`=?, `eMail`=?, `Username`=?, ".
										"`Password`=?, `HashData`=?, `Status`=\"Password changed\"";
							} elseif ($_POST['Username'] != $result['loginData']["Username"]) {
								$sql = "UPDATE `Login` SET `Name`=?, `eMail`=?, `Username`=?, ".
										"`Status`=\"Username changed\"";
							} elseif ($_POST['Name'] != $result['loginData']["Name"] || $_POST['eMail'] != $result['loginData']["eMail"]) {
								$sql = "UPDATE `Login` SET `Name`=?, `eMail`=?";
							} else {
								$sql = "";
							}
							if ($sql != "") {
								$sql .= " WHERE `Username`=\"".$result['loginData']['Username']."\"";
								if ($update = $mysqli->prepare($sql)) {
									if ($result['inputPasswordOk'] && $passwordHash != null) {
										$update->bind_param("sssss", $_POST['Name'], $_POST['eMail'],
												$_POST["Username"], $passwordHash, $confirmationCode);
									} elseif ($_POST['Username'] != $result['loginData']["Username"]) {
										$update->bind_param("sss", $_POST['Name'], $_POST['eMail'],
												$_POST["Username"]);
									} else {
										$update->bind_param("ss", $_POST['Name'], $_POST['eMail']);
									}
									$update->execute();
									if ($update->errno != 0) {
										$result['messages'][] = "Daten konnten nicht gespeichert werden: ".$update->error;
									} else {
										$result['messages'][] = "Daten wurden gespeichert.";
										$result['editAccountOk'] = true;
									}
									$update->close();
								} else {
									$result['messages'][] = "Daten nicht gespeichert: ".$mysqli->error;
								}
							} else {
								$result['messages'][] = "Keine Änderungen.";
							}
						} else {
							$result['inputUsernameOk'] = false;
							$result['messages'][] = "Anwendername '".$_POST['Username']."' nicht vorhanden.";
						}
						$stmt->close();
					} else {
						$result['messages'][] = "Statement error: ".$mysqli->error;
					}
				}
			}
			close_database_connection($mysqli);
		}
	}
	return $result;
}

function delete_user($loginData) {
	$result = array();
	$result['loginData'] = $loginData;
	$result['messages'] = array();
	$result['deleteAccountOk'] = false;
	$result['inputPasswordOk'] = array_key_exists('Password', $_POST) && strlen($_POST['Password']) >= 6;
	if ($loginData && $loginData['Username'] != "" && $_POST && $result['inputPasswordOk'] &&
		array_key_exists('deleteConfirm', $_POST) && $_POST['deleteConfirm'] == "true" &&
		array_key_exists('submit', $_POST) && $_POST['submit'] == "deleteSubmit") {
		$passwordHash = hashPassword($_POST['Password']);
		$mysqli = open_database_connection();
		if ($mysqli->connect_errno) {
			$result['messages'][] = "Failed to connect to database: " . $mysqli->connect_error;
		} else if (!$passwordHash) {
			$result['messages'][] = "Failed to create password.";
		} else {
			$stmt = $mysqli->stmt_init();
			$sql = "SELECT * FROM `Login` WHERE `Username`=? AND `Password`=?";
			if ($stmt = $mysqli->prepare($sql)) {
				$stmt->bind_param("ss", $loginData["Username"], $passwordHash);
				$stmt->execute();
				$stmt->store_result();
				if ($stmt->num_rows == 1) {
					$sql = "DELETE FROM `Login` WHERE `Username`=? AND `Password`=?";
					if ($delete = $mysqli->prepare($sql)) {
						$delete->bind_param("ss", $loginData["Username"], $passwordHash);
						$delete->execute();
						if ($delete->errno != 0) {
							$result['messages'][] = "Daten konnten nicht gelöscht werden: ".$delete->error;
							$result['inputPasswordOk'] = false;
						} else {
							$result['messages'][] = "Daten wurden gelöscht.";
							$result['deleteAccountOk'] = true;
						}
						$delete->close();
					} else {
						$result['messages'][] = "Daten nicht gelöscht: ".$mysqli->error;
						$result['inputPasswordOk'] = false;
					}
				} else {
					$result['inputPasswordOk'] = false;
					$result['messages'][] = "Datensatz nicht gefunden.";
				}
				$stmt->close();
			} else {
				$result['messages'][] = "Statement error: ".$mysqli->error;
				$result['inputPasswordOk'] = false;
			}
			close_database_connection($mysqli);
		}
	}
	if ($_POST && ! array_key_exists("Password",$_POST)) {
		$result['messages'][] = "Passwort fehlt.";
	}
	if ($_POST && ( ! array_key_exists('deleteConfirm', $_POST) || ! $_POST['deleteConfirm'] == "true")) {
		$result['messages'][] = "Bitte Passwort eingeben und Bestätigung anklicken.";
	} else {
		if ($_POST && array_key_exists("Password",$_POST) && ! $result['deleteAccountOk']) {
			array_pop($result['messages']);
			$result['messages'][] = "Passwort stimmt nicht.";
		}
	}
	return $result;
}

function log_out_user($sessionCookie) {
	$messages = array();
	$mysqli = open_database_connection();
	if (!$mysqli->connect_errno) {
		$stmt = $mysqli->stmt_init();
		$sql = "SELECT `Name`, `eMail`, `Username`, `lastLogin`, `Status`".
				" FROM `Login` WHERE `HashData`=?";
		if ($stmt = $mysqli->prepare($sql)) {
			$stmt->bind_param("s", $sessionCookie);
			$stmt->execute();
			$stmt->store_result();
			if ($stmt->num_rows == 1) {
				$messages = set_user_status($mysqli, $sessionCookie, 'logged out');
			} else {
				$messages[] = "logout ".$mysqli->error;
			}
		} else {
			$messages[] = "Statement error: ".$mysqli->error;
		}
		$stmt->close();
		close_database_connection($mysqli);
	} else {
		$messages[] = "Failed to connect to database: " . $mysqli->connect_error;
	}
	return $messages;
}

function set_user_status($mysqli, $sessionCookie, $status) {
	$messages = array();
	$dateTime = new DateTime('NOW');
	$lastActivity = $dateTime->format('Y-m-d H:i:s');
	$sql = "UPDATE `Login` SET `lastActivity`=?, `Status`=? WHERE `HashData`=?";
	if ($update = $mysqli->prepare($sql)) {
		$update->bind_param("sss", $lastActivity, $status, $sessionCookie);
		$update->execute();
		if ($update->errno != 0) {
			$messages[] = "Daten konnten nicht gesetzt werden: ".$update->error;
		} else {
			$messages[] = "Abmeldung erfolgreich";
		}
		$update->close();
	} else {
		$messages[] = "Daten nicht gesetzt (1): ".$mysqli->error;
	}
	return $messages;
}

?>
