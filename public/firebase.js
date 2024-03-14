
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
        var deviceName = document.getElementById('deviceName').value.trim();
        var deviceProvider = document.getElementById('deviceProvider').value.trim();
        // Check if both fields are filled

        if (deviceName === '' || deviceProvider === '') {
            alert('Please fill in both device type and device software.');
            return;
        }
        // Prepare data to be added to Firestore
        var dataToAdd = {
            name: deviceName,
            image: deviceName,
            provider: deviceProvider
        };
        // Add data to Firestore with the document ID as the device type
        db.collection('edge-devices').doc(deviceName).set(dataToAdd)
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
            // HTML elements for each edge device and its attributes in the collection
            var deviceData = doc.data();
            var deviceName = deviceData.name;
            var deviceProvider = deviceData.provider;

            // Create elements
            var deviceDiv = document.createElement("div");
            deviceDiv.classList.add("device-card"); // Add class to device div
            var deviceLink = document.createElement("a");
            var deviceImg = document.createElement("img");
            var deviceNameVar = document.createElement("p");
            deviceNameVar.classList.add("device-name"); // Add class to device name
            var deviceProviderVar = document.createElement("p");
            deviceProviderVar.classList.add("device-provider"); // Add class to device provider

            // Set attributes and content
            deviceLink.href = "device_details.html?device=" + deviceName;

            // Fetch the image link from provider-image-links collection based on the provider name
            db.collection("provider-image-links").doc(deviceProvider).get().then((providerDoc) => {
                if (providerDoc.exists) {
                    var providerData = providerDoc.data();
                    var providerImage = providerData.imageLink;

                    // Set the image URL for the device
                    deviceImg.src = providerImage;
                } else {
                    // Handle the case where no image link is found for the provider
                    deviceImg.src = "https://firebasestorage.googleapis.com/v0/b/edge--devices-for-chrisinabox.appspot.com/o/no_image.png?alt=media&token=4692339f-7f88-4a05-9654-9c27d220ff42"; // Provide a default image link
                }

                // Set other attributes and content
                deviceImg.alt = deviceName;
                deviceNameVar.textContent = "" + deviceName;
                deviceProviderVar.textContent = "Provider: " + deviceProvider;

                // Append elements
                deviceLink.appendChild(deviceImg);
                deviceDiv.appendChild(deviceLink);
                deviceDiv.appendChild(deviceNameVar);
                deviceDiv.appendChild(deviceProviderVar);
                container.appendChild(deviceDiv);
            }).catch((error) => {
                console.error("Error fetching provider image link: ", error);
            });
        });
    }).catch((error) => {
        console.error("Error fetching devices: ", error);
    });
}
function searchDevices() {
    var input, filter, devices, deviceName, i;
    input = document.querySelector('.search-box');
    filter = input.value.toUpperCase();
    devices = document.querySelectorAll('.device-card');

    // Loop through all device cards and hide those that don't match the search input
    for (i = 0; i < devices.length; i++) {
        deviceName = devices[i].querySelector('.device-name');
        if (deviceName.textContent.toUpperCase().indexOf(filter) > -1) {
            devices[i].style.display = "";
        } else {
            devices[i].style.display = "none";
        }
    }
}