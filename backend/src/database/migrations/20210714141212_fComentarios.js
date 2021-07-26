exports.up = (knex) => {
    return knex.schema.createTable( 'fComentarios', ( table ) => {
        table.increments();
        table.integer('ID_caminhao').notNullable();
        table.string('Usuario').notNullable();
        table.string('Comentario').notNullable();
        table.integer('Data').notNullable();
        table.string('Tipo').notNullable();
    });
};

exports.down = (knex) => {
    return knex.schema.dropTable('fComentarios');
};