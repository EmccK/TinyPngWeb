# TinyCompress - Image Compression Tool

[中文文档](README.zh-CN.md)

TinyCompress is a web application that allows you to compress images using the TinyPNG API. It provides a simple and intuitive interface for uploading, compressing, and downloading images.

## Features

- Upload and compress multiple images at once
- View compression statistics and history
- Download compressed images
- Automatic saving of compressed images on the server
- Docker support for easy deployment

## Prerequisites

- Node.js 18 or higher
- TinyPNG API key (get one for free at [https://tinypng.com/developers](https://tinypng.com/developers))

## Installation and Setup

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/image-compressor.git
   cd image-compressor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Production Mode (Local)

1. Build and start the production server (choose one of the following methods):

   **Method 1 - Using npm script:**
   ```bash
   npm run start
   ```

   **Method 2 - Using shell script (recommended):**
   ```bash
   chmod +x start.sh  # Make script executable (first time only)
   ./start.sh
   ```

   **Method 3 - Manual steps:**
   ```bash
   npm run build      # Build the frontend
   node proxy-server.js  # Start the server
   ```

2. Open your browser and navigate to `http://localhost:3001`

### Docker Deployment

1. Build and run using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

2. Check the logs to ensure everything is working:
   ```bash
   docker-compose logs -f
   ```

3. Access the application at `http://localhost:3001`

4. If you encounter any issues, you can rebuild and restart the container:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Environment Variables

- `PORT` - Port for the server (default: 3001)

## Project Structure

- `/src` - Frontend React application
- `/uploads` - Directory where compressed images are stored
- `/proxy-server.js` - Backend server for handling API requests and serving files

## GitHub Actions

This project includes GitHub Actions workflows for:

- Building and pushing Docker images to GitHub Container Registry
- Automated testing and linting

For detailed instructions on setting up GitHub repository permissions for Docker image publishing, please refer to [GitHub Setup Guide](GITHUB_SETUP.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [TinyPNG](https://tinypng.com/) for providing the compression API
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend server
