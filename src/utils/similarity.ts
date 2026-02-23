// -----------------------------
// Normalización
// -----------------------------

export function normalizeText(text: string): string {
  if (!text) return "";
  text = text.toUpperCase().trim();
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return text.replace(/\s+/g, ' ');
}

// -----------------------------
// Similitud (distancia de Levenshtein)
// -----------------------------

function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(a, b);
  return ((maxLen - distance) / maxLen) * 100;
}

// -----------------------------
// Evaluación mejorada de similitud de nombres
// -----------------------------

// -----------------------------
// Evaluación mejorada de similitud de nombres
// -----------------------------

export function nameSimilarityAdvanced(name1: string, name2: string): number {
  name1 = normalizeText(name1);
  name2 = normalizeText(name2);

  // Similaridad global
  const globalScore = similarity(name1, name2);

  // Similaridad por palabras
  const tokens1 = name1.split(/\s+/);
  const tokens2 = name2.split(/\s+/);

  const tokenScores: number[] = [];

  for (const t1 of tokens1) {
    let best = 0;
    for (const t2 of tokens2) {
      best = Math.max(best, similarity(t1, t2));
    }
    tokenScores.push(best);
  }

  const tokenScore = tokenScores.length > 0 ? tokenScores.reduce((sum, score) => sum + score, 0) / tokenScores.length : 0;

  // Promedio ponderado
  const finalScore = (globalScore * 0.4) + (tokenScore * 0.6);

  return finalScore;
}

export function totalSimilarity(
  candidate1: { dni: string; nombres: string; apellidoPaterno: string; apellidoMaterno: string; correo: string; telefono: string },
  candidate2: { dni: string; nombres: string; apellidoPaterno: string; apellidoMaterno: string; correo: string; telefono: string },
  weights: { dni: number; name: number; email: number; phone: number } = { dni: 0, name: 97, email: 10, phone: 10 }
): number {
  // DNI exact match
  const dniScore = candidate1.dni === candidate2.dni ? 100 : 0;

  // Name similarity
  const name1 = `${candidate1.nombres} ${candidate1.apellidoPaterno} ${candidate1.apellidoMaterno}`;
  const name2 = `${candidate2.nombres} ${candidate2.apellidoPaterno} ${candidate2.apellidoMaterno}`;
  const nameScore = nameSimilarityAdvanced(name1, name2);

  // Email similarity (only local part before @)
  const emailLocal1 = candidate1.correo.split('@')[0];
  const emailLocal2 = candidate2.correo.split('@')[0];
  const emailScore = similarity(emailLocal1, emailLocal2);

  // Phone similarity (remove first digit if it's 9)
  const phoneNormalized1 = candidate1.telefono.startsWith('9') ? candidate1.telefono.slice(1) : candidate1.telefono;
  const phoneNormalized2 = candidate2.telefono.startsWith('9') ? candidate2.telefono.slice(1) : candidate2.telefono;
  const phoneScore = similarity(phoneNormalized1, phoneNormalized2);

  // Weighted total
  const total = (dniScore * weights.dni / 100) + (nameScore * weights.name / 100) + (emailScore * weights.email / 100) + (phoneScore * weights.phone / 100);

  console.log('Similarity components:', { dniScore, nameScore, emailScore, phoneScore, total });

  return total;
}
