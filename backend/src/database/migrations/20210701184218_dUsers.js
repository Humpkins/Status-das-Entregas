
exports.up = (knex) => {
    return knex.schema.createTable( 'dUsers', ( table ) => {
        table.increments('ID').primary();
        table.string('Nome').notNullable();
        table.string('Email').notNullable();
        table.boolean('Agente').notNullable();
        table.string('Senha').notNullable();
        table.string('Role');
        table.string('token');
        table.integer('Unidade');

    }).then(
        () => knex('dUsers').insert([{
                ID: 1,
                Nome: 'Mateus Pereira Lourenço',
                Email: 'mateus.lourenco@gerdau.com.br',
                Agente: 1,
                Role: 'Admin',
                Senha: '$2b$10$nIyUGK4a12FjZorUBVARkenxL.uvw0KEPPSd1d7aL6XvhLoGP24bO',
                Unidade: 2412,
            },
            {
                ID: 2,
                Nome: 'Ismael Rodrigues De Oliveira Junior',
                Email: 'ismael.oliveira@gerdau.com.br',
                Agente: 1,
                Role: 'Admin',
                Senha: '$2b$10$813iQbnyDsGRnk6x9wshoOXUwUQuT9ik.HcsLU.Q.Xniz9r9HSpEi',
                Unidade: 2412,
            },
            {
                ID: 3,
                Nome: 'Portaria',
                Email: 'portaria@email.com',
                Agente: 1,
                Role: 'Portaria',
                // portaria123
                Senha: '$2b$10$N/C9ToopzFhYMpDJ33rkle908OKwbLDP6ApTKt.mijPXs/CztCNdO',
                Unidade: 2412,
            },
            {
                ID: 4,
                Nome: 'Expedição',
                Email: 'expedicao@email.com',
                Agente: 1,
                Role: 'Expedicao',
                // expedicao123
                Senha: '$2b$10$.Ye3upTH7xSG1lNtQfzBcen2uvbXa//twCo8AomMkAt/WiMB0emxK',
                Unidade: 2412,
            },
            {
                ID: 5,
                Nome: 'Visitante',
                Email: 'visitante@email.com',
                Agente: 1,
                Role: 'Visitante',
                // visitante123
                Senha: '$2b$10$uWd5zSM38aCyFb/9pQrdwu1eNmsLEGv3hPvXZ5G6J6AzsPgFmzD9q',
                Unidade: 2412,
            }])
    );
};

exports.down = (knex) => {
    return knex.schema.dropTable('dUsers');
};
