const { ApolloServer } = require('apollo-server-express');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core');
const http = require("http");
const express = require("express");
const path = require("path");

const typeDefs = `
    type Query{
        totalPosts: Int!
    }
`;
const resolvers = {
  Query: {
    totalPosts: () => 100,
  },
};

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.static(path.join(__dirname, "../client", "build")));
  app.use(express.static("public"));

  app.get("/rest", function (req, res) {
    res.json({ data: "api working" });
  });

  app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  });

  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);