export class PageData {
  hotels: {
      id: string;
      rates: {
        book_hash: string;
      }[];
  }[];
};

export class Page {
    data: PageData;
  };

export class RatesData {
    item_id: string,
    partner_order_id: string;
    payment_types: {
      amount: string;
      currency_code: string;
      is_need_credit_card_data: boolean;
      is_need_cvc: boolean;
      recommended_price?: {
        amount: string;
        currency_code: string;
        show_amount: string;
        show_currency_code: string;
      };
      type: string;
    }[];
  };

export class Rates {
    data: RatesData;
    debug: null;
    error: null;
    status: string;
  };

export class Status {
    "data": null;
    "debug": null;
    "error": null;
    "status": string
  };

export class Schema {
  result: string;
  pID: string;
  objectID: string
}
