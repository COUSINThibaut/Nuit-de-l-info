export const scenarios = [
    {
      id: 1,
      title: "Windows 10, c'est fini !",
      description: "Le support s'arrête. Tes 200 PC fonctionnent encore bien, mais ils ne sont pas compatibles Windows 11.",
      choices: {
        left: {
          text: "Tout jeter et racheter",
          impact: { budget: -50, eco: -50, indep: -10 },
          feedback: "Désastre écologique ! Mais Microsoft est content."
        },
        right: {
          text: "Passer sous Linux (Mint)",
          impact: { budget: +10, eco: +20, indep: +30 },
          feedback: "Bien joué ! Matériel sauvé et obsolescence vaincue."
        }
      }
    },
    {
      id: 2,
      title: "Stockage des notes",
      description: "Un commercial te propose 'EduCloud', hébergé en Californie, gratuit la première année.",
      choices: {
        left: {
          text: "Signer le contrat",
          impact: { budget: -10, eco: 0, indep: -40 },
          feedback: "Tes données partent hors UE. Attention au RGPD !"
        },
        right: {
          text: "Utiliser la Forge (Apps Education)",
          impact: { budget: +10, eco: +5, indep: +20 },
          feedback: "Souverain et sécurisé. L'État propose déjà ces outils !"
        }
      }
    },
    {
      id: 3,
      title: "Atelier Réparation",
      description: "Des élèves veulent apprendre à réparer les vieux ordis du CDI.",
      choices: {
        left: {
          text: "Refuser (Trop dangereux)",
          impact: { budget: 0, eco: -10, indep: -10 },
          feedback: "Dommage, c'est ça l'esprit du 'Village Résistant'."
        },
        right: {
          text: "Créer un club 'Repair Café'",
          impact: { budget: +5, eco: +15, indep: +15 },
          feedback: "L'autonomie technologique commence ici !"
        }
      }
    },
  ];