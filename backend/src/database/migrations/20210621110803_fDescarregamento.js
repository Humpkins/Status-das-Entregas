
  exports.up = function(knex) {
    return knex.schema.createTable('fDescarregamento', (table) => {

      table.integer('ID').primary();
      table.string('Status').notNullable();
      table.integer('Unidade').notNullable();
      table.string('Placa').notNullable();
      table.integer('Dia').notNullable();
      table.integer('Chegada');
      table.integer('Saida');
      table.float('Peso_chegada');
      table.float('Peso_saida');
      table.string('Comentario');
      table.integer('Atualizado');

      table.string('Transportadora').notNullable();
      table.string('Modal').notNullable();
      table.integer('Nome').notNullable();
      table.string('Materiais').notNullable();
      table.string('Atualizado_por');
      table.string('Assinaturas');

      table.integer('Atualizado_sys').notNullable();
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.dropTable('fDescarregamento');
  };