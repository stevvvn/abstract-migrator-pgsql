'use strict';
module.exports = {
	'up': (dbh) => dbh.query('CREATE TABLE asdf(id int)'),
	'down': (dbh) => dbh.query('DROP TABLE asdf')
};
