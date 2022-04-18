import { Model } from '@vuex-orm/core';
import { uuidv4 } from '@/utils/helpers';

export default class BankAccount extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'bank_accounts';

  static fields() {
    return {
      id: this.attr(() => uuidv4()),
      bank_name: this.attr(''),
      bank_account_no: this.attr(''),
      bank_ifsc_code: this.attr(''),
      bank_description: this.attr(''),
      updated_at: this.attr(''),
      created_at: this.attr(''),
    };
  }
}
