const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./database.cjs');

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 3023;
const SECRET_KEY = 'your-secret-key-change-this-in-prod';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database
initDb();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, email, hashedPassword, name, createdAt],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id, email, name }, SECRET_KEY, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    try {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
      } else {
        res.status(403).json({ error: 'Invalid password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.put('/api/auth/me', authenticateToken, (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if email is already taken by another user
  db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Email already in use' });

    db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Return updated user info
        // Note: In a real app, we might want to issue a new token here if the token contains mutable data
        const updatedUser = { id: userId, name, email };
        const newToken = jwt.sign(updatedUser, SECRET_KEY, { expiresIn: '24h' });
        
        res.json({ user: updatedUser, token: newToken });
      }
    );
  });
});

// Connection Requests Routes
app.post('/api/connections', authenticateToken, (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.id;

  if (fromUserId === toUserId) {
    return res.status(400).json({ error: 'Cannot connect with yourself' });
  }

  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  db.get('SELECT * FROM connection_requests WHERE fromUserId = ? AND toUserId = ?', [fromUserId, toUserId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Request already sent' });

    db.run(
      'INSERT INTO connection_requests (id, fromUserId, toUserId, createdAt) VALUES (?, ?, ?, ?)',
      [id, fromUserId, toUserId, createdAt],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Request sent' });
      }
    );
  });
});

app.get('/api/connections/incoming', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT cr.*, u.name as fromUserName, u.email as fromUserEmail, s.avatar as fromUserAvatar, s.id as studentId 
     FROM connection_requests cr 
     JOIN users u ON cr.fromUserId = u.id 
     LEFT JOIN students s ON u.email = s.email
     WHERE cr.toUserId = ? AND cr.status = 'pending'`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/connections/outgoing', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT cr.*, s.name as toUserName, s.avatar as toUserAvatar, s.id as studentId
     FROM connection_requests cr
     JOIN students s ON cr.toUserId = s.id
     WHERE cr.fromUserId = ? AND cr.status = 'pending'`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put('/api/connections/:id', authenticateToken, (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const requestId = req.params.id;
  const userId = req.user.id;

  db.run(
    'UPDATE connection_requests SET status = ? WHERE id = ? AND toUserId = ?',
    [status, requestId, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Request ${status}` });
    }
  );
});

app.get('/api/connections/status/:targetUserId', authenticateToken, (req, res) => {
  const fromUserId = req.user.id;
  const toUserId = req.params.targetUserId;

  db.get(
    `SELECT status FROM connection_requests 
     WHERE (fromUserId = ? AND toUserId = ?) OR (fromUserId = ? AND toUserId = ?)`,
    [fromUserId, toUserId, toUserId, fromUserId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: row ? row.status : 'none' });
    }
  );
});

// Mock data for seeding
const mockStudents = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Passionnée par le développement web et l\'UX design. J\'aime créer des expériences utilisateur intuitives et esthétiques.',
    field: 'Informatique',
    year: 3,
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Figma', 'Tailwind CSS', 'GraphQL'],
    passions: ['UX Research', 'Accessibilité', 'Design System'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' },
      { lang: 'Espagnol', level: 'B1' }
    ],
    projects: [
      {
        title: 'Application de gestion de tâches collaborative',
        description: 'Développement d\'une application web full-stack permettant aux équipes de gérer leurs projets de manière agile.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
        status: 'Terminé'
      },
      {
        title: 'Portfolio interactif',
        description: 'Création d\'un portfolio avec animations 3D et transitions fluides.',
        technologies: ['React', 'Three.js', 'Framer Motion'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Paris, France',
    linkedIn: 'linkedin.com/in/sophiemartin',
    github: 'github.com/sophiemartin',
    portfolio: 'sophiemartin.dev',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Développeur full-stack avec un fort intérêt pour l\'intelligence artificielle et le machine learning.',
    field: 'Intelligence Artificielle',
    year: 4,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Django', 'Docker', 'Kubernetes', 'AWS', 'Machine Learning'],
    passions: ['Échecs', 'Robotique', 'Astronomie'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C2' },
      { lang: 'Allemand', level: 'B2' }
    ],
    projects: [
      {
        title: 'Système de recommandation personnalisé',
        description: 'Développement d\'un algorithme de recommandation basé sur le deep learning pour une plateforme e-commerce.',
        technologies: ['Python', 'TensorFlow', 'Redis', 'FastAPI'],
        status: 'Terminé'
      },
      {
        title: 'Chatbot intelligent',
        description: 'Création d\'un assistant conversationnel utilisant GPT pour répondre aux questions des étudiants.',
        technologies: ['Python', 'OpenAI API', 'LangChain', 'Streamlit'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Lyon, France',
    linkedIn: 'linkedin.com/in/thomasdubois',
    github: 'github.com/thomasdubois',
    createdAt: new Date('2023-09-10'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: '3',
    name: 'Emma Lefebvre',
    email: 'emma.lefebvre@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Designer UI/UX créative, je transforme des idées complexes en interfaces simples et élégantes.',
    field: 'Design Numérique',
    year: 2,
    skills: ['Figma', 'Adobe XD', 'Sketch', 'UI/UX Design', 'Prototypage', 'Design System', 'Illustration'],
    passions: ['Photographie', 'Art moderne', 'Voyage'],
    availability: 'unavailable',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'B2' },
      { lang: 'Italien', level: 'A2' }
    ],
    projects: [
      {
        title: 'Refonte d\'une application bancaire',
        description: 'Redesign complet de l\'interface mobile d\'une application bancaire pour améliorer l\'accessibilité.',
        technologies: ['Figma', 'Principle', 'Adobe Illustrator'],
        status: 'Terminé'
      },
      {
        title: 'Design system pour startup',
        description: 'Création d\'un système de design cohérent et scalable.',
        technologies: ['Figma', 'Storybook'],
        status: 'En cours'
      }
    ],
    isVerified: false,
    location: 'Bordeaux, France',
    linkedIn: 'linkedin.com/in/emmalefebvre',
    portfolio: 'emmalefebvre.design',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '4',
    name: 'Lucas Bernard',
    email: 'lucas.bernard@example.com',
    avatar: 'https://i.pravatar.cc/150?img=13',
    bio: 'Passionné de cybersécurité et de développement backend. J\'aime résoudre des problèmes complexes.',
    field: 'Cybersécurité',
    year: 5,
    skills: ['Python', 'Rust', 'Pentesting', 'OSINT', 'Cryptographie', 'Linux', 'Bash', 'PostgreSQL'],
    passions: ['CTF', 'Lockpicking', 'Jeux vidéo'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' }
    ],
    projects: [
      {
        title: 'Outil d\'audit de sécurité',
        description: 'Développement d\'un scanner de vulnérabilités pour applications web.',
        technologies: ['Python', 'Nmap', 'Metasploit'],
        status: 'Terminé'
      },
      {
        title: 'Plateforme CTF',
        description: 'Création d\'une plateforme de challenges de sécurité informatique.',
        technologies: ['Rust', 'Docker', 'PostgreSQL'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Lille, France',
    linkedIn: 'linkedin.com/in/lucasbernard',
    github: 'github.com/lucasbernard',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2024-11-30')
  },
  {
    id: '5',
    name: 'Léa Rousseau',
    email: 'lea.rousseau@example.com',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'Développeuse mobile passionnée par les technologies cross-platform et l\'innovation.',
    field: 'Développement Mobile',
    year: 3,
    skills: ['React Native', 'Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase', 'REST API', 'Git'],
    passions: ['Voyage', 'Yoga', 'Cuisine'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'B2' },
      { lang: 'Japonais', level: 'A1' }
    ],
    projects: [
      {
        title: 'Application de méditation',
        description: 'App mobile de méditation guidée avec suivi de progression et rappels personnalisés.',
        technologies: ['Flutter', 'Firebase', 'Dart'],
        status: 'Terminé'
      },
      {
        title: 'App de covoiturage étudiant',
        description: 'Solution de mobilité partagée pour les étudiants avec géolocalisation en temps réel.',
        technologies: ['React Native', 'Node.js', 'MongoDB', 'Google Maps API'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Toulouse, France',
    linkedIn: 'linkedin.com/in/learousseau',
    github: 'github.com/learousseau',
    createdAt: new Date('2023-11-12'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '6',
    name: 'Hugo Moreau',
    email: 'hugo.moreau@example.com',
    avatar: 'https://i.pravatar.cc/150?img=14',
    bio: 'Data scientist en herbe, je m\'intéresse à l\'analyse de données massives et à la visualisation.',
    field: 'Data Science',
    year: 4,
    skills: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics'],
    passions: ['Basket', 'Cinéma', 'Data Viz'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' },
      { lang: 'Chinois', level: 'A2' }
    ],
    projects: [
      {
        title: 'Dashboard analytique pour e-commerce',
        description: 'Création d\'un tableau de bord interactif pour analyser les comportements d\'achat.',
        technologies: ['Python', 'Plotly', 'Dash', 'PostgreSQL'],
        status: 'Terminé'
      },
      {
        title: 'Prédiction de churn clients',
        description: 'Modèle de machine learning pour prédire le désengagement des clients.',
        technologies: ['Python', 'Scikit-learn', 'XGBoost', 'Jupyter'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Nantes, France',
    linkedIn: 'linkedin.com/in/hugomoreau',
    github: 'github.com/hugomoreau',
    createdAt: new Date('2023-08-18'),
    updatedAt: new Date('2024-11-29')
  },
  {
    id: '7',
    name: 'Chloé Petit',
    email: 'chloe.petit@example.com',
    avatar: 'https://i.pravatar.cc/150?img=10',
    bio: 'Créatrice de contenu digital et community manager. J\'adore raconter des histoires à travers les réseaux sociaux.',
    field: 'Communication Digitale',
    year: 2,
    skills: ['Community Management', 'Content Marketing', 'SEO', 'Adobe Premiere', 'Photoshop', 'Copywriting', 'Social Media'],
    passions: ['Mode', 'Vlogging', 'Réseaux Sociaux'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'B2' },
      { lang: 'Espagnol', level: 'B1' }
    ],
    projects: [
      {
        title: 'Stratégie social media pour ONG',
        description: 'Développement et mise en œuvre d\'une stratégie de contenu pour une association caritative.',
        technologies: ['Canva', 'Hootsuite', 'Google Analytics'],
        status: 'Terminé'
      },
      {
        title: 'Podcast étudiant',
        description: 'Production d\'un podcast hebdomadaire sur l\'entrepreneuriat étudiant.',
        technologies: ['Adobe Audition', 'Anchor'],
        status: 'En cours'
      }
    ],
    isVerified: false,
    location: 'Strasbourg, France',
    linkedIn: 'linkedin.com/in/chloepetit',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '8',
    name: 'Nathan Girard',
    email: 'nathan.girard@example.com',
    avatar: 'https://i.pravatar.cc/150?img=15',
    bio: 'Développeur DevOps et passionné d\'automatisation. J\'optimise les pipelines CI/CD.',
    field: 'DevOps',
    year: 5,
    skills: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform', 'Ansible', 'AWS', 'Linux', 'Monitoring'],
    passions: ['Domotique', 'Impression 3D', 'Hardware'],
    availability: 'unavailable',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C2' }
    ],
    projects: [
      {
        title: 'Infrastructure as Code',
        description: 'Mise en place d\'une infrastructure cloud complète avec Terraform et Ansible.',
        technologies: ['Terraform', 'AWS', 'Ansible', 'Docker'],
        status: 'Terminé'
      },
      {
        title: 'Plateforme de monitoring',
        description: 'Déploiement d\'une stack de surveillance avec alerting automatisé.',
        technologies: ['Prometheus', 'Grafana', 'Kubernetes', 'ELK'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Rennes, France',
    linkedIn: 'linkedin.com/in/nathangirard',
    github: 'github.com/nathangirard',
    createdAt: new Date('2023-05-22'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '9',
    name: 'Manon Dupont',
    email: 'manon.dupont@example.com',
    avatar: 'https://i.pravatar.cc/150?img=20',
    bio: 'Game designer et développeuse Unity. Je crée des expériences ludiques immersives.',
    field: 'Game Design',
    year: 3,
    skills: ['Unity', 'C#', 'Blender', '3D Modeling', 'Game Design', 'Unreal Engine', 'Substance Painter'],
    passions: ['Jeux Indés', 'Dessin', 'Animation'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'B2' },
      { lang: 'Coréen', level: 'A1' }
    ],
    projects: [
      {
        title: 'Jeu de plateforme 2D',
        description: 'Création d\'un jeu de plateforme avec mécaniques de puzzle innovantes.',
        technologies: ['Unity', 'C#', 'Aseprite'],
        status: 'Terminé'
      },
      {
        title: 'VR Experience éducative',
        description: 'Expérience de réalité virtuelle pour l\'apprentissage de l\'histoire.',
        technologies: ['Unity', 'Oculus SDK', 'C#', 'Blender'],
        status: 'En cours'
      }
    ],
    isVerified: false,
    location: 'Montpellier, France',
    linkedIn: 'linkedin.com/in/manondupont',
    portfolio: 'manondupont.games',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-11-30')
  },
  {
    id: '10',
    name: 'Alexandre Laurent',
    email: 'alexandre.laurent@example.com',
    avatar: 'https://i.pravatar.cc/150?img=17',
    bio: 'Ingénieur blockchain et développeur smart contracts. Passionné par la décentralisation.',
    field: 'Blockchain',
    year: 4,
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'Rust', 'Node.js', 'React', 'DeFi'],
    passions: ['Crypto', 'Économie', 'Politique'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' }
    ],
    projects: [
      {
        title: 'Marketplace NFT décentralisée',
        description: 'Développement d\'une plateforme d\'échange de NFTs avec smart contracts audités.',
        technologies: ['Solidity', 'React', 'Web3.js', 'IPFS'],
        status: 'Terminé'
      },
      {
        title: 'DAO pour projet open-source',
        description: 'Création d\'une organisation autonome décentralisée pour gouvernance collaborative.',
        technologies: ['Solidity', 'Hardhat', 'OpenZeppelin'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Paris, France',
    linkedIn: 'linkedin.com/in/alexandrelaurent',
    github: 'github.com/alexandrelaurent',
    createdAt: new Date('2023-10-14'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '11',
    name: 'Sarah Bonnet',
    email: 'sarah.bonnet@example.com',
    avatar: 'https://i.pravatar.cc/150?img=16',
    bio: 'Architecte cloud et spécialiste des solutions serverless. J\'aide les entreprises à migrer vers le cloud.',
    field: 'Cloud Computing',
    year: 5,
    skills: ['AWS', 'Azure', 'GCP', 'Serverless', 'Lambda', 'CloudFormation', 'Microservices', 'Python'],
    passions: ['Randonnée', 'Tech', 'Écologie'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C2' },
      { lang: 'Portugais', level: 'B1' }
    ],
    projects: [
      {
        title: 'Migration cloud d\'une application legacy',
        description: 'Migration complète d\'une application monolithique vers une architecture microservices sur AWS.',
        technologies: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        status: 'Terminé'
      },
      {
        title: 'API Gateway serverless',
        description: 'Mise en place d\'une API gateway serverless avec gestion d\'authentification.',
        technologies: ['AWS Lambda', 'API Gateway', 'DynamoDB', 'Cognito'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Nice, France',
    linkedIn: 'linkedin.com/in/sarahbonnet',
    github: 'github.com/sarahbonnet',
    createdAt: new Date('2023-07-19'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '12',
    name: 'Maxime Simon',
    email: 'maxime.simon@example.com',
    avatar: 'https://i.pravatar.cc/150?img=18',
    bio: 'Product Owner et Scrum Master. J\'accompagne les équipes dans leur transformation agile.',
    field: 'Management de Projet',
    year: 4,
    skills: ['Scrum', 'Agile', 'Jira', 'Product Management', 'User Stories', 'Roadmapping', 'Stakeholder Management'],
    passions: ['Management', 'Psychologie', 'Coaching'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' },
      { lang: 'Néerlandais', level: 'B1' }
    ],
    projects: [
      {
        title: 'Refonte processus agile',
        description: 'Mise en place d\'un framework Scrum adapté pour une équipe de 30 personnes.',
        technologies: ['Jira', 'Confluence', 'Miro'],
        status: 'Terminé'
      },
      {
        title: 'Roadmap produit SaaS',
        description: 'Définition de la vision produit et priorisation du backlog pour une startup B2B.',
        technologies: ['ProductBoard', 'Figma', 'Google Analytics'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Lyon, France',
    linkedIn: 'linkedin.com/in/maximesimon',
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2024-11-28')
  },
  {
    id: '13',
    name: 'Julie Mercier',
    email: 'julie.mercier@example.com',
    avatar: 'https://i.pravatar.cc/150?img=23',
    bio: 'Développeuse full-stack spécialisée en e-commerce. J\'optimise les tunnels de conversion.',
    field: 'E-commerce',
    year: 3,
    skills: ['Shopify', 'WooCommerce', 'React', 'PHP', 'MySQL', 'Stripe', 'SEO', 'Google Analytics'],
    passions: ['Mode', 'Shopping', 'Marketing'],
    availability: 'unavailable',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'B2' }
    ],
    projects: [
      {
        title: 'Boutique en ligne sur-mesure',
        description: 'Développement d\'une solution e-commerce complète avec gestion des stocks et paiements.',
        technologies: ['React', 'Node.js', 'Stripe', 'MongoDB'],
        status: 'Terminé'
      },
      {
        title: 'Plugin Shopify personnalisé',
        description: 'Création d\'un plugin pour automatiser les recommandations produits.',
        technologies: ['Shopify API', 'React', 'GraphQL'],
        status: 'En cours'
      }
    ],
    isVerified: false,
    location: 'Marseille, France',
    linkedIn: 'linkedin.com/in/juliemercier',
    github: 'github.com/juliemercier',
    createdAt: new Date('2024-04-11'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '14',
    name: 'Antoine Garcia',
    email: 'antoine.garcia@example.com',
    avatar: 'https://i.pravatar.cc/150?img=19',
    bio: 'Ingénieur IoT et embedded systems. Je connecte le monde physique au digital.',
    field: 'IoT',
    year: 5,
    skills: ['Arduino', 'Raspberry Pi', 'C++', 'Python', 'MQTT', 'LoRaWAN', 'Embedded Systems', 'Sensors'],
    passions: ['Bricolage', 'Électronique', 'Domotique'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' },
      { lang: 'Catalan', level: 'B2' }
    ],
    projects: [
      {
        title: 'Station météo connectée',
        description: 'Conception d\'une station météo autonome avec transmission des données via LoRaWAN.',
        technologies: ['Arduino', 'LoRaWAN', 'Node-RED', 'InfluxDB'],
        status: 'Terminé'
      },
      {
        title: 'Système domotique open-source',
        description: 'Développement d\'une solution domotique complète et personnalisable.',
        technologies: ['Raspberry Pi', 'MQTT', 'Home Assistant', 'ESP32'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Perpignan, France',
    linkedIn: 'linkedin.com/in/antoinegarcia',
    github: 'github.com/antoinegarcia',
    createdAt: new Date('2023-06-30'),
    updatedAt: new Date('2024-11-29')
  },
  {
    id: '15',
    name: 'Camille Durand',
    email: 'camille.durand@example.com',
    avatar: 'https://i.pravatar.cc/150?img=24',
    bio: 'Growth hacker et analyste marketing. J\'utilise les données pour booster la croissance des startups.',
    field: 'Growth Marketing',
    year: 2,
    skills: ['Google Analytics', 'SEO', 'SEM', 'A/B Testing', 'SQL', 'Python', 'Marketing Automation', 'CRO'],
    passions: ['Lecture', 'Voyage', 'Psychologie'],
    availability: 'open',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C1' },
      { lang: 'Arabe', level: 'B1' }
    ],
    projects: [
      {
        title: 'Campagne growth hacking',
        description: 'Stratégie d\'acquisition complète ayant généré +300% de croissance en 3 mois.',
        technologies: ['Google Analytics', 'Segment', 'Mixpanel', 'HubSpot'],
        status: 'Terminé'
      },
      {
        title: 'Dashboard analytics personnalisé',
        description: 'Création d\'un tableau de bord pour suivre les KPIs marketing en temps réel.',
        technologies: ['Python', 'Tableau', 'SQL', 'Google Data Studio'],
        status: 'En cours'
      }
    ],
    isVerified: false,
    location: 'Paris, France',
    linkedIn: 'linkedin.com/in/camilledurand',
    createdAt: new Date('2024-05-17'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '16',
    name: 'Pierre Fontaine',
    email: 'pierre.fontaine@example.com',
    avatar: 'https://i.pravatar.cc/150?img=33',
    bio: 'Développeur backend passionné par les architectures scalables et les systèmes distribués.',
    field: 'Architecture Logicielle',
    year: 4,
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Redis', 'PostgreSQL', 'RabbitMQ', 'Event-Driven'],
    passions: ['Musique', 'Guitare', 'Concerts'],
    availability: 'available',
    languages: [
      { lang: 'Français', level: 'Natif' },
      { lang: 'Anglais', level: 'C2' }
    ],
    projects: [
      {
        title: 'Architecture événementielle',
        description: 'Conception d\'une architecture event-driven pour un système de facturation.',
        technologies: ['Java', 'Kafka', 'Spring Boot', 'PostgreSQL'],
        status: 'Terminé'
      },
      {
        title: 'API haute performance',
        description: 'Développement d\'une API capable de gérer 10k requêtes/seconde.',
        technologies: ['Java', 'Redis', 'Nginx', 'Docker'],
        status: 'En cours'
      }
    ],
    isVerified: true,
    location: 'Grenoble, France',
    linkedIn: 'linkedin.com/in/pierrefontaine',
    github: 'github.com/pierrefontaine',
    createdAt: new Date('2023-08-08'),
    updatedAt: new Date('2024-12-01')
  }
];

// Seed database if empty
const seedDatabase = () => {
  db.get('SELECT COUNT(*) as count FROM students', [], (err, row) => {
    if (err) {
      console.error('Error checking database count:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding database with mock data...');
      const stmt = db.prepare(`INSERT INTO students (
        id, name, email, avatar, bio, field, year, skills, passions, availability, languages, projects, 
        isVerified, location, linkedIn, github, portfolio, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      mockStudents.forEach(student => {
        stmt.run([
          student.id,
          student.name,
          student.email,
          student.avatar,
          student.bio,
          student.field,
          student.year,
          JSON.stringify(student.skills),
          JSON.stringify(student.passions || []),
          student.availability || 'available',
          JSON.stringify(student.languages),
          JSON.stringify(student.projects),
          student.isVerified ? 1 : 0,
          student.location,
          student.linkedIn,
          student.github,
          student.portfolio,
          new Date(student.createdAt).toISOString(),
          new Date(student.updatedAt).toISOString()
        ]);
      });

      stmt.finalize();
      console.log('Database seeded successfully!');
    }
  });
};

// Initialize Database and Seed
initDb();
setTimeout(seedDatabase, 1000); // Wait for table creation

// Routes

// GET all students
app.get('/api/students', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Parse JSON fields
    const students = rows.map(student => ({
      ...student,
      skills: JSON.parse(student.skills || '[]'),
      passions: JSON.parse(student.passions || '[]'),
      languages: JSON.parse(student.languages || '[]'),
      projects: JSON.parse(student.projects || '[]'),
      isVerified: !!student.isVerified,
      createdAt: new Date(student.createdAt),
      updatedAt: new Date(student.updatedAt)
    }));
    res.json({ data: students });
  });
});

// GET student by id
app.get('/api/students/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    const student = {
      ...row,
      skills: JSON.parse(row.skills || '[]'),
      passions: JSON.parse(row.passions || '[]'),
      languages: JSON.parse(row.languages || '[]'),
      projects: JSON.parse(row.projects || '[]'),
      isVerified: !!row.isVerified,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
    res.json({ data: student });
  });
});

// POST new student
app.post('/api/students', authenticateToken, (req, res) => {
  const student = req.body;
  const sql = `INSERT INTO students (
    id, name, email, avatar, bio, field, year, skills, passions, availability, languages, projects, 
    isVerified, location, linkedIn, github, portfolio, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    student.id,
    student.name,
    student.email,
    student.avatar,
    student.bio,
    student.field,
    student.year,
    JSON.stringify(student.skills),
    JSON.stringify(student.passions || []),
    student.availability || 'available',
    JSON.stringify(student.languages),
    JSON.stringify(student.projects),
    student.isVerified ? 1 : 0,
    student.location,
    student.linkedIn,
    student.github,
    student.portfolio,
    new Date().toISOString(),
    new Date().toISOString()
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: student,
      id: this.lastID
    });
  });
});

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Listening on 0.0.0.0:${PORT}`);
});
