/**
 * Generates a secure random password with the specified criteria
 * Requirements: uppercase, lowercase, number, and special character
 */

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSpecialChars?: number;
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(options: PasswordOptions = {}): string {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    minUppercase = 1,
    minLowercase = 1,
    minNumbers = 1,
    minSpecialChars = 1,
  } = options;

  if (length < 8) {
    throw new Error('Password length must be at least 8 characters');
  }

  const requiredChars: string[] = [];
  let allChars = '';

  // Add required characters and build character set
  if (includeUppercase) {
    for (let i = 0; i < minUppercase; i++) {
      requiredChars.push(getRandomChar(UPPERCASE_CHARS));
    }
    allChars += UPPERCASE_CHARS;
  }

  if (includeLowercase) {
    for (let i = 0; i < minLowercase; i++) {
      requiredChars.push(getRandomChar(LOWERCASE_CHARS));
    }
    allChars += LOWERCASE_CHARS;
  }

  if (includeNumbers) {
    for (let i = 0; i < minNumbers; i++) {
      requiredChars.push(getRandomChar(NUMBER_CHARS));
    }
    allChars += NUMBER_CHARS;
  }

  if (includeSpecialChars) {
    for (let i = 0; i < minSpecialChars; i++) {
      requiredChars.push(getRandomChar(SPECIAL_CHARS));
    }
    allChars += SPECIAL_CHARS;
  }

  if (allChars === '') {
    throw new Error('At least one character type must be included');
  }

  // Fill remaining length with random characters
  const remainingLength = length - requiredChars.length;
  if (remainingLength < 0) {
    throw new Error('Password length is too short for the required character constraints');
  }

  for (let i = 0; i < remainingLength; i++) {
    requiredChars.push(getRandomChar(allChars));
  }

  // Shuffle the password array to randomize character positions
  return shuffleArray(requiredChars).join('');
}

/**
 * Generate a password specifically for new users created via payment
 */
export function generateUserPassword(): string {
  return generateSecurePassword({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: true,
    minUppercase: 2,
    minLowercase: 2,
    minNumbers: 2,
    minSpecialChars: 1,
  });
}

/**
 * Validate if a password meets security requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get a random character from a character set
 */
function getRandomChar(charSet: string): string {
  const randomIndex = Math.floor(Math.random() * charSet.length);
  return charSet[randomIndex];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate multiple passwords for testing
 */
export function generatePasswordBatch(count: number, options?: PasswordOptions): string[] {
  const passwords: string[] = [];
  for (let i = 0; i < count; i++) {
    passwords.push(generateSecurePassword(options));
  }
  return passwords;
}

export default {
  generateSecurePassword,
  generateUserPassword,
  validatePassword,
  generatePasswordBatch,
};