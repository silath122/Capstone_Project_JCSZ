// Your web app's Firebase configuration
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
const deviceProvidersRef = db.collection('provider-image-links');

// Fetch data from firestore and populate the dropdown
deviceProvidersRef.get().then((querySnapshot) => {
    const deviceProviderSelect = document.getElementById('deviceProvider');
    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.textContent = doc.data().provider;
        option.value = doc.id;
        deviceProviderSelect.appendChild(option);
    });
}).catch((error) => {
    console.error('Error fetching device providers:', error);
})

// Fetch data either from cache or Firestore
async function fetchWithCache(collectionName) {
    var dataFromCache = localStorage.getItem(collectionName);
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

// Change last updated time in Firestore
async function updateLastUpdateTime() {
  const metadataRef = db.collection('metadata').doc('lastUpdate');
  await metadataRef.set({ lastUpdate: firebase.firestore.FieldValue.serverTimestamp() });
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('deviceForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        // Get device info that is entered
        var deviceName = document.getElementById('deviceName').value.trim();
        var deviceProvider = document.getElementById('deviceProvider').value.trim();
        var deviceProductSpecs = document.getElementById('deviceProductSpecs').value.trim();

        // Make sure all necessary info is entered
        if (deviceName === '' || deviceProvider === '' || deviceProductSpecs == '') {
            alert('Please fill/select in both device type, device software, and the device product specification link.');
            return;
        }
        else {
            document.getElementById('provisionModal').hidden = false;
        }

        try {
            // Add the device document to edge-devices collection
            await db.collection('edge-devices').doc(deviceName).set({
                name: deviceName,
                provider: deviceProvider,
                productSpecsLink: deviceProductSpecs
            });
            // Get certifications
            var certifications = [];
            var certificationInputs = document.querySelectorAll('.certification');
            certificationInputs.forEach(function(certInput) {
                var certificationProductName = certInput.querySelector('input[name="certificationProductName"]').value.trim();
                var certificationArchitecture = certInput.querySelector('input[name="certificationArchitecture"]').value.trim();
                if (certificationProductName !== '' && certificationArchitecture !== '') {
                    certifications.push({ product: certificationProductName, architecture: certificationArchitecture });
                }
            });

            // Add certifications to the sub-collection under the device document
            var certificationsCollection = db.collection('edge-devices').doc(deviceName).collection('certifications');
            certifications.forEach(async function(certification) {
                await certificationsCollection.doc(certification.product).set(certification);
            });
        
            // Clear input fields
            document.getElementById('deviceName').value = '';
            document.getElementById('deviceProvider').value = '';
            document.getElementById('deviceProductSpecs').value = '';
            
            // Remove additional certification input fields
            var certificationInputs = document.querySelectorAll('.certification');
            for (var i = 1; i < certificationInputs.length; i++) {
                certificationInputs[i].remove();
            }

            showModal();

            // Show provisioning modal
            function showModal() {
              const modal = document.getElementById('provisionModal');
              const backdrop = document.getElementById('modalBackdrop');
              modal.hidden = false;
              backdrop.hidden = false;
            }

            // Hide provisioning modal
            function hideModal() {
                const modal = document.getElementById('provisionModal');
                const backdrop = document.getElementById('modalBackdrop');
                modal.hidden = true;
                backdrop.hidden = true;
            }

            document.getElementById('provisionModal').hidden = false;

            // Event listener for 'Yes' button to provision the device
            document.getElementById('provisionYes').addEventListener('click', async () => {
                hideModal();
                await createDeviceBranch(deviceName);
            });

            // Event listener for 'No' button to close the modal
            document.getElementById('provisionNo').addEventListener('click', function() {
                hideModal();
            });

            updateLastUpdateTime();
        } catch (error) {
            alert('Error: Edge device could not be added.');
            console.error('Error adding document: ', error);
        }
        
        // Add your GitHub Personal Access Token here
        const githubToken = 'token';

        async function createDeviceBranch(deviceName) {
          const repoOwner = 'juliakempton';
          const repoName = 'Edge-Devices-for-chRIS-blank';
          showLoader();

          // Check if token is entered
          try {
              if (githubToken === 'token') {
                  hideLoader();
                  await delay(100);
                  alert('Please enter a valid GitHub token.');
                  return;
              }
      
              const mainBranchResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/branches/main`, {
                  headers: {
                      Authorization: `token ${githubToken}`,
                      'Content-Type': 'application/json',
                  },
              });
      
              const mainBranchData = await mainBranchResponse.json();
              const mainBranchSha = mainBranchData.commit.sha;
              const branchName = await createUniqueBranchName(repoOwner, repoName, deviceName);
      
              await createBranch(repoOwner, repoName, branchName, mainBranchSha);
              const fileName = `${branchName}.txt`;
              await addFileToRepo(fileName, 'This is a new file added via API.', branchName);
              await createPullRequest(repoOwner, repoName, branchName);
      
              hideLoader();
              await delay(100);
              alert("Device provisioned successfully.");
          } catch (error) {
              hideLoader();
              await delay(100);
              alert(`Error during device provisioning: ${error}`);
          }
      }
      
      function delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      }
      // Create a unique branch name based on the device name
      async function createUniqueBranchName(repoOwner, repoName, deviceName) {
          const branchesUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches`;

          try {
              const branchesResponse = await fetch(branchesUrl, {
                  headers: {
                      Authorization: `token ${githubToken}`,
                      'Content-Type': 'application/json',
                  },
              });

              if (!branchesResponse.ok) {
                  throw new Error('Error fetching branches data');
              }

              const branchesData = await branchesResponse.json();

              const deviceBranches = branchesData.filter(branch => branch.name.startsWith(deviceName.replace(/\s/g, '_')));
              const branchCount = deviceBranches.length;

              // Create a unique branch name
              const uniqueBranchName = `${deviceName.replace(/\s/g, '_')}_${branchCount + 1}`;

              return uniqueBranchName;
          } catch (error) {
              console.error('Error creating unique branch name:', error);
              return null;
          }
        }

        // Create a branch for the device in the repo
        async function createBranch(repoOwner, repoName, branchName, baseSha) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`;
            const requestData = {
                ref: `refs/heads/${branchName}`,
                sha: baseSha,
            };
            // Create branch for device
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `token ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
                if (!response.ok) {
                    console.error('Error creating branch:', response.statusText);
                }
            } catch (error) {
                console.error('Error creating branch:', error);
            }
        }

        // Add file for device to branch in repo
        async function addFileToRepo(fileName, fileContent, branchName) {
            const repoOwner = 'juliakempton'; 
            const repoName = 'Edge-Devices-for-chRIS-blank';
            const filePath = `devices/${fileName}`; 
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

            // Get the current file SHA if it exists
            const getFileUrl = `${apiUrl}?ref=${branchName}`;
            const getFileResponse = await fetch(getFileUrl, {
                headers: {
                    Authorization: `token ${githubToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const getFileData = await getFileResponse.json();
            const fileSha = getFileData.sha;

            const requestData = {
                message: `Add ${fileName}`,
                content: btoa(fileContent),
                branch: branchName,
                sha: fileSha,
            };

            // Add the file to the branch
            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        Authorization: `token ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
                if (!response.ok) {
                    console.error('Error adding/updating file:', response.statusText);
                }
            } catch (error) {
                console.error('Error adding/updating file:', error);
            }
        }

        // Create pull request for file's branch
        async function createPullRequest(repoOwner, repoName, branchName) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;
            const requestData = {
                title: 'New Pull Request', 
                body: 'This is a new pull request created using the GitHub API.',
                head: branchName,
                base: 'main',
            };

            // Create pull request
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `token ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
            } catch (error) {
                console.error('Error creating pull request:', error);
            }
        }
    });

    // An 'add more' button event listener for form submission certifications
    document.getElementById('addCertification').addEventListener('click', function () {
        var certificationsDiv = document.getElementById('certifications');
        var newCertificationDiv = document.createElement('div');

        document.getElementById('addCertification').style.marginTop = '10px';

        newCertificationDiv.classList.add('certification');
        newCertificationDiv.innerHTML = `
            <input type="text" class="form-control" name="certificationProductName" placeholder="Enter Product Certification Name">
            <input type="text" class="form-control" name="certificationArchitecture" placeholder="Enter Architecture Certification Name">
        `;
        
        // Add space between inputs
        newCertificationDiv.style.marginTop = '10px';
        newCertificationDiv.style.marginBottom = '10px';

        certificationsDiv.insertBefore(newCertificationDiv, document.getElementById('addCertification'));
    });

    // Event listener for input changes
    document.getElementById('deviceProvider').addEventListener('input', function (event) {
        var selectedProvider = event.target.value.trim();
        document.getElementById("providerDropdown").innerText = selectedProvider;
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

function showLoader() {
  document.getElementById('loader').hidden = false;
}

function hideLoader() {
  document.getElementById('loader').hidden = true;
}

// Fetch edge devices from Firestore or cache
async function fetchEdgeDevices(forceRefresh = false) {
  var container = document.getElementById("edge-devices-container");
  if (!container) return;

  // Clears previous content
  container.innerHTML = '';

  var devices = [];
  var cacheLastUpdate = localStorage.getItem("lastUpdateTime");
  var metadataRef = db.collection("metadata").doc("lastUpdate");

  try {
      var metadataSnapshot = await metadataRef.get();
      var metadata = metadataSnapshot.data();
      if (!forceRefresh && metadata && metadata.lastUpdate && cacheLastUpdate) {
          var databaseLastUpdate = metadata.lastUpdate.toMillis();
          // Check if database or cache was updated more recently
          if (databaseLastUpdate < parseInt(cacheLastUpdate, 10)) {
              devices = JSON.parse(localStorage.getItem("edge-devices") || "[]");
          } else {
              forceRefresh = true;
          }
      }

      if (forceRefresh || !cacheLastUpdate) {
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

  // Display device data
  devices.forEach(deviceData => {
    var deviceName = deviceData.name;
    var deviceProvider = deviceData.provider;

    var deviceDiv = document.createElement("div");
    deviceDiv.classList.add("device-card");
    deviceDiv.onclick = () => {
      window.location.href = "device_details.html?device=" + deviceName;
    };

    var deviceImg = document.createElement("img");
    var deviceNameVar = document.createElement("p");
    deviceNameVar.classList.add("device-name");
    var deviceProviderVar = document.createElement("p");
    deviceProviderVar.classList.add("device-provider");

    var deviceLink = document.createElement("a");
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
                localStorage.setItem(deviceName + "_image", providerImage);
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

  applyFilters();
}

// Fetch providers from Firestore or cache
async function fetchProviders() {
  var providerFilterContainer = document.getElementById("provider-filters");
  if (!providerFilterContainer) return;

  providerFilterContainer.innerHTML = ''; // Clear existing filters

  var providers = await fetchWithCache("provider-image-links");
  if (providers.length === 0) {
      // If cache is empty or outdated, fetch from Firestore
      db.collection("provider-image-links").get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              var providerName = doc.id;
              var checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.className = "filter-checkbox";
              checkbox.value = providerName;
              checkbox.id = providerName;
              checkbox.addEventListener("change", applyFilters);

              var label = document.createElement("label");
              label.htmlFor = providerName;
              label.textContent = providerName;

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
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "filter-checkbox";
          checkbox.value = providerName;
          checkbox.id = providerName;
          checkbox.addEventListener("change", applyFilters);

          var label = document.createElement("label");
          label.htmlFor = providerName;
          label.textContent = providerName;

          providerFilterContainer.appendChild(checkbox);
          providerFilterContainer.appendChild(label);
          providerFilterContainer.appendChild(document.createElement("br"));
      });
  }
}

// Search through devices based on user input
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

document.addEventListener('DOMContentLoaded', function () {
    fetchEdgeDevices();
    fetchProviders();
    document.getElementById('refreshData').addEventListener('click', function () {
      fetchEdgeDevices(true); // Force refresh from Firestore
  });
});

// Apply filters based on checkboxes
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
