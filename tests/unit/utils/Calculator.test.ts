import { Calculator } from '../../../src/utils/Calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
      expect(calculator.add(10, 20)).toBe(30);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-5, -3)).toBe(-8);
      expect(calculator.add(-10, 5)).toBe(-5);
    });

    it('should add zero', () => {
      expect(calculator.add(5, 0)).toBe(5);
      expect(calculator.add(0, 0)).toBe(0);
    });

    it('should add decimal numbers', () => {
      expect(calculator.add(1.5, 2.3)).toBeCloseTo(3.8);
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('subtract', () => {
    it('should subtract two positive numbers', () => {
      expect(calculator.subtract(10, 3)).toBe(7);
      expect(calculator.subtract(5, 2)).toBe(3);
    });

    it('should handle negative results', () => {
      expect(calculator.subtract(3, 10)).toBe(-7);
      expect(calculator.subtract(0, 5)).toBe(-5);
    });

    it('should subtract negative numbers', () => {
      expect(calculator.subtract(-5, -3)).toBe(-2);
      expect(calculator.subtract(5, -3)).toBe(8);
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers', () => {
      expect(calculator.multiply(3, 4)).toBe(12);
      expect(calculator.multiply(7, 8)).toBe(56);
    });

    it('should multiply by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
      expect(calculator.multiply(0, 100)).toBe(0);
    });

    it('should multiply negative numbers', () => {
      expect(calculator.multiply(-3, 4)).toBe(-12);
      expect(calculator.multiply(-3, -4)).toBe(12);
    });

    it('should multiply decimal numbers', () => {
      expect(calculator.multiply(2.5, 4)).toBeCloseTo(10);
      expect(calculator.multiply(0.5, 0.5)).toBeCloseTo(0.25);
    });
  });

  describe('divide', () => {
    it('should divide two positive numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
      expect(calculator.divide(15, 3)).toBe(5);
    });

    it('should divide with decimal result', () => {
      expect(calculator.divide(10, 3)).toBeCloseTo(3.333, 2);
      expect(calculator.divide(7, 2)).toBe(3.5);
    });

    it('should divide negative numbers', () => {
      expect(calculator.divide(-10, 2)).toBe(-5);
      expect(calculator.divide(-10, -2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed');
      expect(() => calculator.divide(0, 0)).toThrow('Division by zero is not allowed');
    });

    it('should divide zero by non-zero number', () => {
      expect(calculator.divide(0, 5)).toBe(0);
    });
  });

  describe('power', () => {
    it('should calculate power of positive numbers', () => {
      expect(calculator.power(2, 3)).toBe(8);
      expect(calculator.power(5, 2)).toBe(25);
    });

    it('should handle power of zero', () => {
      expect(calculator.power(5, 0)).toBe(1);
      expect(calculator.power(0, 5)).toBe(0);
    });

    it('should handle power of one', () => {
      expect(calculator.power(5, 1)).toBe(5);
      expect(calculator.power(1, 100)).toBe(1);
    });

    it('should handle negative exponents', () => {
      expect(calculator.power(2, -1)).toBe(0.5);
      expect(calculator.power(10, -2)).toBe(0.01);
    });
  });

  describe('sqrt', () => {
    it('should calculate square root of positive numbers', () => {
      expect(calculator.sqrt(4)).toBe(2);
      expect(calculator.sqrt(9)).toBe(3);
      expect(calculator.sqrt(16)).toBe(4);
    });

    it('should calculate square root of zero', () => {
      expect(calculator.sqrt(0)).toBe(0);
    });

    it('should calculate square root of decimal numbers', () => {
      expect(calculator.sqrt(2)).toBeCloseTo(1.414, 2);
      expect(calculator.sqrt(0.25)).toBe(0.5);
    });

    it('should throw error for negative numbers', () => {
      expect(() => calculator.sqrt(-1)).toThrow(
        'Cannot calculate square root of negative number',
      );
      expect(() => calculator.sqrt(-100)).toThrow(
        'Cannot calculate square root of negative number',
      );
    });
  });

  describe('factorial', () => {
    it('should calculate factorial of positive integers', () => {
      expect(calculator.factorial(0)).toBe(1);
      expect(calculator.factorial(1)).toBe(1);
      expect(calculator.factorial(5)).toBe(120);
      expect(calculator.factorial(6)).toBe(720);
    });

    it('should calculate factorial of larger numbers', () => {
      expect(calculator.factorial(10)).toBe(3628800);
    });

    it('should throw error for negative numbers', () => {
      expect(() => calculator.factorial(-1)).toThrow(
        'Factorial is not defined for negative numbers',
      );
      expect(() => calculator.factorial(-5)).toThrow(
        'Factorial is not defined for negative numbers',
      );
    });

    it('should throw error for non-integers', () => {
      expect(() => calculator.factorial(3.5)).toThrow('Factorial is only defined for integers');
      expect(() => calculator.factorial(1.1)).toThrow('Factorial is only defined for integers');
    });
  });

  describe('percentage', () => {
    it('should calculate percentage of a value', () => {
      expect(calculator.percentage(100, 50)).toBe(50);
      expect(calculator.percentage(200, 25)).toBe(50);
    });

    it('should handle zero values', () => {
      expect(calculator.percentage(0, 50)).toBe(0);
      expect(calculator.percentage(100, 0)).toBe(0);
    });

    it('should handle percentages over 100', () => {
      expect(calculator.percentage(100, 150)).toBe(150);
    });

    it('should handle decimal percentages', () => {
      expect(calculator.percentage(100, 12.5)).toBe(12.5);
    });
  });

  describe('average', () => {
    it('should calculate average of positive numbers', () => {
      expect(calculator.average([1, 2, 3, 4, 5])).toBe(3);
      expect(calculator.average([10, 20, 30])).toBe(20);
    });

    it('should calculate average of single number', () => {
      expect(calculator.average([5])).toBe(5);
    });

    it('should calculate average with negative numbers', () => {
      expect(calculator.average([-5, 5])).toBe(0);
      expect(calculator.average([-10, -20, -30])).toBe(-20);
    });

    it('should calculate average of decimal numbers', () => {
      expect(calculator.average([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });

    it('should throw error for empty array', () => {
      expect(() => calculator.average([])).toThrow('Cannot calculate average of empty array');
    });
  });

  describe('max', () => {
    it('should find maximum of positive numbers', () => {
      expect(calculator.max([1, 5, 3, 2, 4])).toBe(5);
      expect(calculator.max([10, 20, 15])).toBe(20);
    });

    it('should find maximum of single number', () => {
      expect(calculator.max([42])).toBe(42);
    });

    it('should find maximum with negative numbers', () => {
      expect(calculator.max([-5, -1, -10])).toBe(-1);
      expect(calculator.max([-5, 0, 5])).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => calculator.max([])).toThrow('Cannot find max of empty array');
    });
  });

  describe('min', () => {
    it('should find minimum of positive numbers', () => {
      expect(calculator.min([1, 5, 3, 2, 4])).toBe(1);
      expect(calculator.min([10, 20, 15])).toBe(10);
    });

    it('should find minimum of single number', () => {
      expect(calculator.min([42])).toBe(42);
    });

    it('should find minimum with negative numbers', () => {
      expect(calculator.min([-5, -1, -10])).toBe(-10);
      expect(calculator.min([-5, 0, 5])).toBe(-5);
    });

    it('should throw error for empty array', () => {
      expect(() => calculator.min([])).toThrow('Cannot find min of empty array');
    });
  });
});
