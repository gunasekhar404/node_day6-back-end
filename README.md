# URL SHORTENER - Backend

[Live Server](https://urlshortener-yiq2.onrender.com/)

## Demo Account : 

* Email : demo@gmail.com
* Password : Demo@123

## Packages : 

* cors
* dotenv
* express
* mongodb
* mongoose
* nodemon
* bcrypt
* jsonwebtoken
* nodemailer

## Features : 

### Users:

* /register - to register user
* /login - to login user
* /forgot - to send reset password link to mail
* /reset - to reset password
* /activation/:id - to activate account
* /addUrl - to add long url to the database
* /shortUrl - to add short url to the database
* /getUrl/:string - to redirect short url to the long url
* /getUrl - to get all urls created
* /count - to get the count of total number of urls created

## Steps:

### /register :

* finding if user already registered with the emailid
* encrypting user password
* creating object with user details
* adding user to the db
* composing mail
* creating transport to send mail
* sending mail to activate account

### /login :

* checking is user email is registered 
* validating password with email
* checking if account is active or not
* token is generated and passed as response
* if account is not active
* composing mail
* creating transport to send mail
* sending mail to activate account

### /forgot :

* checking user email is registered or not
* creating expiry token
* adding token to the database
* composing mail
* creating transport to send mail
* sending mail to reset password

### /reset :

* finding user
* verifying token
* encrypting user password
* updating password

### /activation/:id :

* finding user and updating account status
* activating account and updating it in the database

### /addUrl :

* checking if url already exists
* creating object of data details
* adding url to database

### /shortUrl :

* finding url
* creating randomstring
* passing randomString as params
* adding short url
* finding url to send response

### /getUrl/:string :

* finding long url using string passed in params
* increasing shortened url count
* sending response with the longurl

### /getUrl :

* finding all shortened urls
* sending all the shortened urls as response

### /count :

* getting count of number of urls created
* sending the response with the urls created count
