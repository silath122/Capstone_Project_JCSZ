# Edge Device Provisioning for ChRIS
## Overview
This project aims to make edge device provisioning and medical analytics simpler and
more accessible for hospitals in regions with limited resources, supporting the global
mission to enhance healthcare services. This project consists of a
website that a user can go to in order to easily provision an edge device as well as
ChRIS software for the edge device.

This project is closely aligned with the ongoing work on ChRIS, an open source
framework that utilizes cloud technologies to democratize medical analytics application
development and enables healthcare organizations to keep owning their data while
benefiting from public cloud processing capabilities.

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
Create a Personal Access Token (PAT) on GitHub with the necessary permissions and replace the placeholder variable ```githubToken``` in device_details.html with your PAT.
5. Run the application:
Start your local server or navigate to https://edge--devices-for-chrisinabox.web.app/

## Interacting with the GitHub API
The GitHub API is used for creating branches, adding files, and creating pull requests when provisioning a device.
Make sure that you have the correct permissions set in your GitHub PAT to allow repository modifications.