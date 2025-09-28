export class OrderCodeGenerator {
  private static readonly CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  /**
   * Generate a unique 8-character order code with letters and numbers
   * Format: Based on timestamp to ensure uniqueness
   */
  static generate(): string {
    const timestamp = Date.now().toString();
    let code = '';
    
    // Use timestamp digits to generate consistent codes
    for (let i = 0; i < 8; i++) {
      const charIndex = parseInt(timestamp[i % timestamp.length]) + 
                       parseInt(timestamp[(i + 1) % timestamp.length]) + 
                       (i * 7);
      code += this.CHARACTERS[charIndex % this.CHARACTERS.length];
    }
    
    return code;
  }

  /**
   * Generate a random 8-character order code
   */
  static generateRandom(): string {
    let code = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARACTERS.length);
      code += this.CHARACTERS[randomIndex];
    }
    return code;
  }

  /**
   * Validate order code format (8 characters, alphanumeric)
   */
  static validate(code: string): boolean {
    const regex = /^[A-Z0-9]{8}$/;
    return regex.test(code);
  }
}
