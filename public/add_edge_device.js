// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDVpVkp6Girl-J_ryQ6oSY409--HKn-LVE",
  authDomain: "edge--devices-for-chrisinabox.firebaseapp.com",
  projectId: "edge--devices-for-chrisinabox",
  storageBucket: "edge--devices-for-chrisinabox.appspot.com",
  messagingSenderId: "950126939733",
  appId: "1:950126939733:web:03b6432ccb239094f5cedc",
  measurementId: "G-G6M24K9XKS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
var db = firebase.firestore();