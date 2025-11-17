export class Calculator {
  public add(a: number, b: number): number {
    return a + b;
  }

  public subtract(a: number, b: number): number {
    return a - b;
  }

  public multiply(a: number, b: number): number {
    return a * b;
  }

  public divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }

  public power(base: number, exponent: number): number {
    return Math.pow(base, exponent);
  }

  public sqrt(n: number): number {
    if (n < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    return Math.sqrt(n);
  }

  public factorial(n: number): number {
    if (n < 0) {
      throw new Error('Factorial is not defined for negative numbers');
    }
    if (!Number.isInteger(n)) {
      throw new Error('Factorial is only defined for integers');
    }
    if (n === 0 || n === 1) {
      return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  public percentage(value: number, percent: number): number {
    return (value * percent) / 100;
  }

  public average(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error('Cannot calculate average of empty array');
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  }

  public max(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error('Cannot find max of empty array');
    }
    return Math.max(...numbers);
  }

  public min(numbers: number[]): number {
    if (numbers.length === 0) {
      throw new Error('Cannot find min of empty array');
    }
    return Math.min(...numbers);
  }
}
