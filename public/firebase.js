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
    document.getElementById('deviceForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        

        var deviceName = document.getElementById('deviceName').value.trim();
        var deviceProvider = document.getElementById('deviceProvider').value.trim();
        var deviceProductSpecs = document.getElementById('deviceProductSpecs').value.trim();

        if (deviceName === '' || deviceProvider === '' || deviceProductSpecs == '') {
            alert('Please fill in both device type, device software, and the device product specification link.');
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

            showModal(); // Call this function to show the modal and backdrop

            function showModal() {
              const modal = document.getElementById('provisionModal');
              const backdrop = document.getElementById('modalBackdrop');
              modal.hidden = false;
              backdrop.hidden = false;
            }
          
            function hideModal() {
                const modal = document.getElementById('provisionModal');
                const backdrop = document.getElementById('modalBackdrop');
                modal.hidden = true;
                backdrop.hidden = true;
            }


            document.getElementById('provisionModal').hidden = false; // Show the modal after successful addition

            // Event listener for 'Yes' button to provision the device
            document.getElementById('provisionYes').addEventListener('click', async () => {
                await createDeviceBranch(deviceName); // Provisioning or related actions
                hideModal();
            });

            // Event listener for 'No' button to close the modal
            document.getElementById('provisionNo').addEventListener('click', function() {
                hideModal();

            });

            console.log('Device and certifications successfully added to Firestore!');
            updateLastUpdateTime();
        } catch (error) {
            // Display error message
            alert('Error: Edge device could not be added.');
            console.error('Error adding document: ', error);
        }
          // Add your GitHub Personal Access Token here
        const githubToken = 'token';

        async function createDeviceBranch(deviceName) {
            const repoOwner = 'juliakempton'; // Replace with the owner of the repository
            const repoName = 'Edge-Devices-for-chRIS-blank'; // Replace with the name of your repository

            // Fetch the latest commit SHA of the main branch
            const mainBranchUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/branches/main`;
            const mainBranchResponse = await fetch(mainBranchUrl, {
                headers: {
                    Authorization: `token ${githubToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const mainBranchData = await mainBranchResponse.json();
            const mainBranchSha = mainBranchData.commit.sha;

            // Create a unique branch name based on device name and count
            const branchName = await createUniqueBranchName(repoOwner, repoName, deviceName);

            // Create a new branch from the main branch
            await createBranch(repoOwner, repoName, branchName, mainBranchSha);

            // Create a new file in the devices folder
            const fileName = `${branchName}.txt`; // Example: "DeviceName_BranchName.txt"
            await addFileToRepo(fileName, 'This is a new file added via API.', branchName);

            // Create a pull request to merge the new branch with the main branch
            await createPullRequest(repoOwner, repoName, branchName);
        }

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

                // Create a unique branch name based on device name and count
                const uniqueBranchName = `${deviceName.replace(/\s/g, '_')}_${branchCount + 1}`;

                return uniqueBranchName;
            } catch (error) {
                console.error('Error creating unique branch name:', error);
                return null;
            }
        }

        async function createBranch(repoOwner, repoName, branchName, baseSha) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`;
            const requestData = {
                ref: `refs/heads/${branchName}`,
                sha: baseSha,
            };

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

        async function addFileToRepo(fileName, fileContent, branchName) {
            const repoOwner = 'juliakempton'; // Replace with the owner of the repository
            const repoName = 'Edge-Devices-for-chRIS-blank'; // Replace with the name of your repository
            const filePath = `devices/${fileName}`; // Specify the file path in the repository
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
                message: `Add ${fileName}`, // Commit message
                content: btoa(fileContent), // Encode file content in base64
                branch: branchName, // Specify the branch
                sha: fileSha, // Provide the SHA if the file exists, or null if it's a new file
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT', // Use PUT to update the file
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

        async function createPullRequest(repoOwner, repoName, branchName) {
            const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;
            const requestData = {
                title: 'New Pull Request', // Title of the pull request
                body: 'This is a new pull request created using the GitHub API.', // Body of the pull request
                head: branchName, // Branch you're merging from
                base: 'main', // Branch you're merging into
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: `token ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
                if (response.ok) {
                    alert("Device provisioned successfully.");
                } else {
                    console.error('Error creating pull request:', responseData.message);
                }
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
            console.log("Selected provider:", selectedProvider); // Log selected provider
            document.getElementById("providerDropdown").innerText = selectedProvider; // Update button text
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


// Fetch providers from Firestore and populate dropdown for add_edge_device.html page
async function fetchProvidersAddEdge() {
    var providerDropdownMenu = document.getElementById("providerDropdownMenu");
    if (!providerDropdownMenu) return;

    try {
        var snapshot = await db.collection("provider-image-links").get();
        snapshot.forEach((doc) => {
            var providerName = doc.data().provider;
            var listItem = document.createElement("li");
            var anchor = document.createElement("a");
            anchor.href = "#";
            anchor.textContent = providerName;
            anchor.dataset.provider = providerName; // Store provider name as a dataset attribute
            listItem.appendChild(anchor);
            providerDropdownMenu.appendChild(listItem);
        });

        // Add event listener to the dropdown menu to handle item clicks
        providerDropdownMenu.addEventListener('click', function(event) {
            var selectedProvider = event.target.dataset.provider; // Retrieve provider name from dataset attribute
            if (selectedProvider) {
                console.log("Selected provider:", selectedProvider); // Log selected provider
                document.getElementById("providerDropdown").innerText = selectedProvider; // Update button text
            }
        });

    } catch (error) {
        console.error("Error fetching providers: ", error);
    }

    console.log("Fetching provider data...");
    try {
        var snapshot = await db.collection("provider-image-links").get();
        var providerNames = [];
        snapshot.forEach((doc) => {
            var providerName = doc.id;
            providerNames.push(providerName); // Store provider names
        });
        console.log("Provider names:", providerNames); // Log retrieved provider names
    } catch (error) {
        console.error("Error fetching providers: ", error);
    }
}


// Fetch edge devices from Firestore or cache
async function fetchEdgeDevices() {
  var container = document.getElementById("edge-devices-container");
  if (!container) return;

  container.innerHTML = ''; // clears previous content

  var devices = [];
  var cacheLastUpdate = localStorage.getItem("lastUpdateTime"); // see when was the last time data was added
  var metadataRef = db.collection("metadata").doc("lastUpdate");
  try {
      var metadataSnapshot = await metadataRef.get();
      var metadata = metadataSnapshot.data();
      if (metadata && metadata.lastUpdate && cacheLastUpdate) {
          var databaseLastUpdate = metadata.lastUpdate.toMillis();

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

document.addEventListener('DOMContentLoaded', function () {
    fetchProvidersAddEdge();
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