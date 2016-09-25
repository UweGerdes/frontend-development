--
-- Table structure for table `Login`
--

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

--
-- Data for table `Login`
--

LOCK TABLES `Login` WRITE;
INSERT INTO `Login` VALUES (1,'Uwe Gerdes','entwicklung@uwegerdes.de','uwe','f2c6dec13dae53118922925c77e8af29',NULL,'b6b5841cddd65192ef17821fbed41443','not logged in','2016-09-25 12:00:00','2016-09-25 12:00:00');
UNLOCK TABLES;

