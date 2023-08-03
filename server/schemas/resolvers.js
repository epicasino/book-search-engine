const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, { username, _id }) => {
      return await User.findOne({
        $or: [{ _id: _id }, { username: username }],
      });
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
        return { message: "Wrong Password!" };
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
    saveBook: async (parent, { bookData }, context) => {
      return await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );
    },
    removeBook: async (parent, { _id, bookId }) => {
      return await User.findOneAndUpdate(
        { _id: _id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
