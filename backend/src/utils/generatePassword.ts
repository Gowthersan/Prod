/**
 * ====================================
 * GÉNÉRATEUR DE MOT DE PASSE
 * ====================================
 *
 * Génère un mot de passe sécurisé avec :
 * - Lettres majuscules et minuscules
 * - Chiffres
 * - Caractères spéciaux
 *
 * @param length - Longueur du mot de passe (défaut: 12)
 * @returns Un mot de passe sécurisé
 */
function generateRandomString(characters: string, length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@#$%&*";

  const allChars = uppercase + lowercase + numbers + special;

  // Assurer au moins un caractère de chaque type
  let password =
    generateRandomString(uppercase, 1) +
    generateRandomString(lowercase, 1) +
    generateRandomString(numbers, 1) +
    generateRandomString(special, 1);

  // Compléter jusqu'à la longueur souhaitée
  const remainingLength = length - password.length;
  if (remainingLength > 0) {
    password += generateRandomString(allChars, remainingLength);
  }

  // Mélanger le mot de passe
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
