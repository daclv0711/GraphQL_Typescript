require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { Status } from './entities/Status';
import { Comment } from './entities/Comment';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import cors from 'cors'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { UserResolver } from './resolvers/user';
import mongoose, { ConnectOptions } from 'mongoose';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import { COOKIE_NAME, __prod__ } from './constants';
import { Context } from './types/Context';
import { StatusResolver } from './resolvers/status';

const port = process.env.PORT || 4000
const main = async () => {
    await createConnection({
        type: 'postgres',
        database: 'social-media',
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        logging: false,
        synchronize: true,
        entities: [User, Status, Comment]
    })

    // sendEmail('daclv0711@gmail.com', "<b>123343</b>")

    const app = express()
    app.use(cors({
        origin: '*',
        credentials: true
    }))

    //Section/Cokie store
    mongoose.connect(`${process.env.MONGODB_URI}` as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions, err => {
        if (err) throw err;
        console.log('Successfully connected to MongoDB');
    });

    app.set('trust proxy', 1)
    app.use(session({
        name: COOKIE_NAME,
        store: MongoStore.create({ mongoUrl: `${process.env.MONGODB_URI}` }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true, //JS can't access cookie from frontend
            secure: __prod__, //only send cookie over https
            sameSite: 'lax', //csrf
        },
        secret: process.env.SESSTION_SECRET_DEV_PROD as string,
        saveUninitialized: false, //don't create session until something stored
        resave: false, //don't save session if unmodified
    }));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver, StatusResolver],
            validate: false
        }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
        context: ({ req, res }): Context => ({ req, res })
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(port, () => {
        console.log(`Server started on port ${port}. GraphQL server started on localhost:${port}${apolloServer.graphqlPath}`);
    })
}

main().then(() => {
    console.log('Postgres connected')
}).catch(err => {
    console.log(err);
});

