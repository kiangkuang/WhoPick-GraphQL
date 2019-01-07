# WhoPick GraphQL
A GraphQL server implementation of the WhoPick backend using [graphql-yoga](https://github.com/prisma/graphql-yoga) and [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)

## Usage
1. Install dependencies
    ```
    yarn install
    ```
2. Set up environment variables
    ```
    yarn setup
    ```
    * Open `.env` file and configure the `PORT` and `DB_URL` with the GraphQL server port number and MySQL DB URL

3. Development
    ```
    yarn dev
    ```
4. Build for production
    ```
    yarn build
    ```
5. Start production server
    ```
    yarn start
    ```
6. Linting
    ```
    yarn lint
    ```