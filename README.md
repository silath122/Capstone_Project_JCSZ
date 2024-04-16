# Edge Device Provisioning for ChRIS
## Overview
This project consists of a website that a user can go to in order to easily provision an edge device as well as ChRIS software for the edge device. From the home page, the user can either select an existing edge device or add a new edge device to the catalog. On the Select Edge Device page, there is a list of current devices, along with options to filter or search through the devices. Once they go to a specific device's details page, the user can view further information about the device . Then, they are able to provision the device (which triggers a GitHub workflow) or edit details of the device. On the Add Edge Device page, the user can create a new device in the catalog with several different parameters. After submitting the device, they can also choose to provision the device directly from that page.

This project is closely aligned with the ongoing work on ChRIS, an open source framework that utilizes cloud technologies to democratize medical analytics application development and enables healthcare organizations to keep owning their data while benefiting from public cloud processing capabilities. The goal of the wider project is to make edge device provisioning and medical analytics simpler and more accessible for hospitals in regions with limited resources, supporting the global mission to enhance healthcare services. 


## Features
- Browsing a pre-existing list of devices with a search bar and filters
- Selecting an edge device to provision from that list
- Adding a new edge device to the list and provisioning the device
- Editing details of the device

## Tools and Dependencies
- Frontend: HTML, CSS, JavaScript
- Backend: Firebase Firestore
- Hosting: Firebase Hosting
- Styling: PatternFly
- APIs: GitHub API

## Prerequisites
- Firebase account (if you want to access the database)
- GitHub account (for API integration and device provisioning)

## Setting Up the Project
1. Clone the repository:
    ```git clone https://github.com/silath122/Capstone_Project_JCSZ.git```
2. Navigate to the project directory
3. Install dependencies (if necessary)
4. Set up the GitHub API:
Create a Personal Access Token (PAT) on GitHub with the necessary permissions for the blank GitHub repo and replace the placeholder variable ```githubToken``` in device_details.html with your PAT.
5. Run the application in your local server or navigate to https://edge--devices-for-chrisinabox.web.app/. In order to start the application locally in VSCode, install the Live Server extension and click the "Go Live" button at the bottom right of the application when you have the public folder of the GitHub repository open.

## Interacting with the GitHub API
The GitHub API is used in this project to help mimic the behavior that the website will perform when provisioning a device and interacting with the existing GitHub provisioning workflow. When the user clicks the "Provision Device" button on a device's details page or chooses to provision a newly added device, the GitHub API is invoked to make a pull request in a blank GitHub repository (https://github.com/juliakempton/Edge-Devices-for-chRIS-blank).

In order to create a pull request, there needs to be a change in the repository that can be pulled. So, a new unique branch and a file that are named after the device being provisioned are created during the provisioning process. Then, the pull request is submitted to the blank repository. Once the pull request is approved and merged, a GitHub Actions workflow is triggered that deletes the branch associated with the device being provisioned.

Make sure that you have the correct permissions set in your GitHub PAT to allow repository modifications.

## Issues
The main issue left to be addressed with this project is integration with the existing provisioning workflow, which will replace the current connection between the website and the blank GitHub repository. Another way the website could be improved is by adding the ability to create user accounts, which would allow for more specific actions, such as editing only the devices the given user created and storing information about devices that were previously provisioned. The website would also be a lot more usable for everyone if the GitHub access token was stored in a more accessible location, while still retaining its privacy. The token currently must be manually inserted into the code before running the provisioning workflow, which limits who can use the provisioning feature on the website. There are also some small UI and usability aspects that could improve the user experience on the website.

## Contact Information
For any questions or concerns, please email us:
* Channing Smith, smithcs@g.cofc.edu, College of Charleston <br />
* Julia Kempton, kemptonjq@g.cofc.edu, College of Charleston <br />
* Siah Thomas, thomassl1@g.cofc.edu, College of Charleston <br />
* Zi Yi Xiao, xiaoz1@g.cofc.edu, College of Charleston <br />
* Isaiah Stapleton, istaplet@redhat.com, Red Hat <br />
