# MindfulMedia README

## Table of Contents
1. [About](#about)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)

## About
MindfulMedia is a media tracker designed specifically for video games. Users will be able to track what games they want to play, are currently playing, and have completed. Users will be able to sort games based on categories, rate them, and create a personal log for thoughts on each respective game. The rating system will be implemented to prioritize highly rated games to make it easier for the user to find more games they want to try. Unlike other generic media trackers, MindfulMedia will focus fully on video game tracking for accurate and in-depth game analytics.

## Prerequisites
- Setup guide: [React Environment Setup](https://www.geeksforgeeks.org/reactjs/reactjs-environment-setup/)
- Download [Node.js](https://nodejs.org/en/download/current) (v24.2.0+ for consistency)

```shell
# Verify the Node.js version:
node -v  # Should print "v24.2.0"

# Verify npm version:
npm -v   # Should print "11.3.0"
```

## Installation
- Rename the project folder to mindfulmedia (remove capitals; npm capitalization is deprecated)
- Navigate to mindfulmedia

```shell
cd mindfulmedia/frontend
# Install dependencies (frontend)
npm install react@latest react-scripts react-dom@latest react-router-dom@latest

# and

cd mindfulmedia/backend
# Install dependencies (backend)
npm install dotenv express express_session cors session passport passport-steam localtunnel mysql2
```

- Launch mindfulmedia

```shell
npm start
```

## Configuration
### VS Code Profile
- [One-click profile](https://insiders.vscode.dev/profile/github/fb4eb358cc02b100460238da5f90b7ab)
  - Note: If it fails to launch VS Code, import the profile in VS Code and paste the link
