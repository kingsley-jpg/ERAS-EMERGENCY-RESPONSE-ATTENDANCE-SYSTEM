# ERAS — Emergency Response and Assistance System

ERAS is a web-based healthcare assistance platform designed to help users find nearby healthcare facilities, access essential health guidance, and interact with an emergency assistance chatbot.

The project aims to improve access to healthcare information and emergency resources through a simple, user-friendly web application.

## 🚀 Features

- 🏥 **Healthcare Facility Search:** Find nearby hospitals, clinics, and pharmacies.
- 📍 **Location-Based Search:** Uses OpenStreetMap services to help users discover healthcare facilities.
- 💬 **ERAS Chatbot:** Provides general health guidance and assistance.
- 📚 **Health Tutorials:** Offers links to educational resources from trusted health organizations.
- 📰 **Health Updates:** Connects users with health information and updates.
- 📱 **Responsive Interface:** Provides a straightforward interface for users across devices.

## 🛠️ Technologies Used

- **Python** — Backend programming
- **Flask** — Web framework and API endpoints
- **HTML, CSS, JavaScript** — Frontend development
- **Requests** — HTTP requests to external services
- **Leaflet** — Interactive maps
- **OpenStreetMap** — Map data and healthcare facility discovery

## 📂 Project Structure

```text
ERAS/
├── app.py
├── requirements.txt
├── README.md
└── .gitignore
```

*Your actual repository may contain additional files and folders.*

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or newer
- pip
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
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

If a `requirements.txt` file is available, use:

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

Open your browser and visit:

http://127.0.0.1:5000

## 🔍 How ERAS Works

1. Users access the ERAS homepage.
2. Users can search for nearby healthcare facilities.
3. The application uses location services and external map data to support facility discovery.
4. Users can interact with the ERAS chatbot for general health guidance.
5. Users can access health tutorials and links to relevant health organizations.

## 🔐 Security and Privacy

ERAS is under development. Future improvements may include stronger input validation, secure handling of user information, improved error handling, and additional automated tests.

Location access should be requested only when needed, and users should understand how their location is used.

## 🗺️ Future Improvements

- Improved chatbot capabilities
- More comprehensive and reliable healthcare facility data
- Enhanced backend API functionality
- Improved mobile accessibility
- Automated testing and API documentation
- Additional security and privacy protections
- Deployment and performance improvements

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork this repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request describing your contribution.

## ⚠️ Medical Disclaimer

ERAS provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Facility information may be incomplete or outdated.

In Ghana, call **112** for emergency assistance. Do not delay contacting emergency services to use this application.

## 📄 License

A license has not yet been specified. Add a license file if you intend to permit others to reuse, modify, or distribute this project.

---

**ERAS — Making healthcare information and emergency resources more accessible.**
