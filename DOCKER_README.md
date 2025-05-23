# Docker Setup for Tanny Application

This document provides instructions on how to deploy the Tanny application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your VM
- Git to clone the repository (or transfer the files to the VM)

## Deployment Steps

1. **Clone or transfer the project to your VM**

   ```bash
   git clone <repository-url> /path/to/tanny
   cd /path/to/tanny
   ```

2. **Configure Environment Variables (if needed)**

   The default configuration in `.env.docker` files should work out of the box, but you may want to review and update:
   
   - Backend: `backend/.env.docker`
   - Frontend: `frontend/.env.docker`
   
   Particularly, make sure the IP address (192.168.88.96) matches your VM's IP address.

3. **Build and Start the Docker Containers**

   ```bash
   docker-compose up -d
   ```

   This will build the images and start the containers in detached mode.

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

## Troubleshooting

1. **If the frontend can't connect to the backend**:
   - Check that the `NEXT_PUBLIC_API_URL` in `frontend/.env.docker` matches your VM's IP address
   - Ensure the backend container is running and accessible

2. **If the backend can't connect to MongoDB**:
   - Check the MongoDB connection string in `backend/.env.docker`
   - Ensure the MongoDB container is running

3. **If external access doesn't work**:
   - Verify that your VM's firewall allows traffic on ports 3000 and 5000
   - Check that your VM's IP address is correctly configured in the environment files

## Security Notes

- The current setup uses basic authentication for MongoDB. For production, consider using more secure credentials.
- JWT_SECRET should be changed to a strong, unique value for production.
- Consider adding HTTPS for production deployments.
