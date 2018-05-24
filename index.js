'use strict';
const { Client } = require('pg');

module.exports = (conf) => {
	const dbh = new Client(conf.get('pg'));
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
	install() {
		// check for log table
		return this.dbh.query(`SELECT EXISTS(
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = current_schema() AND table_name = $1
		)`, [ `${ this.prefix }migrations` ])
			.then(({ rows }) => {
				if (rows[0].exists) {
					return;
				}
				return this.dbh.query(`CREATE TABLE ${ this.prefix }migrations (
					id serial NOT NULL PRIMARY KEY,
					name text NOT NULL UNIQUE,
					ran timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
				)`);
			})
			.then(() => this.dbh.query('BEGIN'))
			// resolve to this so caller can use result to do their work
			.then(() => this);
	}

	// return whether we believe a migration was already applied
	applied(name) {
		return (this.appliedMap
			? Promise.resolve()
			: this.dbh.query(`SELECT name FROM ${ this.prefix }migrations`)
				.then(({ rows }) => {
					this.appliedMap = {};
					rows.forEach(({ name }) => this.appliedMap[name] = true);
				}))
			.then(() => this.appliedMap[name] === true);
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
