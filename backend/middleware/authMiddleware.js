const admin = require("firebase-admin");


let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('../permissionLab-backend-firebase-key.json');
}

// 1. Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 2. The Middleware Function
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization; // Frontend sends "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "No Token Provided 🔒" });
  }

  try {
    // Remove 'Bearer ' prefix to get just the token string
    const idToken = token.split(" ")[1];

    // Verify with Google
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // CHECK: Is this YOU? (IMPORTANT: Change this email!)👇
    if (decodedToken.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: "Access Denied: You are not the Admin! 🚫" });
    }

    // Success! 
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = verifyToken;