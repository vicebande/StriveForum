# README for StriveForum - Fighting Game Community

## Overview

StriveForum is a web application designed for the fighting game community. It provides a platform for players to connect, discuss strategies, and find matches. The application features user authentication, forums for various games, and resources for learning and improving gameplay.

## Project Structure

The project is structured as follows:

```
entrega-1-fsk2-005-grupo-1-react
├── public
│   ├── index.html          # Main HTML file for the React application
│   └── static
│       ├── style
│       │   └── style.css   # CSS styles for the application
│       └── js
│           └── main.js     # JavaScript for pre-loading scripts
├── src
│   ├── main.jsx            # Entry point of the React application
│   ├── App.jsx             # Main App component
│   ├── index.css           # Global CSS styles
│   ├── components          # Contains all React components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── HomeSection.jsx
│   │   ├── DashboardSection.jsx
│   │   ├── ForumsSection.jsx
│   │   ├── MatchmakingSection.jsx
│   │   ├── LearningSection.jsx
│   │   └── modals          # Contains modal components
│   │       ├── LoginModal.jsx
│   │       ├── RegisterModal.jsx
│   │       ├── CreateTopicModal.jsx
│   │       └── EditProfileModal.jsx
│   ├── hooks               # Custom hooks
│   │   └── useAuth.js
│   ├── services            # API service functions
│   │   └── api.js
│   └── utils               # Utility functions
│       └── helpers.js
├── package.json            # npm configuration file
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd entrega-1-fsk2-005-grupo-1-react
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Features

- User authentication (login and registration)
- Discussion forums for various fighting games
- Matchmaking functionality
- Learning resources including tutorials and guides
- User dashboard with statistics and recent activity

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.