const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
const projects = [
  {
    id: 1,
    title: 'CI/CD Portfolio',
    description: 'A fully automated portfolio deployed on Kubernetes using Jenkins and Docker.',
    technologies: ['React', 'Jenkins', 'Docker', 'Kubernetes']
  },
  {
    id: 2,
    title: 'Sample Microservice',
    description: 'Containerized Node.js API with Kubernetes deployment and monitoring.',
    technologies: ['Node.js', 'Express', 'Docker', 'Kubernetes', 'Prometheus']
  },
  {
    id: 3,
    title: 'Monitoring Dashboard',
    description: 'Basic monitoring setup using Prometheus & Grafana for container workloads.',
    technologies: ['Prometheus', 'Grafana', 'Docker', 'Kubernetes']
  }
];

const skills = [
  {
    category: 'DevOps & Cloud',
    items: ['Jenkins', 'Docker', 'Kubernetes', 'Helm', 'GitHub Actions']
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Express', 'REST APIs']
  },
  {
    category: 'Frontend',
    items: ['React', 'HTML', 'CSS', 'JavaScript']
  },
  {
    category: 'Tools',
    items: ['Linux', 'Git', 'Bash', 'Docker Hub', 'Minikube']
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' });
});

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/skills', (req, res) => {
  res.json(skills);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});