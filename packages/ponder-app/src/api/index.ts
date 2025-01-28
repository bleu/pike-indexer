import { graphql } from 'ponder';
import schema from 'ponder:schema';
import { db } from 'ponder:api';

import { Hono } from 'hono';

const app = new Hono();

app.use('/', graphql({ db, schema }));
app.use('/graphql', graphql({ db, schema }));

export default app;
