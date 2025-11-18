export interface IUser {
  id: string;
  email: string;
  name: string;
  age: number;
  createdAt: Date;
}

export class User implements IUser {
  public readonly id: string;
  public email: string;
  public name: string;
  public age: number;
  public readonly createdAt: Date;

  constructor(id: string, email: string, name: string, age: number, createdAt?: Date) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.age = age;
    this.createdAt = createdAt || new Date();
  }

  public isAdult(): boolean {
    return this.age >= 18;
  }

  public getDisplayName(): string {
    return `${this.name} (${this.email})`;
  }

  public updateAge(newAge: number): void {
    if (newAge < 0) {
      throw new Error('Age cannot be negative');
    }
    if (newAge > 150) {
      throw new Error('Age seems unrealistic');
    }
    this.age = newAge;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      age: this.age,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
