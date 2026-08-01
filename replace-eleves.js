const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Remplacements stricts pour le texte visible (avec accents)
  content = content.replace(/Élève/g, 'Étudiant');
  content = content.replace(/élève/g, 'étudiant');
  content = content.replace(/Élèves/g, 'Étudiants');
  content = content.replace(/élèves/g, 'étudiants');
  
  // On remplace aussi "Espace Eleve" spécifiquement s'il existe
  content = content.replace(/Espace Eleve/g, 'Espace Etudiant');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'frontend'), replaceInFile);
console.log("Done.");
