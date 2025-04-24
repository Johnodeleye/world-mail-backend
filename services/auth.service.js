const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

exports.registerUser = async (username, name, password) => {
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) throw new Error('Username already exists');

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return await prisma.user.create({
    data: { username, name, password: hashedPassword }
  });
};

exports.loginUser = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return user;
};