import { StudentProfile } from '@/types';

/**
 * Données simulées - 15+ profils étudiants détaillés
 * @deprecated Ces données sont maintenant stockées en base de données.
 * Ce fichier ne sert plus que de référence pour les types ou les constantes utilitaires.
 */
export const mockStudents: StudentProfile[] = [];

/**
 * Liste des filières disponibles
 */
export const availableFields = [
  'Informatique',
  'Intelligence Artificielle',
  'Data Science',
  'Cybersécurité',
  'Design Numérique',
  'Développement Mobile',
  'DevOps',
  'Game Design',
  'Blockchain',
  'Cloud Computing',
  'Management de Projet',
  'E-commerce',
  'IoT',
  'Growth Marketing',
  'Architecture Logicielle',
  'Communication Digitale',
];

/**
 * Liste de toutes les compétences disponibles (extrait du mock)
 */
export const allSkills = [
  'React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Figma', 'Tailwind CSS', 'GraphQL',
  'Python', 'TensorFlow', 'PyTorch', 'Django', 'Docker', 'Kubernetes', 'AWS', 'Machine Learning',
  'Adobe XD', 'Sketch', 'Prototypage', 'Design System', 'Illustration',
  'Rust', 'Pentesting', 'OSINT', 'Cryptographie', 'Linux', 'Bash', 'PostgreSQL',
  'React Native', 'Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase', 'REST API', 'Git',
  'R', 'SQL', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics',
  'Community Management', 'Content Marketing', 'SEO', 'Adobe Premiere', 'Photoshop', 'Copywriting', 'Social Media',
  'Jenkins', 'GitLab CI', 'Terraform', 'Ansible', 'Monitoring',
  'Unity', 'C#', 'Blender', '3D Modeling', 'Game Design', 'Unreal Engine', 'Substance Painter',
  'Solidity', 'Web3.js', 'Ethereum', 'Smart Contracts', 'DeFi',
  'Azure', 'GCP', 'Serverless', 'Lambda', 'CloudFormation', 'Microservices',
  'Scrum', 'Agile', 'Jira', 'Product Management', 'User Stories', 'Roadmapping', 'Stakeholder Management',
  'Shopify', 'WooCommerce', 'PHP', 'MySQL', 'Stripe', 'Google Analytics',
  'Arduino', 'Raspberry Pi', 'C++', 'MQTT', 'LoRaWAN', 'Embedded Systems', 'Sensors',
  'SEM', 'A/B Testing', 'Marketing Automation', 'CRO',
  'Java', 'Spring Boot', 'Kafka', 'Redis', 'RabbitMQ', 'Event-Driven'
].sort();

/**
 * Liste de toutes les langues disponibles
 */
export const allLanguages = [
  'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Japonais', 'Chinois', 'Coréen', 'Portugais', 'Néerlandais', 'Catalan', 'Arabe'
].sort();