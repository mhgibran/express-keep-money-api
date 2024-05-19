const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRefreshToken = async (userId, refreshToken, userAgent) => {
  return await prisma.refreshToken.findFirst({
    where: {
      user_id: userId,
      token: refreshToken,
      user_agent: userAgent,
    },
    select: {
      id: true,
      token: true,
    },
  });
};

const createRefreshToken = async (userId, refreshToken, userAgent) => {
  return await prisma.refreshToken.create({
    data: {
      user_id: userId,
      token: refreshToken,
      user_agent: userAgent,
    },
  });
};

const updateRefreshToken = async (
  userId,
  oldRefreshToken,
  newRefreshToken,
  userAgent
) => {
  const token = await getRefreshToken(userId, oldRefreshToken, userAgent);
  return await prisma.refreshToken.update({
    where: {
      id: token.id,
    },
    data: {
      user_id: userId,
      token: newRefreshToken,
      user_agent: userAgent,
    },
  });
};

const deleteRefreshToken = async (userId, refreshToken, userAgent) => {
  const token = await getRefreshToken(userId, refreshToken, userAgent);
  return await prisma.refreshToken.delete({
    where: {
      id: token.id,
    },
  });
};

module.exports = {
  createRefreshToken,
  updateRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
};
