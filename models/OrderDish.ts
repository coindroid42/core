import ORM from "../interfaces/ORM";
import ORMModel from "../interfaces/ORMModel";
import Dish from "../models/Dish";
import Order from "../models/Order";
import { Modifier } from "../interfaces/Modifier";

let attributes = {
  /** */
  id: {
    type: "number",
    autoIncrement: true,
  } as unknown as number,

  /** Количество данного блюда с его модификаторами в корзине */
  amount: "number" as unknown as number,

  // TODO: Это надо переписать потомучто если меняется блюдо то меняется уже проданная корзина. Здесь надо хранить запеченное блюдо.
  // Есть идея что нужно отдельно запекать заказы.

  /**Блюдо, которое содержится в корзине */
  dish: {
    model: "Dish",
  } as unknown as Dish | any,

  /** Модификаторы для текущего блюда */
  modifiers: "json" as unknown as Modifier[],

  /** */
  order: {
    model: "Order",
  } as unknown as Order | any,

  /** Количество уникальных блюд в корзине */
  uniqueItems: "number" as unknown as number,

  /** цена позиции */
  itemTotal: "number" as unknown as number,

  /** цена позиции до применения скидок */
  itemTotalBeforeDiscount: "number",

  /** Скидка */
  discount: "json" as unknown as any,

  /**Общая сумма скидки */
  discountTotal: "number" as unknown as number,

  /** Тип скидки */
  discountType: 'string',

  /** Сообщение скидки */
  discountMessage: "string",

  /** Сумма скидки */
  discountAmount: "number",

  /** Коментарий к корзине */
  comment: "string" as unknown as number,

  /** Метка кто добавил */
  addedBy: {
    type: "string",
    defaultsTo: "user",
  } as unknown as string,

  /** Вес */
  weight: "number" as unknown as number,

  /** Полный вес */
  totalWeight: "number" as unknown as number,
};

type attributes = typeof attributes;
interface OrderDish extends attributes, ORM {}
export default OrderDish;

let Model = {};

module.exports = {
  primaryKey: "id",
  attributes: attributes,
  ...Model,
};

declare global {
  const OrderDish: typeof Model & ORMModel<OrderDish>;
}
