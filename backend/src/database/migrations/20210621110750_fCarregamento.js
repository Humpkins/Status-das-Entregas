  
  exports.up = (knex) => {
    return knex.schema.createTable('fCarregamento', (table) => {
      table.integer('ID').primary();
      table.string('Status').notNullable();
      table.integer('Unidade').notNullable();

      table.string('Placa').notNullable();
      table.integer('Prioridade').notNullable();

      table.integer('Dia').notNullable();
      table.integer('Chegada');
      table.integer('Saida');
      table.float('Peso_chegada');
      table.float('Peso_saida');
      table.string('Comentario');
      table.integer('Atualizado');
      table.string('Atualizado_por');
      table.string('Assinaturas');
    });
  };
  
  exports.down = (knex) => {
    return knex.schema.dropTable('fCarregamento');
  };