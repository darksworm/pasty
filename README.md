# Pasty

Minimalistic pastebin clone written in python with flask

## Setup
1.	make a copy of .env.example named .env
2.	change variables in .env (they're self-explanatory)
3.  npm install
4.  bower install
5.	create database, user and tables
6.	run it like any other flask app

Database schema:
```
CREATE DATABASE paste DEFAULT CHARACTER SET UTF8;
CREATE USER `paste`@`localhost` IDENTIFIED BY 'topsecret';
GRANT ALL ON paste.* TO `paste`@`localhost`;
CREATE TABLE pastes(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        text MEDIUMTEXT NOT NULL, 
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        language VARCHAR(60) DEFAULT NULL
);
```