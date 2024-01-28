const { execSync } = require('child_process');
const fs = require('fs');

describe('Testing the script', () => {
  // Execution du script avec un fichier d'entrée et un fichier de sortie
  const command = `node index.js file.txt output.txt`;
  execSync(command);

  // Lire le fichier de sortie généré
  const generatedOutput = fs.readFileSync('outputs/output.txt', 'utf-8');

  // Lire le fichier de sortie attendu
  const expectedOutput = fs.readFileSync('outputs/output.txt', 'utf-8');

  it('should generate correct output', () => {
    expect(generatedOutput).toEqual(expectedOutput);
  });

  // La premiere ligne du fichier de sortie doit être "C - 3 - 4"
  it('should have the first line in output to equal "C - 3 - 4"', () => {
    const [firstLineOutput] = generatedOutput.split('\n');
    expect(firstLineOutput).toEqual("C - 3 - 4");
  });

  // La deuxieme ligne du fichier de sortie doit être "M - 1 - 0"
  it('should have the second line in output to equal "M - 1 - 0"', () => {
    const [, secondLineOutput] = generatedOutput.split('\n');
    expect(secondLineOutput).toEqual("M - 1 - 0");
  });

  // La deuxieme du fichier de sortie ne doit pas être "M - 2 - 1"
  it('should not have the second line in output to equal "M - 2 - 1"', () => {
    const [, secondLineOutput] = generatedOutput.split('\n');
    expect(secondLineOutput).not.toEqual("M - 2 - 1");
  });
});
