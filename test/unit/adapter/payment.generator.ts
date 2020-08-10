import Payment from "../../../modelsHelp/Payment"
const uuid = require('uuid/v4');
export default function generate_payment(): Payment{
  return {
    total: Math.floor(Math.random() * 9999) + 1000,
    id: uuid(),
    isCorePayment: true,
    originModel: "Cart",
    data: "testing",
    comment: "testing"
  }
}