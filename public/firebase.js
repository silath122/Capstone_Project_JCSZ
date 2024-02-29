
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

// form submission from 
document.addEventListener('DOMContentLoaded', function () {
    // Handle form submission
    document.getElementById('deviceForm').addEventListener('submit', function (event) {
        event.preventDefault();
        // Get values from the form
        var deviceType = document.getElementById('deviceType').value.trim();
        var deviceSoftware = document.getElementById('deviceSoftware').value.trim();
        // Check if both fields are filled

        if (deviceType === '' || deviceSoftware === '') {
            alert('Please fill in both device type and device software.');
            return;
        }
        // Prepare data to be added to Firestore
        var dataToAdd = {
            name: deviceType + " " + deviceSoftware,
            image: deviceType,
            provider: deviceSoftware
        };
        // Add data to Firestore with the document ID as the device type
        db.collection('edge-devices').doc(deviceType).set(dataToAdd)
            .then(function () {
                console.log('Document successfully written!');
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });
    });
});


// Function to fetch edge devices from Firestore for "select_edge_device.html"
function fetchEdgeDevices() {
    var container = document.getElementById("edge-devices-container");
    if (!container) return; // Check if container exists
    container.innerHTML = ''; // Clear previous content
    db.collection("edge-devices").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // HTML elements for each edge device and it's attributes in the collection
            var deviceData = doc.data();
            var deviceName = deviceData.name;
            var deviceImage = deviceData.image;
            var deviceProvider = deviceData.provider;

            // Create elements
            var deviceDiv = document.createElement("div");
            var deviceLink = document.createElement("a");
            var deviceImg = document.createElement("img");
            var deviceNameVar = document.createElement("p")
            var deviceProviderVar = document.createElement("p");

            // Set attributes and content
            deviceLink.href = "device_details.html?device=" + deviceName;
            deviceImg.src = deviceImage;
            deviceImg.alt = deviceName;
            deviceImg.classList.add("edge-devices");
            deviceNameVar.textContent = "" + deviceName;
            deviceProviderVar.textContent = "Provider: " + deviceProvider;

            // Append elements
            deviceLink.appendChild(deviceImg);
            deviceDiv.appendChild(deviceLink);
            deviceDiv.appendChild(deviceNameVar);
            deviceDiv.appendChild(deviceProviderVar);
            container.appendChild(deviceDiv);

        });
    }).catch((error) => {
        console.error("Error fetching devices: ", error);
    });
}
