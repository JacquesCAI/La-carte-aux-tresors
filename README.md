# La carte aux trésors

## Installation
Le projet est développé en Javascript et nécessite donc d'avoir [NodeJS](https://nodejs.org/en/) installé sur votre machine.

Pour installer les dépendances, il suffit de lancer la commande suivante à la racine du projet :
```bash
npm install
```

## Utilisation
Pour lancer le programme, il suffit de lancer la commande suivante à la racine du projet :
```bash
node index.js <input_file> <output_file>
``` 
- `input_file` : chemin vers le fichier d'entrée
- `output_file` : chemin vers le fichier de sortie qui sera généré dans le dossier `outputs`

## Tests
Les tests unitaires sont écrits avec [Jest](https://jestjs.io/) et sont réalisés en boîte noire.

Pour lancer les tests, il suffit de lancer la commande suivante à la racine du projet :
```bash
npm run test
```