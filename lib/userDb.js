import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const USERS_DB_PATH = process.env.USERS_DB_PATH || './data/users.json';

// Asegurar que el directorio existe
function ensureDbExists() {
  const dir = path.dirname(USERS_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify([], null, 2));
  }
}

// Leer usuarios
function readUsers() {
  try {
    ensureDbExists();
    const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Escribir usuarios
function writeUsers(users) {
  try {
    ensureDbExists();
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

// Operaciones de usuario
export const userDb = {
  // Crear usuario
  async createUser(userData) {
    const users = readUsers();
    
    // Verificar si el email ya existe
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = {
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
    writeUsers(users);

    // Retornar usuario sin password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // Buscar usuario por email
  async findByEmail(email) {
    const users = readUsers();
    return users.find(user => user.email === email) || null;
  },

  // Buscar usuario por ID
  async findById(id) {
    const users = readUsers();
    return users.find(user => user.id === id) || null;
  },

  // Verificar contraseña
  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Verificar email
  async verifyEmail(token) {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.emailVerificationToken === token);
    
    if (userIndex === -1) return null;

    users[userIndex].emailVerified = true;
    users[userIndex].emailVerificationToken = null;
    users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  },

  // Generar token de reseteo de contraseña
  async generatePasswordResetToken(email) {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) return null;

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    users[userIndex].passwordResetToken = resetToken;
    users[userIndex].passwordResetExpires = expiresAt.toISOString();
    users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(users);
    return resetToken;
  },

  // Resetear contraseña
  async resetPassword(token, newPassword) {
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

    writeUsers(users);
    
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }
};
