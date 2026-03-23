# DevOps Portfolio Project

A full-stack CI/CD portfolio project demonstrating DevOps practices with Jenkins, Docker, and Kubernetes.

## Architecture

- **Frontend**: React application served by Nginx
- **Backend**: Node.js Express API
- **CI/CD**: Jenkins pipeline for automated builds and deployments
- **Containerization**: Docker for both frontend and backend
- **Orchestration**: Kubernetes for deployment and scaling

## Project Structure

```
.
├── frontend/          # React frontend
├── backend/           # Node.js API
├── k8s/              # Kubernetes manifests
├── Dockerfile         # Frontend container
├── Jenkinsfile        # CI/CD pipeline
├── nginx.conf         # Nginx configuration
└── .gitignore
```

## Features

- Automated CI/CD pipeline
- Containerized applications
- Kubernetes deployment
- Build information tracking
- RESTful API backend
- Responsive React frontend

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/projects` - List projects
- `GET /api/skills` - List skills
- `GET /api/projects/:id` - Get specific project

## Deployment

1. Update `yourdockerhubusername` in Jenkinsfile and k8s/deployment.yaml
2. Push to GitHub to trigger Jenkins pipeline
3. Jenkins builds Docker images and deploys to Kubernetes

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

## Technologies Used

- React
- Node.js
- Express
- Docker
- Kubernetes
- Jenkins
- Nginx