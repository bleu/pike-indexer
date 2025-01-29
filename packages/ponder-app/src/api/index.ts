import { graphql } from 'ponder';
import schema from 'ponder:schema';
import { db } from 'ponder:api';

import { Hono } from 'hono';
import docs from 'src/utils/docs';
import { createDocumentationMiddleware } from 'ponder-enrich-gql-docs-middleware';

const app = new Hono();

app.use('/', createDocumentationMiddleware(docs));
app.use('/', graphql({ db, schema }));
app.use('/graphql', createDocumentationMiddleware(docs));
app.use('/graphql', graphql({ db, schema }));

export default app;
