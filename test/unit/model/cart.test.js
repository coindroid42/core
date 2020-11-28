"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ExternalTestPaymentSystem_1 = require("../external_payments/ExternalTestPaymentSystem");
const getEmitter_1 = require("../../../lib/getEmitter");
describe('Cart', function () {
    this.timeout(10000);
    let cart;
    let dishes;
    let fullCart;
    // describe('New Example', function (){
    //   it('new it', function(){
    //     return true;
    //   });
    // });
    it('get dishes', async function () {
        dishes = await Dish.find({});
    });
    it('create Сart', async function () {
        cart = await Cart.create({});
        chai_1.expect(cart).to.be.an('object');
    });
    it('addDish', async function () {
        cart = await Cart.create({});
        await cart.addDish(dishes[0], 1, [], '', 'test');
        await cart.addDish(dishes[1], 5, [], 'test comment', 'test');
        let result = await Cart.findOne(cart.id).populate('dishes');
        chai_1.expect(result.dishes.length).to.equal(2);
        let cartDish = await CartDish.find({ cart: cart.id, dish: dishes[0].id }).sort('createdAt ASC');
        chai_1.expect(cartDish[0].amount).to.equal(1);
        chai_1.expect(cartDish[0].comment).to.equal('');
        chai_1.expect(cartDish[0].addedBy).to.equal('test');
        cartDish = await CartDish.find({ cart: cart.id, dish: dishes[1].id }).sort('createdAt ASC');
        chai_1.expect(cartDish[0].amount).to.equal(5);
        chai_1.expect(cartDish[0].comment).to.equal('test comment');
        chai_1.expect(cartDish[0].addedBy).to.equal('test');
    });
    it('removeDish', async function () {
        let dish = (await Cart.findOne(cart.id).populate('dishes')).dishes[1];
        dish = await CartDish.findOne(dish.id);
        await cart.removeDish(dish, 1, false);
        let changedDish = await CartDish.findOne(dish.id);
        chai_1.expect(changedDish.amount).to.equal(dish.amount - 1);
    });
    it('setCount', async function () {
        let dish = (await Cart.findOne({ id: cart.id }).populate('dishes')).dishes[0];
        dish = await CartDish.findOne(dish.id);
        await cart.setCount(dish, 10);
        let changedDish = await CartDish.findOne({ id: dish.id });
        chai_1.expect(changedDish.amount).to.equal(10);
    });
    it('setModifierCount?', async function () {
        //TODO do nothing
    });
    it('setComment', async function () {
        let dish = (await Cart.findOne({ id: cart.id }).populate('dishes')).dishes[0];
        dish = await CartDish.findOne({ id: dish.id });
        let testComment = 'this is a test comment';
        await cart.setComment(dish, testComment);
        let changedDish = await CartDish.findOne({ id: dish.id });
        chai_1.expect(changedDish.comment).to.equal(testComment);
    });
    it('returnFullCart', async function () {
        cart = await Cart.create({});
        await cart.addDish(dishes[0], 5, [], '', '');
        await cart.addDish(dishes[1], 3, [], '', '');
        await cart.addDish(dishes[2], 8, [], '', '');
        let res = await Cart.returnFullCart(cart);
        chai_1.expect(res).to.be.an('object');
    });
    it('addDish 20', async function () {
        cart = await Cart.create({});
        for (let i = 0; i < 20; i++) {
            await cart.addDish(dishes[i], 3, [], '', '');
        }
    });
    it('addDish 21th', async function () {
        await cart.addDish(dishes[21], 3, [], '', '');
    });
    it('setSelfService', async function () {
        let cart = await Cart.create({});
        await cart.addDish(dishes[0], 5, [], '', '');
        await cart.addDish(dishes[1], 3, [], '', '');
        await cart.addDish(dishes[2], 8, [], '', '');
        await cart.setSelfService(true);
        let changedCart = await Cart.findOne(cart.id);
        chai_1.expect(changedCart.selfService).to.equal(true);
        await cart.setSelfService(false);
        changedCart = await Cart.findOne(cart.id);
        chai_1.expect(changedCart.selfService).to.equal(false);
    });
    // it('emit test', async function(){
    // });
    it('countCart', async function () {
        let cart = await Cart.create({});
        let totalWeight = 0;
        await cart.addDish(dishes[0], 5, [], '', '');
        await cart.addDish(dishes[1], 3, [], '', '');
        await cart.addDish(dishes[2], 8, [], '', '');
        totalWeight = dishes[0].weight * 5 + dishes[1].weight * 3 + dishes[2].weight * 8;
        cart = await Cart.findOne(cart.id);
        await Cart.countCart(cart);
        let changedCart = await Cart.findOne(cart.id);
        chai_1.expect(changedCart.totalWeight).to.equal(totalWeight);
        chai_1.expect(changedCart.uniqueDishes).to.equal(3);
        chai_1.expect(changedCart.dishesCount).to.equal(5 + 3 + 8);
    });
    it('order', async function () {
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        getEmitter_1.default().on('core-cart-before-order', function () {
            count1++;
        });
        getEmitter_1.default().on('core-cart-order-self-service', function () {
            count2++;
        });
        getEmitter_1.default().on('core-cart-order', function () {
            count3++;
        });
        // getEmitter().on('core-cart-after-order', function(){
        //   count4++;
        // });
        await cart.setSelfService(true);
        await cart.order();
        chai_1.expect(count1).to.equal(1);
        chai_1.expect(count2).to.equal(1);
        chai_1.expect(count3).to.equal(1);
        // expect(count4).to.equal(1);
        let error = null;
        try {
            await cart.order();
        }
        catch (e) {
            error = e;
        }
        chai_1.expect(error).to.not.equal(null);
        getEmitter_1.default().on('core-cart-order-delivery', function () {
            // count1++;
        });
    });
    it('payment', async function () {
        let cart = await Cart.create({});
        await cart.next('ORDER');
        let error = null;
        try {
            await cart.payment();
        }
        catch (e) {
            error = e;
        }
        chai_1.expect(error).to.not.equal(null);
        let testPaymentSystem = await ExternalTestPaymentSystem_1.default.getInstance();
        let paymentSystem = (await PaymentMethod.find())[0];
        cart.paymentMethod = paymentSystem.id;
        await cart.next('CHECKOUT');
        let result = await cart.payment();
        // expect(result).to.be.an('object');
        let state = await cart.getState();
        chai_1.expect(state).to.equal('PAYMENT');
    });
    it('paymentMethodId', async function () {
        let cart = await Cart.create({});
        let testPaymentSystem = await ExternalTestPaymentSystem_1.default.getInstance();
        let paymentSystem = (await PaymentMethod.find())[0];
        cart.paymentMethod = paymentSystem.id;
        await cart.save();
        let result = await cart.paymentMethodId();
        chai_1.expect(result).to.equal(paymentSystem.id);
    });
    it('doPaid TODO', async function () {
    });
});
/**
 * create and return new Cart with few dishes
 * @param dishes - array of dishes
 */
async function getNewCart(dishes) {
    let cart = await Cart.create({});
    await cart.addDish(dishes[0], 5, [], '', '');
    await cart.addDish(dishes[1], 3, [], '', '');
    await cart.addDish(dishes[2], 8, [], '', '');
    cart = await Cart.findOne(cart.id);
    return cart;
}
