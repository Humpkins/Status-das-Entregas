
  exports.up = function(knex) {
    return knex.schema.createTable('fStatus', (table) => {
      table.integer('ID').notNullable();
      table.string('Status').notNullable();
      table.integer('Unidade').notNullable();
      table.string('Placa').notNullable();
      table.integer('Dia').notNullable();
      table.string('Tipo').notNullable();
      table.integer('DataHora').notNullable();
      table.string('Comentario');
      table.string('Atualizado_por');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('fStatus');
  };