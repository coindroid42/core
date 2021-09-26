import { expect } from "chai";
import getEmitter from "../../../libs/getEmitter";
import TestPaymentSystem from "../../unit/external_payments/ExternalTestPaymentSystem";

import Cart from "../../../models/Cart";
import Address from "../../../interfaces/Address";
import Customer from "../../../interfaces/Customer";
import Settings from "../../../models/Settings";

describe("Flows: Checkout", function () {
  this.timeout(10000);
  var cart: Cart;

  let customer: Customer = {
    phone: "+79998881212",
    name: "Freeman Morgan",
  };
  let address: Address = {
    streetId: "sdfsf",
    city: "New York",
    street: "Green Road",
    home: "42",
    comment: "",
  };

  it("Create new cart", async function () {
    cart = await Cart.create({}).fetch();
    if (!cart) throw "Cart not created";
  });

  it("Check paymentSystem", async function () {
    // let cust
    // getEmitter().on('core-cart-before-check', (cart, customer2, isSelfService, address)=>{
    //   cust = customer2;
    // });

    // expect(cust).to.equal(customer);

    try {
      let paymentSystem = (await PaymentMethod.find().limit(1))[0];
      let result = await Cart.check(cart.id, customer, false, address, paymentSystem.id);
      await Cart.check(cart.id, null, null, null, paymentSystem.id);

      try {
        await Cart.check(cart.id, null, null, null, "bad-id-payment-system");
      } catch (e) {
        expect(e.code).to.equal(8);
        expect(e.error).to.be.an("string");
      }
    } catch (error) {
      throw error;
    }
  });

  it("awaitEmiter cart events", async function () {
    await Settings.set("check", { notRequired: true });

    let core_cart_before_check = 0;
    let core_cart_check_delivery = 0;
    let core_cart_check = 0;
    let core_cart_after_check = 0;

    getEmitter().on("core-cart-before-check", function () {
      core_cart_before_check = 1;
    });

    getEmitter().on("core-cart-check-delivery", function () {
      core_cart_check_delivery = 1;
    });

    getEmitter().on("core-cart-check", function () {
      core_cart_check = 1;
    });

    getEmitter().on("core-cart-after-check", function () {
      core_cart_after_check = 1;
    });

    try {
      await Cart.check(cart.id, customer);
    } catch (e) {
      console.error(e);
    }

    expect(core_cart_before_check).to.equal(1);
    expect(core_cart_check_delivery).to.equal(1);
    expect(core_cart_check).to.equal(1);
    expect(core_cart_after_check).to.equal(1);

    let core_cart_is_self_service = 0;
    let emitCustomer;
    let emitSelfService;
    let emitAddress;

    getEmitter().on("core-cart-is-self-service", function (self, cust, serv, addr) {
      core_cart_is_self_service = 1;
      emitCustomer = cust;
      emitSelfService = serv;
      emitAddress = addr;
    });
    try {
      await Cart.check(cart.id, customer, true, address);
    } catch (e) {
      console.error(e);
    }

    expect(core_cart_is_self_service).to.equal(1);
    expect(emitCustomer).to.equal(customer);
    expect(emitSelfService).to.equal(true);
    expect(emitAddress).to.equal(address);
  });

  it("throw if cart is Paid (next Only ORDER)", async function () {
    await Cart.update(cart.id, { state: "PAYMENT", paid: true }).fetch();
    try {
      await Cart.check(cart.id, customer);
    } catch (e) {
      expect(e).to.not.equal(null);
    }
  });

  it("throw if state ORDER", async function () {
    await Cart.next(cart.id, "ORDER");
    try {
      await Cart.check(cart.id, customer);
    } catch (e) {
      expect(e).to.not.equal(null);
    }
  });

  it("test checkConfig (default - requireAll)", async function () {
    await Settings.set("check", null);

    cart = await Cart.create({}).fetch();

    getEmitter().on("core-cart-check", "ccc", function () {
      throw "test";
    });

    // for selfServices
    try {
      await Cart.check(cart.id, customer, true);
    } catch (e) {
      expect(e.code).to.equal(10);
    }

    // just user with address
    try {
      await Cart.check(cart.id, customer, false, address);
    } catch (e) {
      expect(e.code).to.equal(10);
    }
  });

  it("test checkConfig (notRequired)", async function () {
    await Settings.set("check", { notRequired: true });
    cart = await Cart.create({}).fetch();

    // for selfServices
    try {
      await Cart.check(cart.id, customer, true);
    } catch (e) {
      expect(e).to.equal(null);
    }

    // just user with address
    try {
      await Cart.check(cart.id, customer, false, address);
    } catch (e) {
      expect(e).to.equal(null);
    }
  });

  describe("check Customer", function () {
    // let cart: Cart;
    // it('init', async function(){
    //     cart = await Cart.create({});
    // });

    it("good customer", async function () {
      cart = await Cart.create({}).fetch();

      let customer: Customer = {
        phone: "+79998881212",
        name: "Freeman Morgan",
      };

      try {
        await Cart.check(cart.id, customer, true);
      } catch (e) {
        expect(e).to.equal(null);
      }
    });

    it("bad customer", async function () {
      // @ts-ignore
      let badCustomer: Customer = {
        name: "Bad Man",
      };

      let error = null;
      try {
        await Cart.check(cart.id, badCustomer);
      } catch (e) {
        error = e;
      }
      // expect(error).to.be.an('object');
      expect(error.code).to.equal(2);
      expect(error.error).to.be.an("string");

      // @ts-ignore
      badCustomer = {
        phone: "+79998882244",
      };
      error = null;
      try {
        await Cart.check(cart.id, badCustomer);
      } catch (e) {
        error = e;
      }
      expect(error.code).to.equal(1);
      expect(error.error).to.be.an("string");
    });

    it("no customer throw", async function () {
      cart.customer = null;
      await Cart.update({ id: cart.id }, cart).fetch();
      let error = null;
      try {
        await Cart.check({ id: cart.id });
      } catch (e) {
        error = e;
      }

      expect(error.code).to.equal(2);
      expect(error.error).to.be.an("string");
    });
  });

  describe("check Address", function () {
    it("good address", async function () {
      cart = await Cart.create({}).fetch();
      let address: Address = {
        streetId: "1234abcd",
        city: "New York",
        street: "Green Road",
        home: "42",
        comment: "test",
      };

      try {
        await Cart.check(cart.id, customer, null, address);
      } catch (e) {
        expect(e).to.equal(null);
      }
    });

    it("bad address", async function () {
      // @ts-ignore
      let badAddress: Address = {
        city: "New York",
        // street: 'Green Road',
        home: "42",
        comment: "test",
      };

      try {
        await Cart.check(cart.id, null, null, badAddress);
      } catch (e) {
        expect(e.code).to.equal(5);
        expect(e.error).to.be.an("string");
      }
    });

    it("no address throw", async function () {
      cart.customer = null;
      await Cart.update({ id: cart.id }, cart).fetch();
      try {
        await Cart.check(cart.id, null, true);
      } catch (e) {
        expect(e.code).to.equal(2);
        expect(e.error).to.be.an("string");
      }
    });
  });

  describe("To payment", function () {
    it("HERE NEED TEST ALL PAYMENT", async function () {

    });
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
