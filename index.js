const fs = require('fs');
const { ORIENTATION } = require('./constants');

if (process.argv.length !== 4) {
  console.log('Usage: node index.js <nom-du-fichier-entree> <nom-du-fichier-sortie>');
  process.exit(1);
}

// Fonction pour lire le fichier d'entrée
function readInputFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => !line.startsWith('#'));
  return lines;
}

// Fonction pour initialiser la carte
function initializeMap(lines) {
  let mapDimensions;
  const mountains = [];
  const treasures = [];

  lines.forEach(line => {
    const [type, ...params] = line.split(' - ');

    switch (type) {
      case 'C':
        // Initialiser les dimensions de la carte
        mapDimensions = params.map(Number);
        break;

      case 'M':
        // Ajouter une montagne à la liste
        const [mountainX, mountainY] = params.map(Number);
        mountains.push({ x: mountainX, y: mountainY });
        break;

      case 'T':
        // Ajouter un trésor à la liste
        const [treasureX, treasureY, treasureCount] = params.map(Number);
        treasures.push({ x: treasureX, y: treasureY, count: treasureCount });
        break;

      default:
        // Ignorer les lignes adventuriers ou non reconnues
        break;
    }
  });

  // Créer une carte représentée par un tableau 2D
  const map = Array.from({ length: mapDimensions[1] }, () =>
    Array(mapDimensions[0]).fill('.')
  );

  // Placer les montagnes sur la carte
  mountains.forEach(mountain => {
    map[mountain.y][mountain.x] = 'M';
  });

  // Placer les trésors sur la carte
  treasures.forEach(treasure => {
    map[treasure.y][treasure.x] = `T(${treasure.count})`;
  });

  return map;
}

// Fonction pour initialiser les aventuriers
function initializeAdventurers(lines) {
  const adventurers = [];

  lines.forEach(line => {
    if (line.startsWith('A')) {
      const [, name, posX, posY, orientation, movementSequence] = line.split(' - ');

      adventurers.push({
        name,
        posX: parseInt(posX),
        posY: parseInt(posY),
        orientation: ORIENTATION[orientation],
        movementSequence,
        step: 0,
        treasuresCollected: 0,
      });
    }
  });

  return adventurers;
}

// Fonction pour simuler les mouvements des aventuriers
function simulateAdventurersMoves(map, adventurers) {
  while (adventurers.some(adventurer => adventurer.step < adventurer.movementSequence.length)) {
    adventurers.forEach(adventurer => {
      switch (adventurer.movementSequence[adventurer.step]) {
        case 'A':
          adventurer.nextPosition = getNextPosition(map, adventurer);
          break;
        case 'D':
          adventurer.nextPosition = { posX: adventurer.posX, posY: adventurer.posY, orientation: (adventurer.orientation + 1) % 4 || 4 };
          break;
        case 'G':
          adventurer.nextPosition = { posX: adventurer.posX, posY: adventurer.posY, orientation: (adventurer.orientation - 1) % 4 || 4 };
          break;
        default:
          break;
      }
    });

    // Appliquer les mouvements
    adventurers.forEach(adventurer => {
      const { posX, posY, orientation } = adventurer.nextPosition;

      const nextCell = map[posY][posX];

      // Vérifier sur la prochaine case s'il y a un autre aventurier qui y va aussi
      const nextCellAdventurer = adventurers.find(
        adv =>
          adv.nextPosition.posX === posX &&
          adv.nextPosition.posY === posY &&
          adv.name !== adventurer.name
      );

      // S'il y a déjà un autre aventurier sur la case ou la prochaine case est une montagne 
      // ou si l'aventurier est déjà sur la case, ignorez le mouvement
      if (nextCell !== 'M' && (adventurer.posX !== posX || adventurer.posY !== posY)) {
        // Mettez à jour la position de l'aventurier
        adventurer.posX = posX;
        adventurer.posY = posY;

        // Collectez un trésor s'il y en a un sur la case
        if (nextCell.startsWith('T')) {
          const [, treasureCount] = nextCell.match(/\((\d+)\)/);
          adventurer.treasuresCollected += 1;

          // S'il reste un trésor sur la case, laissez-le pour le prochain passage
          if (treasureCount > 1) {
            map[posY][posX] = `T(${treasureCount - 1})`;
          } else {
            map[posY][posX] = '.'; // Retirez le trésor de la carte
          }
        }
      }

      // Si l'aventurier n'a pas pu se déplacer à cause d'un autre aventurier,
      // on ne met pas à jour son orientation et on ne passe pas à l'étape suivante
      if (!nextCellAdventurer) {
        adventurer.orientation = orientation;
        adventurer.step += 1;
      }
    });
  }
}


// Fonction pour déterminer la prochaine position d'un aventurier
function getNextPosition(map, adventurer) {
  const { posX, posY, orientation } = adventurer;

  switch (orientation) {
    case ORIENTATION.N:
      return { posX, posY: Math.max(0, posY - 1), orientation: ORIENTATION.N };

    case ORIENTATION.E:
      return { posX: Math.min(map[0].length - 1, posX + 1), posY, orientation: ORIENTATION.E };

    case ORIENTATION.S:
      return { posX, posY: Math.min(map.length - 1, posY + 1), orientation: ORIENTATION.S };

    case ORIENTATION.W:
      return { posX: Math.max(0, posX - 1), posY, orientation: ORIENTATION.W };

    default:
      return { posX, posY, orientation };
  }
}

// Fonction pour écrire le fichier de sortie
function writeOutputFile(map, adventurers, outputFile) {
  // Créer le fichier de sortie dans le dossier outputs
  fs.writeFileSync(`outputs/${outputFile}`, '', 'utf-8');

  // Ecrire les dimensions de la carte
  fs.appendFileSync(`outputs/${outputFile}`, `C - ${map[0].length} - ${map.length}\n`);

  // Ecrire les montagnes
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 'M') {
        fs.appendFileSync(`outputs/${outputFile}`, `M - ${x} - ${y}\n`);
      }
    });
  });

  // Ecrire les trésors
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.startsWith('T')) {
        const [, treasureCount] = cell.match(/\((\d+)\)/);
        fs.appendFileSync(`outputs/${outputFile}`, `T - ${x} - ${y} - ${treasureCount}\n`);
      }
    });
  });

  // Ecrire les aventuriers
  adventurers.forEach(adventurer => {
    fs.appendFileSync(
      `outputs/${outputFile}`,
      `A - ${adventurer.name} - ${adventurer.posX} - ${adventurer.posY} - ${Object.keys(ORIENTATION).find(key => ORIENTATION[key] === adventurer.orientation)} - ${adventurer.treasuresCollected}\n`
    );
  });
}

// Exécution du script
const fileName = process.argv[2];
const outputFile = process.argv[3];

const inputLines = readInputFile(fileName);
const map = initializeMap(inputLines);
const adventurers = initializeAdventurers(inputLines);

simulateAdventurersMoves(map, adventurers);
writeOutputFile(map, adventurers, outputFile);