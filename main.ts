import Fastify from 'fastify';
import { GraphQLError } from 'graphql';
import mercurius from 'mercurius';


const app = Fastify();

class AuthenticationError extends GraphQLError {
    constructor(message: string) {
        super(message);

        // This has to be done in order to make instanceof work with anything that inherits from Error
        Object.setPrototypeOf(this, AuthenticationError.prototype)
    }
}

app.register(mercurius, {
    graphiql: true,
    schema: `
        type Query {
            testQuery: String
        }
    `,
    resolvers: {
        Query: {
            testQuery: () => {
                const err = new AuthenticationError('Message');

                if(err instanceof AuthenticationError) {
                    console.log('Error is instanceof AuthenticationError');
                } else {
                    console.log('Error is not instanceof AuthenticationError');
                }

                throw err;
            }
        }
    },
    errorFormatter: result => {
        const errors = result.errors?.map(err => {
            if(err instanceof AuthenticationError) {
                console.log('Error is also instanceof AuthenticationError in errorFormatter');
            } else {
                console.log('Error is not instanceof AuthenticationError in errorFormatter');
            }

            return err;
        });

        return {
            statusCode: 200,
            response: {
                errors,
                extensions: result.extensions
            }
        }
    }
});

app.listen(4000).then(url => console.log(`Listening on ${url}`))