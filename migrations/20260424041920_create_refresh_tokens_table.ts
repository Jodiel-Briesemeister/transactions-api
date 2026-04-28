import type { Knex } from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.string('token_hash').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('refresh_tokens');
}
