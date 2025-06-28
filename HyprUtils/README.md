# HyprUtils

HyprUtils is a lightweight, local-only web application designed as a modern replacement for rofi on Arch Linux with the Hyprland compositor. It offers a clean, searchable interface for launching applications, setting wallpapers, and running shell commands, all with live CSS theming capabilities. The app is designed for complete keyboard navigation and can be launched instantly via Hyprland keybindings.

## Overview

HyprUtils is built with a ReactJS-based frontend and an Express-based backend. The application operates exclusively on the user’s local machine, ensuring privacy and security. The frontend uses Vite for development, and Tailwind CSS for styling, with the integration of the shadcn/ui component library. The backend implements REST API endpoints and communicates with a MongoDB database using Mongoose. Both the frontend and backend run concurrently with the help of the `concurrently` package.

### Architecture
- **Frontend**: Located in the `client/` directory, it’s developed using ReactJS with Vite, and styled using Tailwind CSS. It provides a responsive user interface with components organized in the `client/src` directory.
- **Backend**: Found in the `server/` directory, it's built with Express, providing REST API endpoints and database interactions through Mongoose.
- **Database**: Utilizes MongoDB for data storage, configured through Mongoose.
- **Concurrency**: Managed by the `concurrently` package, allowing simultaneous running of frontend and backend servers.

## Features

- **App Launcher**: Allows users to search, filter, and launch applications quickly and efficiently.
- **Wallpaper Setter**: Enables users to browse, set, and manage desktop wallpapers from a configured directory.
- **Script Runner**: Provides a terminal-like interface for running shell commands with a display of command history and outputs.
- **Live Theming**: Offers multiple themes with a live preview, allowing users to switch themes instantly.
- **Complete Keyboard Navigation**: Ensures that all interactions within the app can be performed through keyboard shortcuts.

## Getting Started

### Requirements

Ensure the following technologies are set up on your computer:
- Node.js (version 14.x or above)
- NPM (version 6.x or above)
- MongoDB (running locally or accessible remotely)

### Quickstart

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-folder>
    ```

2. Install all required dependencies:
    ```sh
    npm install
    ```

3. Configure environment variables:
    - Create a `.env` file in the `server/` directory with the following content:
      ```env
      PORT=3000
      MONGODB_URI=mongodb://localhost:27017/hyprutils
      SESSION_SECRET=your_secret_key
      ```

4. Start the application:
    ```sh
    npm run start
    ```

5. Access the application through your web browser at:
    ```sh
    http://localhost:5173
    ```

### License

The project is proprietary (not open source). 

```
Copyright (c) 2024.
```