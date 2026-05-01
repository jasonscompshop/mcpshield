const popularPackages = [
  'express', 'lodash', 'react', 'axios', 'vue', 'angular', 'webpack',
  'typescript', 'babel', 'commander', 'chalk', 'dotenv', 'mongoose',
  'body-parser', 'cors', 'morgan', 'nodemon', 'request', 'async', 'moment'
];

function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      matrix[j][i] = Math.min(matrix[j][i-1] + 1, matrix[j-1][i] + 1, matrix[j-1][i-1] + cost);
    }
  }
  return matrix[b.length][a.length];
}

export async function scanTyposquatting(packageName) {
  const warnings = [];
  const name = packageName.replace(/^@/, '').split('/')[0];
  
  for (const popular of popularPackages) {
    const distance = levenshteinDistance(name.toLowerCase(), popular.toLowerCase());
    if (distance > 0 && distance <= 2) {
      warnings.push({
        name: popular,
        similarity: distance === 1 ? 'VERY SIMILAR' : 'similar',
        risk: distance === 1 ? 'CRITICAL' : 'HIGH'
      });
    }
  }
  
  return warnings;
}