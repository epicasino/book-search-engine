const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({
          _id: context.user._id,
        }).select('-__v -password');

        return userData;
      }

      throw AuthenticationError;
    },
  },
  Mutation: {
    login: async (parent, { username, email, password }) => {
      const user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });

      if (!user) {
        return { message: `Can't find user.` };
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return { message: 'Wrong Password!' };
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({
        username: username,
        email: email,
        password: password,
      });

      const token = signToken(user);
      return { user, token };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }

      throw AuthenticationError;
    },
    removeBook: async (parent, { bookId }, context) => {
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
