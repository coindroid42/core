"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Абстрактный класс Payment адаптера. Используется для создания новых адаптеров платежных систем.
 */
class PaymentAdapter {
    constructor(InitPaymentAdapter) {
        this.InitPaymentAdapter = InitPaymentAdapter;
        sails.models.paymentmethod.alive(this.InitPaymentAdapter);
    }
    /**
     * Метод для создания и получения уже существующего Payment адаптера
     * @param params - параметры для инициализации
     */
    static getInstance(...params) { return PaymentAdapter.prototype; }
    ;
}
exports.default = PaymentAdapter;
