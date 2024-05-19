const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });
};

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

const createUser = async (data) => {
  const { name, email, password } = data;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
