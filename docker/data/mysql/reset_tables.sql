-- MySQL table creation

-- drop and create table `Login`

DROP TABLE IF EXISTS `Login`;
CREATE TABLE `Login` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(250) NOT NULL,
  `eMail` varchar(250) NOT NULL,
  `Username` varchar(250) NOT NULL,
  `Password` varchar(250) NOT NULL,
  `rememberMe` varchar(250) DEFAULT NULL,
  `HashData` varchar(250) NOT NULL,
  `Status` varchar(250) NOT NULL,
  `lastLogin` timestamp NULL DEFAULT NULL,
  `lastActivity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- default data for table `Login`

INSERT INTO `Login` VALUES (1,'Uwe Gerdes','entwicklung@uwegerdes.de','uwe','f2c6dec13dae53118922925c77e8af29',NULL,'','logged in',NULL,'2016-08-01 14:00:01');

