# Okulus App

# Database Setup:
- Create a Firebase project (https://console.firebase.google.com/)
- Once in the new Project, you should see "Get started by adding Firebase to your app"
- Select the "Web" Button, and provide an app name
- Copy the "Firebase configuration" provided (var firebaseConfig) into this file: js/app/datasource.js
- Back into your Firebase project, Continue to console
- In "Authentication" section, Set up the sign-in method: Enable Email/password authentication
- Go to "Database" section, and Create a Realtime Database
- Go to "Rules" tab, and replace the existing rules by the ones provided on this project: data/rules.json
- Click "Publish" to save the rules

# Start Using Okulus:
- Launch the application in your server (local: http://127.0.0.1:8080/#!/home)
- Set Root and default configurations: http://127.0.0.1:8080/#!/admin/setRoot
- Provide email and password for the Root User
  Note: Only one root can be created. The "setRoot" path will not work anymore.
- Application will create the user and set initial configurations in database
- Now you can start using the app!

# Create Users
- Once logged in the created Root Account, go to Admin Menu / Members
- Create one Member with a valid email address
- After member creation, go to the "User" section, and click on "Allow Member to create User"
- The email provided will now be allowed to register
- Open a new borwser session and register on: http://127.0.0.1:8080/#!/register

# When can elements be deleted?:
- Groups:  By Admin, if not active, and no reports associated
- Members: By Admin, if not active. Access rules will be removed.
  Attendance records to reunions will remain on Reports.
- Weeks: By Admin, only when no reports are associated to that week
- Reports: By Creator, if the report is not Approved.
- Requests: By Creator, if the request is not Approved.
- Users: Cannot be deleted at this moment.
