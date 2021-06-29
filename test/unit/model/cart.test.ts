import { expect } from "chai";
import Address from "../../../modelsHelp/Address";
import { name } from "faker";
import Cart from "../../../models/Cart";
import Dish from "../../../models/Dish";
import Customer from "../../../modelsHelp/Customer";
import generate_payment from '../../generators/payment.generator';
import { Payment } from "../../../modelsHelp/Payment";
import TestPaymentSystem from '../external_payments/ExternalTestPaymentSystem';
import getEmitter from "../../../lib/getEmitter";
import PaymentDocument from "../../../models/PaymentDocument";

describe('Cart',function () {
  this.timeout(10000);
  let cart: Cart;
  let dishes: Dish[];
  let fullCart: Cart;
  
  // describe('New Example', function (){
  //   it('new it', function(){
  //     return true;
  //   });
  // });
  
  it('get dishes', async function(){
    dishes = await Dish.find({});
  });

  it('create Сart', async function (){
    cart = await Cart.create({});
    expect(cart).to.be.an('object');
  });

  it('check model fields', async function(){
    expect(cart).to.include.all.keys(
      'id', 
      'cartId',
      'shortId',
      'dishes',
      'discount',
      'paymentMethod',
      'paymentMethodTitle',
      'paid',
      'isPaymentPromise',
      'dishesCount',
      'uniqueDishes',
      'modifiers', 
      'customer',
      'address',
      'comment',
      'personsCount',      
      'date',
      'problem',
      'rmsDelivered',
      'rmsId',
      'rmsOrderNumber',
      'rmsOrderData',
      'rmsDeliveryDate',
      'rmsErrorMessage',
      'rmsErrorCode',
      'rmsStatusCode',
      'deliveryStatus',
      'selfService',
      'deliveryDescription',
      'message',
      'deliveryItem',
      'deliveryCost', 
      'totalWeight',
      'total', 
      'orderTotal',
      'cartTotal',
      'discountTotal',
      'orderDate'
    )
  });
  
  it('addDish', async function(){  
    cart = await Cart.create({});   
    await cart.addDish(dishes[0], 1, [], '', 'test');
    await cart.addDish(dishes[1], 5, [], 'test comment','test');
    let result = await Cart.findOne(cart.id).populate('dishes');
    
    expect(result.dishes.length).to.equal(2);

    let cartDish = await CartDish.find({cart: cart.id, dish: dishes[0].id}).sort('createdAt ASC');
    expect(cartDish[0].amount).to.equal(1);
    expect(cartDish[0].comment).to.equal('');
    expect(cartDish[0].addedBy).to.equal('test');

    cartDish = await CartDish.find({cart: cart.id, dish: dishes[1].id}).sort('createdAt ASC');
    expect(cartDish[0].amount).to.equal(5);
    expect(cartDish[0].comment).to.equal('test comment'); 
    expect(cartDish[0].addedBy).to.equal('test');
    
  });
 
  it('removeDish', async function(){   
    let dish = (await Cart.findOne(cart.id).populate('dishes')).dishes[1];
    dish = await CartDish.findOne(dish.id);
    await cart.removeDish(dish, 1, false);
    let changedDish = await CartDish.findOne(dish.id);
    
    expect(changedDish.amount).to.equal(dish.amount - 1);
  });
  
  it('addDish same dish increase amount', async function(){
    cart = await Cart.create({});   
    await cart.addDish(dishes[0], 2, [], '', 'test');
    await cart.addDish(dishes[0], 3, [], '', 'test');
    await cart.addDish(dishes[0], 1, null, '', 'test');

    let cartDishes = await CartDish.find({cart: cart.id, dish: dishes[0].id});
    // console.log('dishes > ', cartDishes);
    expect(cartDishes.length).to.equals(1);
    expect(cartDishes[0].amount).to.equals(6);

    cart = await Cart.create({});
    await cart.addDish(dishes[0], 1, [{id: dishes[1].id, modifierId: dishes[1].id}], '', 'mod');
    await cart.addDish(dishes[0], 1, null, '', 'test');
    await cart.addDish(dishes[0], 2, null, '', 'test');
    cartDishes = await CartDish.find({cart: cart.id, dish: dishes[0].id});
    // console.log(cartDishes);
    expect(cartDishes.length).to.equals(2);
    for(let dish of cartDishes){
      if(dish.modifiers.length == 1){
        expect(dish.amount).to.equals(1);
      }else{
        expect(dish.amount).to.equals(3);
      }
    }
    
    
  });

  it('setCount', async function(){
    let dish = (await Cart.findOne({id: cart.id}).populate('dishes')).dishes[0];
    dish = await CartDish.findOne(dish.id);
    await cart.setCount(dish, 10);
    let changedDish = await CartDish.findOne({id: dish.id});

    expect(changedDish.amount).to.equal(10); 
  });

  it('setModifierCount?', async function(){
    //TODO do nothing
  });

  it('setComment', async function(){
    let dish = (await Cart.findOne({id: cart.id}).populate('dishes')).dishes[0];
    dish = await CartDish.findOne({id: dish.id});
    let testComment = 'this is a test comment';   
    await cart.setComment(dish, testComment);
    let changedDish = await CartDish.findOne({id: dish.id});

    expect(changedDish.comment).to.equal(testComment);
  });


  it('addDish 20', async function(){
    cart = await Cart.create({});
    for(let i = 0; i < 20; i++){
      await cart.addDish(dishes[i], 3, [], '', '');
    }
  });

  it('addDish 21th', async function(){
    await cart.addDish(dishes[21], 3, [], '', '');
  });

  it('setSelfService', async function(){
    let cart = await Cart.create({});
    await cart.addDish(dishes[0], 5, [], '', '');
    await cart.addDish(dishes[1], 3, [], '', '');
    await cart.addDish(dishes[2], 8, [], '', '');
    await cart.setSelfService(true);
    let changedCart = await Cart.findOne(cart.id);

    expect(changedCart.selfService).to.equal(true);

    await cart.setSelfService(false);
    changedCart = await Cart.findOne(cart.id);

    expect(changedCart.selfService).to.equal(false);
  });

  it('countCart', async function(){
    let cart = await Cart.create({});
    let totalWeight = 0;
    await cart.addDish(dishes[0], 5, [], '', '');
    await cart.addDish(dishes[1], 3, [], '', '');
    await cart.addDish(dishes[2], 8, [], '', '');
    totalWeight = dishes[0].weight * 5 + dishes[1].weight * 3 + dishes[2].weight * 8;
    cart = await Cart.findOne(cart.id);
    await Cart.countCart(cart);
    let changedCart = await Cart.findOne(cart.id);

    expect(changedCart.totalWeight).to.equal(totalWeight);
    expect(changedCart.uniqueDishes).to.equal(3);
    expect(changedCart.dishesCount).to.equal(5 + 3 + 8);
  });

  it('order', async function(){
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;
    let count4 = 0;
    
    getEmitter().on('core-cart-before-order', function(){
      count1++;
    });
    getEmitter().on('core-cart-order-self-service', function(){
      count2++;
    });
    
    getEmitter().on('core-cart-order', function(){
      count3++;
    });
    // getEmitter().on('core-cart-after-order', function(){
    //   count4++;
    // });
    await cart.setSelfService(true);
    await cart.order();
    expect(count1).to.equal(1);
    expect(count2).to.equal(1);
    expect(count3).to.equal(1);
    // expect(count4).to.equal(1);

    let error = null;
    try{
      await cart.order();
    }catch(e){
      error = e;
    }
    expect(error).to.not.equal(null);
    
    getEmitter().on('core-cart-order-delivery', function(){
      // count1++;
    });
  });

  it('payment', async function(){
    let cart = await Cart.create({});
    await cart.next('ORDER');
    let error = null;
    try{
      await cart.payment();
    }catch(e){
      error = e;
    }
    expect(error).to.not.equal(null);

    let testPaymentSystem = await TestPaymentSystem.getInstance();
    let paymentSystem = (await PaymentMethod.find())[0];
    cart.paymentMethod = paymentSystem.id;

    await cart.next('CHECKOUT');
    let result = await cart.payment();
    // expect(result).to.be.an('object');

    let state = await cart.getState();
    expect(state).to.equal('PAYMENT');
  });
  it('paymentMethodId', async function(){
    let cart = await Cart.create({});
    let testPaymentSystem = await TestPaymentSystem.getInstance();
    let paymentSystem = (await PaymentMethod.find())[0];
    cart.paymentMethod = paymentSystem.id;
    await cart.save();

    let result = await cart.paymentMethodId();
    expect(result).to.equal(paymentSystem.id);
  });
  it('doPaid', async function(){
    expect(Cart.doPaid).to.not.equals(undefined);

    let cart = await Cart.create({});
    await cart.addDish(dishes[0], 5, [], '', '');
    await cart.addDish(dishes[1], 3, [], '', '');
    await cart.addDish(dishes[2], 8, [], '', '');

    const paymentMethod = (await PaymentMethod.find({}))[0];
    let newPaymentDocument = {
      paymentId: cart.id,
      externalId: 'string',
      originModel: 'string',
      paymentMethod: paymentMethod.id,
      amount: 1000,
      comment: 'string',
      redirectLink: 'string',
    }
    var paymentDocument = await PaymentDocument.create(newPaymentDocument);
    await Cart.doPaid(paymentDocument);
    cart = await Cart.findOne(cart.id);
    expect(cart.paid).to.equals(true);
    expect(cart.paymentMethod).to.equals(paymentDocument.paymentMethod);
    let paymentMethodTitle = (await PaymentMethod.findOne(paymentDocument.paymentMethod)).title;
    expect(cart.paymentMethodTitle).to.equals(paymentMethodTitle);
  });

});

/**
 * create and return new Cart with few dishes
 * @param dishes - array of dishes
 */
async function getNewCart(dishes: Dish[]): Promise<Cart>{
  let cart = await Cart.create({});
  await cart.addDish(dishes[0], 5, [], '', '');
  await cart.addDish(dishes[1], 3, [], '', '');
  await cart.addDish(dishes[2], 8, [], '', '');
  cart = await Cart.findOne(cart.id);
  return cart;
}