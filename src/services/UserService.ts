import { User, IUser } from '../models/User';
import { Validator } from '../utils/Validator';

export class UserService {
  private users: Map<string, User>;
  private validator: Validator;

  constructor() {
    this.users = new Map();
    this.validator = new Validator();
  }

  public createUser(email: string, name: string, age: number): User {
    if (!this.validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (this.validator.isEmpty(name)) {
      throw new Error('Name cannot be empty');
    }

    const ageValidation = this.validator.validateAge(age);
    if (!ageValidation.valid) {
      throw new Error(ageValidation.message || 'Invalid age');
    }

    // Check if user with this email already exists
    const existingUser = Array.from(this.users.values()).find((u) => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const id = this.generateId();
    const user = new User(id, email, name, age);
    this.users.set(id, user);
    return user;
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public updateUser(id: string, updates: Partial<IUser>): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.email !== undefined) {
      if (!this.validator.isEmail(updates.email)) {
        throw new Error('Invalid email format');
      }
      // Check if another user has this email
      const existingUser = Array.from(this.users.values()).find(
        (u) => u.email === updates.email && u.id !== id,
      );
      if (existingUser) {
        throw new Error('Another user with this email already exists');
      }
      user.email = updates.email;
    }

    if (updates.name !== undefined) {
      if (this.validator.isEmpty(updates.name)) {
        throw new Error('Name cannot be empty');
      }
      user.name = updates.name;
    }

    if (updates.age !== undefined) {
      user.updateAge(updates.age);
    }

    return user;
  }

  public deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  public getUserCount(): number {
    return this.users.size;
  }

  public getAdultUsers(): User[] {
    return Array.from(this.users.values()).filter((u) => u.isAdult());
  }

  public getMinorUsers(): User[] {
    return Array.from(this.users.values()).filter((u) => !u.isAdult());
  }

  public searchUsersByName(searchTerm: string): User[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return Array.from(this.users.values()).filter((u) =>
      u.name.toLowerCase().includes(lowerSearchTerm),
    );
  }

  public clearAllUsers(): void {
    this.users.clear();
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
