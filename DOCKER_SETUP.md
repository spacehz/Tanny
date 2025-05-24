# Docker Setup for Tanny Application

This document provides detailed instructions on how to deploy the Tanny application using Docker and Docker Compose on your VM with IP 192.168.88.96.

## Prerequisites

- Docker and Docker Compose installed on your VM
- Git to clone the repository (or transfer the files to the VM)

## Deployment Steps

1. **Clone or transfer the project to your VM**

   ```bash
   git clone <repository-url> /path/to/tanny
   cd /path/to/tanny
   ```

2. **Environment Variables**

   The application uses .env.docker files for configuration:
   
   - Backend: `backend/.env.docker`
   - Frontend: `frontend/.env.docker`
   
   These files have been created with default values that should work with your VM's IP address (192.168.88.96).

3. **Use the Deployment Scripts**

   For Linux/Mac:
   ```bash
   chmod +x docker-deploy.sh
   ./docker-deploy.sh
   ```

   For Windows:
   ```bash
   docker-deploy.bat
   ```

   These scripts will:
   - Stop any running containers
   - Build the images with the --no-cache option
   - Start the containers
   - Check if the services are accessible

4. **Check if the Containers are Running**

   ```bash
   docker-compose ps
   ```

   You should see three containers running: frontend, backend, and mongodb.

5. **Access the Application**

   - Frontend: http://192.168.88.96:3000
   - Backend API: http://192.168.88.96:5000

## Container Management

- **Stop the containers**

  ```bash
  docker-compose down
  ```

- **View logs**

  ```bash
  # All containers
  docker-compose logs

  # Specific container
  docker-compose logs frontend
  docker-compose logs backend
  docker-compose logs mongodb
  ```

- **Rebuild and restart containers after changes**

  ```bash
  docker-compose up -d --build
  ```

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb_data`. This ensures that your data persists even if the containers are stopped or removed.

## Production vs Development

The current setup is configured for production use. If you want to switch to development mode:

1. Change `NODE_ENV=production` to `NODE_ENV=development` in `backend/.env.docker`
2. Rebuild the containers: `docker-compose up -d --build`

## Troubleshooting

1. **If the frontend can't connect to the backend**:
   - Check that the `NEXT_PUBLIC_API_URL` in `frontend/.env.docker` matches your VM's IP address
   - Ensure the backend container is running and accessible
   - Check the backend logs: `docker-compose logs backend`

2. **If the backend can't connect to MongoDB**:
   - Check the MongoDB connection string in `backend/.env.docker`
   - Ensure the MongoDB container is running
   - Check the MongoDB logs: `docker-compose logs mongodb`

3. **If external access doesn't work**:
   - Verify that your VM's firewall allows traffic on ports 3000 and 5000
   - Check that your VM's IP address is correctly configured in the environment files
   - Try accessing the services from within the VM first to isolate network issues

4. **If the frontend build fails**:
   - Check the frontend logs: `docker-compose logs frontend`
   - The ESLint errors have been configured to be ignored during the build process
   - If there are other build issues, you may need to modify the Next.js configuration

## Security Recommendations for Production

1. **Change Default Credentials**:
   - Update the MongoDB username and password in both `docker-compose.yml` and `backend/.env.docker`
   - Change the JWT_SECRET in `backend/.env.docker` to a strong, unique value

2. **Enable HTTPS**:
   - Consider setting up a reverse proxy like Nginx with SSL certificates
   - Update the environment variables to use HTTPS URLs

3. **Restrict MongoDB Access**:
   - Remove the port mapping for MongoDB in `docker-compose.yml` to prevent external access
   - Only the backend service needs to access MongoDB

4. **Regular Backups**:
   - Set up regular backups of the MongoDB data volume

## Updating the Application

To update the application:

1. Pull the latest code from the repository
2. Run the deployment script again:
   ```bash
   ./docker-deploy.sh  # Linux/Mac
   docker-deploy.bat   # Windows
   ```

This will ensure that your application is running the latest version with all the necessary dependencies.
