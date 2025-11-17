export class Validator {
  public isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    if (password.length < 8) {
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }

  public isURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  public isPhoneNumber(phone: string): boolean {
    // Simple international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
  }

  public isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  public isAlphanumeric(str: string): boolean {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(str);
  }

  public isEmpty(value: string | unknown[] | object | null | undefined): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return false;
  }

  public isCreditCard(cardNumber: string): boolean {
    // Luhn algorithm for credit card validation
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  public validateAge(age: number): { valid: boolean; message?: string } {
    if (age < 0) {
      return { valid: false, message: 'Age cannot be negative' };
    }
    if (age > 150) {
      return { valid: false, message: 'Age seems unrealistic' };
    }
    if (!Number.isInteger(age)) {
      return { valid: false, message: 'Age must be an integer' };
    }
    return { valid: true };
  }
}
