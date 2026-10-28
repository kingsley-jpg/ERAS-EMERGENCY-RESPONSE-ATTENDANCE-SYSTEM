# ERAS — Emergency Response and Assistance System

ERAS is a web-based healthcare assistance platform designed to help users locate nearby healthcare facilities, access essential health guidance, and interact with an emergency assistance chatbot.

The project aims to make healthcare information and emergency resources more accessible through a simple, user-friendly interface.

## Features

- **Healthcare Facility Search:** Find nearby hospitals, clinics, and pharmacies.
- **Location-Based Search:** Uses OpenStreetMap services to support healthcare facility discovery.
- **ERAS Chatbot:** Interact with a chatbot for general health guidance and assistance.
- **Health Tutorials:** Access educational resources from trusted health organizations.
- **Health Updates:** Find links to health information and updates from relevant organizations.
- **Responsive Interface:** Designed to provide a straightforward user experience across devices.

## Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript
- **HTTP Requests:** Requests library
- **Mapping and Location:** Leaflet, OpenStreetMap
- **External Data:** OpenStreetMap and related location services

## Project Structure

```text
ERAS/
├── app.py
├── venv/
└── README.md
```

*The structure above is a simplified example. Update it to match the actual files in your repository. Do not upload your virtual environment (`venv/`) to GitHub.*

## Getting Started

### Prerequisites

Install the following before running ERAS:

- Python 3.10 or newer
- pip
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_REPOSITORY_FOLDER
```

Replace the placeholders with your actual GitHub repository URL and folder name.

### 2. Create a Virtual Environment

**Windows:**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux/macOS:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install flask requests
```

### 4. Run the Application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

## How It Works

1. Users open the ERAS homepage
