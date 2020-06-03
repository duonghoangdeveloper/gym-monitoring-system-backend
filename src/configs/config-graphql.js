import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import path from 'path';

// Merge all schema.graphql in all modules to typeDefs
const typesArray = fileLoader(
  path.join(__dirname, '/../modules/**/*.graphql'),
  {
    recursive: true,
  }
);

const resolversArray = fileLoader(
  path.join(__dirname, '/../modules/**/*.resolvers.js'),
  {
    recursive: true,
  }
);

const typeDefs = mergeTypes(typesArray, { all: true });
const resolvers = mergeResolvers(resolversArray, { add: true });
const schema = makeExecutableSchema({ resolvers, typeDefs });

const apolloServer = new ApolloServer({
  context: async ({ req, res }) => ({
    req,
    res,
  }),
  schema,
});

export const configGraphql = app => {
  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
  });
};
