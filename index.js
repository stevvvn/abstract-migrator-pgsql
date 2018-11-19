'use strict';
const { Client } = require('pg');

module.exports = (conf) => {
	const dbh = new Client(conf.get('pgsql'));
	return dbh.connect()
		.then(() => new PgMigrator(dbh, conf))
		.then((dbh) => dbh.install());
};

class PgMigrator {
	constructor(dbh, { prefix }) {
		this.dbh = dbh;
		this.prefix = prefix ? `${ prefix }_` : '';
	}

	get handle() {
		return this.dbh;
	}

	// check for & maybe create log table
	async install() {
		// check for log table
		const { rows } = await this.dbh.query(`SELECT EXISTS(
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = current_schema() AND table_name = $1
		)`, [ `${ this.prefix }migrations` ])
		if (!rows[0].exists) {
			await this.dbh.query(`CREATE TABLE ${ this.prefix }migrations (
				id serial NOT NULL PRIMARY KEY,
				name text NOT NULL UNIQUE,
				ran timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`);
		}
		await this.dbh.query('BEGIN');
		return this;
	}

	// return whether we believe a migration was already applied
	async applied(name) {
		const { rows } = await this.dbh.query(`SELECT COUNT(*) AS count FROM ${ this.prefix }migrations WHERE name = $1`, [ name ]);
		return rows[0].count != 0;
	}

	// mark applied
	record(name) {
		return this.dbh.query(`INSERT INTO ${ this.prefix }migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [ name ]);
	}

	// clear applied mark
	remove(name) {
		return this.dbh.query(`DELETE FROM ${ this.prefix }migrations WHERE name = $1`, [ name ]);
	}

	commit() {
		return this.dbh.query('COMMIT');
	}

	rollback() {
		return this.dbh.query('ROLLBACK');
	}

	close() {
		return this.dbh.end();
	}
};
