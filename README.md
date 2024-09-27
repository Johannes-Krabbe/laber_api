# Laber Api
This is the repository for Laber. You will find all relevant documentation regarding software architecture, security, etc. in the frontend repository [laber_app](https://github.com/johannes-krabbe/laber_app).

## Techstack
- [Bun](https://bun.sh/): JavaScript runtime and package manager
- [Hono](https://hono.dev/): Web framework
- [Prisma](https://www.prisma.io/): Database ORM
- [PostgreSQL](https://www.postgresql.org/): Relational database

## Running the project locally
1. Install Bun (e.g. by following the instructions on the [official Bun website](https://bun.sh/))
2. Install Postgres (e.g. for macOS via [homebrew](https://formulae.brew.sh/formula/postgresql@14))
3. Create a Postgres database
```sh
brew services start postgres
createdb laber
```
4. Create a .env file, copy the content of .env.example into it and set the DATABASE_URL according to your local setup. The other variables can stay the same - more information below
```sh
cp .env.example .env
```
5. Install the project dependencies
```sh
bun install
```
6. Run the Prisma migrations
```
bun db-migrate
```
7. Start the server
```
bun dev
```

## Environment variables
- `DATABASE_URL`: The connection string for your PostgreSQL database. This is used by Prisma to connect to your database.
  Example: `postgresql://username:password@localhost:5432/database_name`
- `PORT`, not required: The port on which your server will run. Default is set to 8080.
- `NODE_ENV`: The environment in which the application is running. Values can be `'development', 'staging', 'production', 'test'`.
- `JWT_SECRET`: A secret key used to sign JSON Web Tokens for authentication. Make sure to change this to a strong, unique value in production.
- `SEND_SMS`, not required: A boolean flag to enable or disable SMS sending functionality. Set to `'true'` by default. If set to `'false'` outgoing messages will be logged into the console.
> As of now, you only need AWS credentials if you want to send out SMS messages. Set `SEND_SMS` to `"false"` if you don't have AWS credentials.
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID. Set to "NONE" if not using AWS services.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key. Set to "NONE" if not using AWS services.
- `AWS_REGION`: The AWS region you're using. Set to "NONE" if not using AWS services.

## Scripts
- `dev`: Run the development server with hot reloading using Bun.
- `prettier`: Format TypeScript files using Prettier.
- `lint`: Lint and fix TypeScript files using ESLint.
- `format`: Run both Prettier and ESLint to format and lint the code.
- `db-generate`: Generate Prisma client.
- `db-migrate`: Generate Prisma client and run database migrations. Checks for changes in `prisma/schema.prisma` and creates a new migration if there are any.
- `db-reset`: Reset the database and run migrations.
- `db-migrate-prod`: Run database migrations. Does not check `prisma/schema.prisma` for changes.

## Deployment
The Laber API is currently deployed on [fly.io](https://fly.io). It will deploy automatically through GitHub Actions on pushes to the `main` branch. Deployment settings are managed through the fly.toml file in the project root. For manual deployments or log viewing, refer to the official Fly.io documentation.
