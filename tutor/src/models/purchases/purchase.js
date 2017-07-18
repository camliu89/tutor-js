import { find } from 'lodash';
import moment from 'moment';
import {
  BaseModel, identifiedBy, field, identifier, belongsTo, computed, observable,
} from '../base';

import { TimeStore } from '../../flux/time';
@identifiedBy('purchase/product')
class Product extends BaseModel {
  @identifier uuid;
  @field name;
  @field price;
}

@identifiedBy('purchase')
export default class Purchase extends BaseModel {

  static URL = observable.shallowBox('');;

  @identifier identifier;
  @field product_instance_uuid;
  @field is_refunded;
  @field sales_tax;
  @field total;
  @field({ type: 'date' }) updated_at;
  @field({ type: 'date' }) purchased_at;
  @belongsTo({ model: Product }) product;

  @computed get isRefundable() {
    return moment(this.purchased_at).add(14, 'days').isAfter(TimeStore.getNow());
  }

  @computed get invoiceURL() {
    return Purchase.URL.get() + '/invoice/' + this.identifier;
  }

  refund() {
    return { item_uuid: this.product_instance_uuid };
  }

  onRefunded(resp) {
    debugger
  }

}
