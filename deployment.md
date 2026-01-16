# Deployment Documentation

As of writing this, Envision Ad is deployed on an Amazon Linux 2023 EC2 instance using Docker Compose. The deployment process is automated via GitHub Actions, which builds and deploys the Docker containers whenever changes are pushed to the `main` branch.

### Setup
- EC2 Instance: Amazon Linux 2023 -> Running docker-compose.prod.yml (frontend and backend services)
- RDS Instance: Amazon RDS for PostgreSQL -> Running the database for the backend service
- Nginx: Reverse proxy installed on the EC2 instance to route traffic from the outer world to the appropriate Docker containers.

---

## Environment Variables

We use Doppler to store and manage environment variables securely. This centralized system ensures that sensitive credentials are never stored in plain text within our source code or on the server.

### Doppler Projects

Our secrets are organized into two primary projects:
* envision-ad-frontend: Stores secrets for the frontend service.
* envision-ad-backend: Stores secrets for the backend service.

### Authentication and Security

Access to these projects from our deployed instances is managed via Service Tokens. These tokens are stored as GitHub Secrets within the repository:
* DOPPLER_FRONTEND_TOKEN
* DOPPLER_BACKEND_TOKEN

### To run the project locally with Doppler

1. Install the Doppler CLI by following the instructions at https://docs.doppler.com/docs/install-cli.
2. Authenticate with Doppler using your account credentials:
   ```bash
   doppler login
   ```
3. Run the project using this command:
   ```bash
   doppler run -- docker compose up --build
   ```
4. If you want to run the project using a local .env file, uncomment the following lines in the `docker-compose.yml` file:
   ```yaml
   env_file:
     - .env
   ```
   and
   ```yaml
   env_file:
     - ./frontend/.env
   ```
---

### Infrastructure Setup (Amazon Linux 2023)

The Doppler CLI is required on the EC2 instance to fetch secrets during the deployment process. The following commands were used for the initial configuration:

1. Add the Doppler GPG key:
   ```bash
      sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
   ```

2. Add the Doppler repository:
   ```bash
   curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
   ```
   
3. Install the CLI using dnf:
   ```bash
   sudo dnf install doppler -y
   ```

---

### Deployment Workflow

The GitHub deployment action uses a nested command structure to inject environment variables from both Doppler projects into the Docker containers at runtime.

Deployment Command:
```bash
doppler run --project envision-ad-frontend --config prd --token ${{ secrets.DOPPLER_FRONTEND_TOKEN }} -- \
doppler run --project envision-ad-backend --config prd --token ${{ secrets.DOPPLER_BACKEND_TOKEN }} -- \
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

There are other ways to achieve this. Here is the documentation:
- https://docs.doppler.com/docs/docker-compose

