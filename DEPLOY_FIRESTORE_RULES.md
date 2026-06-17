# Deploy Firestore Rules

## The activity logs are failing because Firestore rules need to be deployed to Firebase.

## Steps to Deploy:

### Option 1: Using Firebase Console (Easiest)
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to "Firestore Database" in the left menu
4. Click on the "Rules" tab
5. Copy the content from `firestore.rules` file
6. Paste it into the rules editor
7. Click "Publish"

### Option 2: Using Firebase CLI
1. Install Firebase CLI if not installed:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project (if not done):
   ```
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept default file names

4. Deploy the rules:
   ```
   firebase deploy --only firestore:rules
   ```

## Current Rules (from firestore.rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    
    match /assignments/{assignmentId} {
      allow read, write: if request.auth != null;
    }
    
    match /visits/{visitId} {
      allow read, write: if request.auth != null;
    }
    
    match /questionnaire/{questionId} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    match /activityLogs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## After Deploying:
- Restart your app
- Try logging in again
- Activity logs should now work
