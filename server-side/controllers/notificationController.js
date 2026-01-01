const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.sendNotificationToUser = async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken) return res.status(400).send("Token required");

  const message = {
    notification: {
      title: title || "Test Title",
      body: body || "Test Body",
    },
    token: fcmToken, 
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Sent successfully:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending:", error);
    res.status(500).json({ error: error.code, message: error.message });
  }
};