exports.up = (knex) => {

    return knex.schema.createTable( 'dUnidades', ( table ) => {
        table.integer('Unidade').primary();
        table.string('Unidade_Abrev').notNullable();
        table.string('Endereco').notNullable();

    }).then( () => (
        knex('dUnidades').insert([
            {
                Unidade: 2401,
                Endereco: "Rua 01, s/no – Quadra 11  Pólo Empresarial de Goiás",
                Unidade_Abrev: "GOI"
            },
            {
                Unidade: 2402,
                Endereco: "Rua Almirante Tamandaré, 523",
                Unidade_Abrev: "UFA"
            },
            {
                Unidade: 2403,
                Endereco: "Av. Rio Jordão, s/n /Lote 227,",
                Unidade_Abrev: "NAT"
            },
            {
                Unidade: 2404,
                Endereco: "VP 2 s/n Setor A Quadra 4 Área de Carga",
                Unidade_Abrev: "BEL"
            },
            {
                Unidade: 2405,
                Endereco: "Rua Dr. José Américo Cançado Bahia, 1050",
                Unidade_Abrev: "CT1"
            },
            {
                Unidade: 2406,
                Endereco: "Rodovia BR-101 Norte, Km 24,9 Cruz de Rebouças",
                Unidade_Abrev: "IGA"
            },
            {
                Unidade: 2408,
                Endereco: "RUA IRINEU JOSÉ BORDON, 754",
                Unidade_Abrev: "PIR"
            },
            {
                Unidade: 2409,
                Endereco: "Rod. PR 423 Km 24,5 s/n",
                Unidade_Abrev: "UAR"
            },
            {
                Unidade: 2410,
                Endereco: "Trecho 01, Conjunto 11, Lote 02 - Pólo de Desenvolvimento Econômica Juscelino Kubitscheck",
                Unidade_Abrev: "BRA"
            },
            {
                Unidade: 2412,
                Endereco: "Gerdau - Rua Governador Miguel - Ponte dos Carvalhos, Cabo de Santo Agostinho - PE",
                Unidade_Abrev: "SPE"
            },
            {
                Unidade: 2413,
                Endereco: "Av. General Motors, 1877 - Bairro do Taboão",
                Unidade_Abrev: "MGC"
            },
            {
                Unidade: 2414,
                Endereco: "Estrada do Pedregoso, nº 900 – Galpão 1 / Campo Grande",
                Unidade_Abrev: "CGD"
            },
            {
                Unidade: 2415,
                Endereco: "BR-324, KM16, Centro Indus. de Aratu",
                Unidade_Abrev: "USB"
            },
            {
                Unidade: 2416,
                Endereco: "Av. Parque Oeste, 1400",
                Unidade_Abrev: "SC1"
            },
            {
                Unidade: 2417,
                Endereco: "Rod. Gov. Mario Covas, Km 166, Sul do Rio, Centro",
                Unidade_Abrev: "TIJ"
            },
            {
                Unidade: 2418,
                Endereco: "ROD BR101, KM123",
                Unidade_Abrev: "SJM"
            },
            {
                Unidade: 2450,
                Endereco: "Rua Caminho do Guaramar, 399, Vila Antártica",
                Unidade_Abrev: "SAN"
            },
            {
                Unidade: 2451,
                Endereco: "Rua Caravelas, 351, Jardim Vale do Sol",
                Unidade_Abrev: "SJC"
            },
            {
                Unidade: 2452,
                Endereco: "Av. Prosperidade, 250 e 300 -  Prosperidade",
                Unidade_Abrev: "SCS"
            },
            {
                Unidade: 2453,
                Endereco: "Av. José Fortunato Molina, 3-73",
                Unidade_Abrev: "BAU"
            },
            {
                Unidade: 2454,
                Endereco: "Av. Costa e Silva, 1056",
                Unidade_Abrev: "CGR"
            },
            {
                Unidade: 2455,
                Endereco: "Rua SR 5, Quadra 112 Sul, Lotes 38, 40 e 42",
                Unidade_Abrev: "PAL"
            },
            {
                Unidade: 2456,
                Endereco: "Av. Fernando Correia da Costa, 6235",
                Unidade_Abrev: "CBA"
            },
            {
                Unidade: 2457,
                Endereco: "Av. Durval de Góes Monteiro, 9757",
                Unidade_Abrev: "MAC"
            },
            {
                Unidade: 2458,
                Endereco: "Rua Caraguatatuba nº 3.530",
                Unidade_Abrev: "RPO"
            },
            {
                Unidade: 2459,
                Endereco: "Rod BR 230, km 12, Nº 319",
                Unidade_Abrev: "JPA"
            },
            {
                Unidade: 2460,
                Endereco: "Av. Prefeito Wall Ferraz, Nº 13129",
                Unidade_Abrev: "THE"
            },
            {
                Unidade: 2461,
                Endereco: "ROD BR 452, km 140,6 S/N",
                Unidade_Abrev: "UBL"
            },
            {
                Unidade: 2462,
                Endereco: "Av. Barão do Rio Branco, 985",
                Unidade_Abrev: "CVL"
            },
            {
                Unidade: 2463,
                Endereco: "Avenida Juscelino Kubitschek, 921",
                Unidade_Abrev: "JFA"
            },
            {
                Unidade: 2464,
                Endereco: "Rodovia Br 364 Km 04 S/N",
                Unidade_Abrev: "PVH"
            },
            {
                Unidade: 2466,
                Endereco: "Acesso Plinio Arlindo de Nes, 6401 D - Bairro Trevo",
                Unidade_Abrev: "XAP"
            },
            {
                Unidade: 2467,
                Endereco: "Av. Brasília, 3057",
                Unidade_Abrev: "LON"
            },
            {
                Unidade: 2468,
                Endereco: "Av. Presidente Tancredo Neves, 6055",
                Unidade_Abrev: "AJU"
            },
            {
                Unidade: 2469,
                Endereco: "Av. Talma Rodrigues Ribeiro, s/n",
                Unidade_Abrev: "VIT"
            },
            {
                Unidade: 2470,
                Endereco: "Av. Juraci Magalhães, 2007",
                Unidade_Abrev: "VDC"
            },
            {
                Unidade: 2471,
                Endereco: "Anel Viário Pref. Sincler Sambatti, 386",
                Unidade_Abrev: "MAR"
            },
            {
                Unidade: 2472,
                Endereco: "Av. Guajajaras, 300A",
                Unidade_Abrev: "JFA"
            },
            {
                Unidade: 2473,
                Endereco: "Rua Barão de São Gonçalo, 196",
                Unidade_Abrev: "SGL"
            }
        ])
    ));
};

exports.down = (knex) => {
    return knex.schema.dropTable('dUnidades');
};