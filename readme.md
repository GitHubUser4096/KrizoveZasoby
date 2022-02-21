# Setup:

## Requirements:
 - database
 - mail server

## 1. Create the database
db.sql - contains the database creation code and some testing data (not necessary)

## 2. Setup the configuration
config/mail.conf.php - configuration of the connection to your mail server

config/supplies.conf.php - configuration of the connection to your db

config/notification.conf.php - the security key for your notification script, to prevent users from sending the notifications randomly
