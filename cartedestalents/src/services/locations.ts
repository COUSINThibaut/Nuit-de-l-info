export interface Country {
  name: string;
  cities: string[];
}

export const locations: Country[] = [
  {
    name: "France",
    cities: [
      "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", 
      "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne", 
      "Toulon", "Le Havre", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne"
    ]
  },
  {
    name: "Belgique",
    cities: [
      "Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", 
      "Louvain", "Mons", "Alost"
    ]
  },
  {
    name: "Suisse",
    cities: [
      "Zurich", "Genève", "Bâle", "Lausanne", "Berne", "Winterthour", "Lucerne", 
      "Saint-Gall", "Lugano", "Bienne"
    ]
  },
  {
    name: "Canada",
    cities: [
      "Montréal", "Québec", "Ottawa", "Toronto", "Vancouver", "Calgary", 
      "Edmonton", "Winnipeg", "Hamilton", "Halifax"
    ]
  },
  {
    name: "Luxembourg",
    cities: [
      "Luxembourg", "Esch-sur-Alzette", "Differdange", "Dudelange"
    ]
  },
  {
    name: "Maroc",
    cities: [
      "Casablanca", "Rabat", "Fès", "Tanger", "Marrakech", "Agadir", "Meknès", 
      "Oujda", "Kenitra", "Tétouan"
    ]
  },
  {
    name: "Tunisie",
    cities: [
      "Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Gabès", "Bizerte", 
      "Ariana", "Gafsa", "Monastir"
    ]
  },
  {
    name: "Sénégal",
    cities: [
      "Dakar", "Touba", "Thiès", "Rufisque", "Kaolack", "M'bour", "Ziguinchor", 
      "Saint-Louis", "Diourbel", "Louga"
    ]
  }
];
