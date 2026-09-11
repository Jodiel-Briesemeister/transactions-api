import type { Knex } from 'knex';

// Defense in depth behind the application-level lock. The debit paths read the account with
// SELECT ... FOR UPDATE before checking the balance, but nothing stops a future code path from
// forgetting to. This turns that mistake from silent corruption into a failed transaction.

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.check('balance >= 0', [], 'chk_accounts_balance_non_negative');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.dropChecks(['chk_accounts_balance_non_negative']);
  });
}
