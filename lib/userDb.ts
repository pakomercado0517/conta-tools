import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Tipos para los usuarios
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

// Usuario sin contraseña (para respuestas)
export interface SafeUser extends Omit<User, 'password'> {}

// Datos para crear usuario
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

// Configuración de la base de datos
const USERS_DB_PATH: string = process.env.USERS_DB_PATH || './data/users.json';

/**
 * Asegurar que el directorio y archivo de base de datos existe
 */
function ensureDbExists(): void {
  const dir = path.dirname(USERS_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify([], null, 2));
  }
}

/**
 * Leer usuarios del archivo JSON
 * @returns Array de usuarios
 */
function readUsers(): User[] {
  try {
    ensureDbExists();
    const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

/**
 * Escribir usuarios al archivo JSON
 * @param users - Array de usuarios a escribir
 * @returns true si fue exitoso, false en caso contrario
 */
function writeUsers(users: User[]): boolean {
  try {
    ensureDbExists();
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

/**
 * Remover la contraseña de un objeto usuario
 * @param user - Usuario completo
 * @returns Usuario sin contraseña
 */
function removePassword(user: User): SafeUser {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Operaciones de base de datos para usuarios
 */
export const userDb = {
  /**
   * Crear un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado sin contraseña
   * @throws Error si el email ya existe
   */
  async createUser(userData: CreateUserData): Promise<SafeUser> {
    const users = readUsers();
    
    // Verificar si el email ya existe
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser: User = {
      id: uuidv4(),
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken: uuidv4(),
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    const writeSuccess = writeUsers(users);
    
    if (!writeSuccess) {
      throw new Error('Error al crear el usuario');
    }

    return removePassword(newUser);
  },

  /**
   * Buscar usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = readUsers();
    return users.find(user => user.email === email) || null;
  },

  /**
   * Buscar usuario por ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o null
   */
  async findById(id: string): Promise<User | null> {
    const users = readUsers();
    return users.find(user => user.id === id) || null;
  },

  /**
   * Buscar usuario por ID y devolver versión segura (sin contraseña)
   * @param id - ID del usuario
   * @returns Usuario sin contraseña o null
   */
  async findSafeById(id: string): Promise<SafeUser | null> {
    const user = await this.findById(id);
    return user ? removePassword(user) : null;
  },

  /**
   * Verificar contraseña de usuario
   * @param email - Email del usuario
   * @param password - Contraseña a verificar
   * @returns Usuario sin contraseña si es válida, null en caso contrario
   */
  async verifyPassword(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return removePassword(user);
  },

  /**
   * Verificar email usando token de verificación
   * @param token - Token de verificación
   * @returns Usuario sin contraseña si fue exitoso, null en caso contrario
   */
  async verifyEmail(token: string): Promise<SafeUser | null> {
    if (!token.trim()) return null;

    const users = readUsers();
    const userIndex = users.findIndex(user => user.emailVerificationToken === token);
    
    if (userIndex === -1) return null;

    users[userIndex].emailVerified = true;
    users[userIndex].emailVerificationToken = null;
    users[userIndex].updatedAt = new Date().toISOString();

    const writeSuccess = writeUsers(users);
    if (!writeSuccess) return null;
    
    return removePassword(users[userIndex]);
  },

  /**
   * Generar token de reseteo de contraseña
   * @param email - Email del usuario
   * @returns Token generado o null si no se encuentra el usuario
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) return null;

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    users[userIndex].passwordResetToken = resetToken;
    users[userIndex].passwordResetExpires = expiresAt.toISOString();
    users[userIndex].updatedAt = new Date().toISOString();

    const writeSuccess = writeUsers(users);
    return writeSuccess ? resetToken : null;
  },

  /**
   * Resetear contraseña usando token
   * @param token - Token de reseteo
   * @param newPassword - Nueva contraseña
   * @returns Usuario sin contraseña si fue exitoso, null en caso contrario
   */
  async resetPassword(token: string, newPassword: string): Promise<SafeUser | null> {
    if (!token.trim() || !newPassword.trim()) return null;

    const users = readUsers();
    const userIndex = users.findIndex(user => 
      user.passwordResetToken === token && 
      user.passwordResetExpires &&
      new Date(user.passwordResetExpires) > new Date()
    );
    
    if (userIndex === -1) return null;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    users[userIndex].password = hashedPassword;
    users[userIndex].passwordResetToken = null;
    users[userIndex].passwordResetExpires = null;
    users[userIndex].updatedAt = new Date().toISOString();

    const writeSuccess = writeUsers(users);
    if (!writeSuccess) return null;
    
    return removePassword(users[userIndex]);
  },

  /**
   * Actualizar información del usuario
   * @param id - ID del usuario
   * @param updateData - Datos a actualizar
   * @returns Usuario actualizado sin contraseña o null
   */
  async updateUser(id: string, updateData: Partial<Pick<User, 'name' | 'email'>>): Promise<SafeUser | null> {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;

    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (updateData.email && updateData.email !== users[userIndex].email) {
      const emailExists = users.some(user => user.email === updateData.email);
      if (emailExists) {
        throw new Error('El email ya está en uso');
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const writeSuccess = writeUsers(users);
    if (!writeSuccess) return null;

    return removePassword(users[userIndex]);
  },

  /**
   * Cambiar contraseña de usuario
   * @param id - ID del usuario
   * @param currentPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @returns Usuario sin contraseña si fue exitoso, null en caso contrario
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<SafeUser | null> {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isCurrentPasswordValid) return null;

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    users[userIndex].password = hashedNewPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    const writeSuccess = writeUsers(users);
    if (!writeSuccess) return null;

    return removePassword(users[userIndex]);
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns Estadísticas básicas
   */
  async getStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
  }> {
    const users = readUsers();
    
    return {
      total: users.length,
      verified: users.filter(user => user.emailVerified).length,
      unverified: users.filter(user => !user.emailVerified).length,
    };
  }
};