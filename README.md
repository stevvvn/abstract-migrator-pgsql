
# abstract-migrator-pg

This is a PostgreSQL adapter for migrations run with `abstract-migrator`

## Installation
	$ yarn global add abstract-migrator
	$ yarn add abstract-migrator-pg
	$ mkdir -p migrations/pg

## Configuration
In `migrations/`, `migrations/pg` or the parent folder of `migrations` in your project, according to your preference, add `conf.js` and (optionally) `secrets.js` files that export enough information to connect to PostgreSQL. (The split between conf and secrets is so you can commit common settings in the former and `.gitignore` secrets.js for local credentials)

Ex.:
### conf.js
```javascript
module.exports = {
    'pg': {
	    'host': 'localhost',
		'user': 'myapp',
		'database': 'myapp'
	}
};
```
### secrets.js
```javascript
module.exports = {
	'pg': { 'password': 'foo' }
};
```
These parameter are passed directly to the `pg` Client constructor, so you can see your options here: https://node-postgres.com/features/connecting

The only parameter added by this module is `prefix`. By default, a table called `migrations` is created, but if you add `'prefix': 'foo'` it'll be `foo_migrations` instead.

## Usage

These examples assume you have `cd`-ed to `migrations/pg/` in your project path. You can also supply `--path /project/path` instead of relying on the working directory.

### View help

	$ amigrate
	Usage: amigrate [options] verb [verb args]
	... snip ...

### Create a migration

	$ amigrate create test migration
	/project/path/migrations/pg/2018-05-24T17-00-55-821Z-test-migration.js

Since the output is the generated filename, you can edit immediately with, e.g.,

	$ vim `amigrate create another test migration`

This is a file that exports `{ up, down }` methods that are passed an instance of `pg.Client` and are expected to either perform their duty synchronously or return a `Promise`. Usage of the callback-style API is not supported.

You can change how these newly-created migrations look by creating & editing `/project/path/migrations/pg/template.js`

### Run a migration

Single target:

	$ amigrate up /project/path/migrations/pg/2018-05-24T17-00-55-821Z-test-migration.js

All unapplied:

	$ amigrate up

### Roll back a migration

Single target only:

	$ amigrate down /project/path/migrations/pg/2018-05-24T17-00-55-821Z-test-migration.js
