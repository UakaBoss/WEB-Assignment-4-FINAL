<h2> Assignment 4 (FINAL) | Ualikhan Kamarov | SE-2211 </h2>

In this project I used many different modules such as express, mongoose, nodemailer, bodyparser, bcrypt, path, express-session to make all the functions.

<h2>User registration:</h2>
User registration is handled by the /sign_up route. When a user submits the registration form, a POST request is sent to this route. The server then checks if the user already exists in the database. If not, it creates a new user with the provided details, including a hashed password. The user is also assigned a role, with the default being 'REGULAR USER'. If the user's username is 'Ualikhan', their role is set to 'ADMIN'.

<h2>User login:</h2>
User login is handled by the /login route. When a user submits the login form, a POST request is sent to this route. The server then checks if the user exists in the database and if the provided password matches the hashed password in the database. If both conditions are met, a session is created for the user.

<h2>Authorization:</h2>
Authorization is enforced by the isAdmin middleware. This middleware checks if the user's role is 'ADMIN' before allowing access to certain routes. If the user is not an admin, they are redirected to a 403 Forbidden page.

<h2>REST API:</h2>
The project includes a REST API for managing portfolio items. This API allows for CRUD operations on portfolio items. It uses HTTP methods (GET, POST, PUT, DELETE) to interact with the portfolio items resource.

<h2>APIs:</h2>
The project also includes other APIs for various functionalities. For example, the /sign_up and /login routes are APIs that handle user registration and login. The /admin route is an API for the admin panel, which allows admins to manage portfolio items.

<h2>NodeMailer:</h2>
NodeMailer is used to send emails. In this project, it is used to send a confirmation email to users upon successful registration. The email includes a greeting and a thank you message.

<br>
<em>commands to run:<br>
cd /path/to/folder
npm init -y
npm i express multer express-session body-parser bcrypt path mongoose nodemailer</em>