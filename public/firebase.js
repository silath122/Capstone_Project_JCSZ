
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVpVkp6Girl-J_ryQ6oSY409--HKn-LVE",
  authDomain: "edge--devices-for-chrisinabox.firebaseapp.com",
  databaseURL: "https://edge--devices-for-chrisinabox-default-rtdb.firebaseio.com",
  projectId: "edge--devices-for-chrisinabox",
  storageBucket: "edge--devices-for-chrisinabox.appspot.com",
  messagingSenderId: "950126939733",
  appId: "1:950126939733:web:03b6432ccb239094f5cedc",
  measurementId: "G-G6M24K9XKS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// reference to firestore database
var db = firebase.firestore();

// Handle form submission
document.getElementById('deviceForm').addEventListener('submit', function (event) {
    event.preventDefault();
    // Get values from the form
    var deviceName = document.getElementById('deviceName').value.trim();
    var deviceProvider = document.getElementById('deviceProvider').value.trim();
    // Check if both fields are filled
    if (deviceName === '' || deviceProvider === '') {
        alert('Please fill in both device type and device software.');
        return;
    }
    // Prepare data to be added to Firestore
    var dataToAdd = {
        name: deviceName + " " + deviceProvider,
        image: deviceName,
        software: deviceProvider
    };
    // Add data to Firestore with the document ID as the device type
    db.collection('edge-devices').doc(deviceName).set(dataToAdd)
        .then(function () {
            console.log('Document successfully written!');
            alert('Device added successfully!');
        })
        .catch(function (error) {
            console.error('Error adding document: ', error);
            alert('Failed to add device. Please try again later.');
        });
  });
  
