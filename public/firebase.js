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

// Reference to firestore database
var db = firebase.firestore();

// Function to fetch data either from cache or Firestore
async function fetchWithCache(collectionName) {
    var dataFromCache = localStorage.getItem(collectionName);
    console.log(dataFromCache);
    if (dataFromCache) {
        return JSON.parse(dataFromCache);
    } else {
        try {
            var snapshot = await db.collection(collectionName).get();
            var data = [];
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
            localStorage.setItem(collectionName, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error("Error fetching data from Firestore: ", error);
            return [];
        }
    }
}

async function updateLastUpdateTime() {
  const metadataRef = db.collection('metadata').doc('lastUpdate');
  await metadataRef.set({ lastUpdate: firebase.firestore.FieldValue.serverTimestamp() });
}

// Form submission event listener
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('deviceForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var deviceName = document.getElementById('deviceName').value.trim();
        var deviceProvider = document.getElementById('deviceProvider').value.trim();

        if (deviceName === '' || deviceProvider === '') {
            alert('Please fill in both device type and device software.');
            return;
        }

        var dataToAdd = {
            name: deviceName,
            image: deviceName,
            provider: deviceProvider
        };

        db.collection('edge-devices').doc(deviceName).set(dataToAdd)
            .then(function () {
                console.log('Document successfully written!');
                updateLastUpdateTime(); // Update last update timestamp
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });
            
    });

    // Search devices event listener
    document.querySelector('.search-box').addEventListener('input', function () {
        searchDevices();
    });

    // Filter devices event listener
    document.querySelectorAll('.filter-checkbox').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            applyFilters();
        });
    });
});

// Fetch edge devices from Firestore or cache
// Fetch edge devices from Firestore or cache
async function fetchEdgeDevices() {
  var container = document.getElementById("edge-devices-container");
  if (!container) return;

  container.innerHTML = ''; // Clear previous content

  var devices = [];
  var cacheLastUpdate = localStorage.getItem("lastUpdateTime");
  var metadataRef = db.collection("metadata").doc("lastUpdate");

  try {
      var metadataSnapshot = await metadataRef.get();
      var metadata = metadataSnapshot.data();

      if (metadata && metadata.lastUpdate && cacheLastUpdate) {
          var databaseLastUpdate = metadata.lastUpdate.toMillis();
          console.log(databaseLastUpdate);
          console.log(parseInt(cacheLastUpdate, 10));
          if (databaseLastUpdate < parseInt(cacheLastUpdate, 10)) {
              devices = JSON.parse(localStorage.getItem("edge-devices") || "[]");
          } else {
              var snapshot = await db.collection("edge-devices").get();
              snapshot.forEach(doc => {
                  devices.push(doc.data());
              });
              localStorage.setItem("edge-devices", JSON.stringify(devices));
              localStorage.setItem("lastUpdateTime", Date.now().toString());
          }
      } else {
          var snapshot = await db.collection("edge-devices").get();
          snapshot.forEach(doc => {
              devices.push(doc.data());
          });
          localStorage.setItem("edge-devices", JSON.stringify(devices));
          localStorage.setItem("lastUpdateTime", Date.now().toString());
      }
  } catch (error) {
      console.error("Error fetching edge devices: ", error);
  }

  devices.forEach(deviceData => {
      var deviceName = deviceData.name;
      var deviceProvider = deviceData.provider;

      var deviceDiv = document.createElement("div");
      deviceDiv.classList.add("device-card");

      var deviceLink = document.createElement("a");
      var deviceImg = document.createElement("img");
      var deviceNameVar = document.createElement("p");
      deviceNameVar.classList.add("device-name");
      var deviceProviderVar = document.createElement("p");
      deviceProviderVar.classList.add("device-provider");

      deviceLink.href = "device_details.html?device=" + deviceName;

      // Set image URL from cache or default
      var cachedImage = localStorage.getItem(deviceName + "_image");
      if (cachedImage) {
          deviceImg.src = cachedImage;
      } else {
          db.collection("provider-image-links").doc(deviceProvider).get().then((providerDoc) => {
              if (providerDoc.exists) {
                  var providerData = providerDoc.data();
                  var providerImage = providerData.imageLink;
                  deviceImg.src = providerImage;
                  localStorage.setItem(deviceName + "_image", providerImage); // Cache image
              } else {
                  deviceImg.src = "https://firebasestorage.googleapis.com/v0/b/edge--devices-for-chrisinabox.appspot.com/o/no_image.png?alt=media&token=4692339f-7f88-4a05-9654-9c27d220ff42";
              }
          }).catch((error) => {
              console.error("Error fetching provider image link: ", error);
          });
      }

      deviceImg.alt = deviceName;
      deviceNameVar.textContent = "" + deviceName;
      deviceProviderVar.textContent = "Provider: " + deviceProvider;

      deviceLink.appendChild(deviceImg);
      deviceDiv.appendChild(deviceLink);
      deviceDiv.appendChild(deviceNameVar);
      deviceDiv.appendChild(deviceProviderVar);
      container.appendChild(deviceDiv);
  });

  applyFilters(); // Apply filters after fetching devices
}

// Fetch providers from Firestore or cache
async function fetchProviders() {
  var providerFilterContainer = document.getElementById("provider-filters");
  if (!providerFilterContainer) return;

  providerFilterContainer.innerHTML = ''; // Clear existing filters

  var providers = await fetchWithCache("provider-image-links");
  console.log(providers);
  if (providers.length === 0) {
      // If cache is empty or outdated, fetch from Firestore
      db.collection("provider-image-links").get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              var providerName = doc.id;
              console.log("Provider Name:", providerName); // Log providerName
              var checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.className = "filter-checkbox";
              checkbox.value = providerName;
              checkbox.id = providerName;
              checkbox.addEventListener("change", applyFilters);

              var label = document.createElement("label");
              label.htmlFor = providerName;
              label.textContent = providerName; // Set label text directly

              providerFilterContainer.appendChild(checkbox);
              providerFilterContainer.appendChild(label);
              providerFilterContainer.appendChild(document.createElement("br"));
          });
      }).catch((error) => {
          console.error("Error fetching providers: ", error);
      });
  } else {
      // Use data from cache
      providers.forEach(provider => {
        var providerName = provider.provider;
          console.log("Provider Name:", providerName); // Log providerName
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "filter-checkbox";
          checkbox.value = providerName;
          checkbox.id = providerName;
          checkbox.addEventListener("change", applyFilters);

          var label = document.createElement("label");
          label.htmlFor = providerName;
          label.textContent = providerName; // Set label text directly

          providerFilterContainer.appendChild(checkbox);
          providerFilterContainer.appendChild(label);
          providerFilterContainer.appendChild(document.createElement("br"));
      });
  }
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

// Call fetchProviders after the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetchEdgeDevices();
    fetchProviders();
});

// Function to apply filters based on checkboxes
function applyFilters() {
    var selectedProviders = document.querySelectorAll('.filter-checkbox:checked');
    var selectedProviderNames = Array.from(selectedProviders).map(provider => provider.value);

    var devices = document.querySelectorAll('.device-card');
    if (selectedProviderNames.length === 0) {
        // Show all devices if no filters are selected
        devices.forEach(device => {
            device.style.display = "";
        });
        return;
    }

    devices.forEach(device => {
        var deviceProvider = device.querySelector('.device-provider').textContent.replace("Provider: ", "");
        if (selectedProviderNames.includes(deviceProvider)) {
            device.style.display = ""; // Show device if its provider is selected
        } else {
            device.style.display = "none"; // Hide device otherwise
        }
    });
}