
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

See the [abstract-migrator docs](https://bitbucket.org/snyder13/abstract-migrator) for CLI usage.
