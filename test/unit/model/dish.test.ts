import  groupGenerator   from "../../generators/dish.generator";
import { expect } from "chai";

const dishExample = {
    "images": [
      {
        "id": "9e283567-3e6e-4da9-8944-0b91ec6fb646",
        "images": {
          "origin": "/images/72fe193c-ed34-4ee2-89e1-f22cb7f99e0d.png",
          "small": "/images/27ed4b5b-7161-4d88-bf76-fae8023aff9f.png",
          "large": "/images/9399fd28-e03a-4f86-8078-a37c67d08c94.png"
        },
        "uploadDate": "2020-10-13 16:23:20",
        "createdAt": "2020-10-16T02:11:45.000Z",
        "updatedAt": "2020-10-16T02:11:45.000Z",
        "group": null
      }
    ],
    "parentGroup": {
      "id": "582fc73f-ebb7-4153-8923-d1fd4a772e96",
      "additionalInfo": null,
      "code": null,
      "description": null,
      "isDeleted": false,
      "name": "Пицца",
      "seoDescription": null,
      "seoKeywords": null,
      "seoText": null,
      "seoTitle": null,
      "tags": [],
      "isIncludedInMenu": true,
      "order": 3,
      "dishesTags": null,
      "slug": "picca",
      "visible": null,
      "modifier": null,
      "promo": null,
      "workTime": null,
      "createdAt": "2020-10-16T02:11:44.000Z",
      "updatedAt": "2020-10-16T02:11:44.000Z",
      "parentGroup": null
    },
    "id": "9995136e-f5c9-5d09-92ce-f65a0554342d",
    "rmsId": "38dee846-ee54-418c-ab4e-1bc1e8b3ae6d",
    "additionalInfo": null,
    "code": "00465",
    "description": "880гр  32см  ветчина, томаты, маслины, маринованные огурчики, томатный соус, сыр моцарелла",
    "name": "Европейская",
    "seoDescription": null,
    "seoKeywords": null,
    "seoText": null,
    "seoTitle": null,
    "carbohydrateAmount": 0,
    "carbohydrateFullAmount": 0,
    "differentPricesOn": [],
    "doNotPrintInCheque": false,
    "energyAmount": 0,
    "energyFullAmount": 0,
    "fatAmount": 0,
    "fatFullAmount": 0,
    "fiberAmount": 0,
    "fiberFullAmount": 0,
    "groupId": null,
    "groupModifiers": [],
    "measureUnit": "порц",
    "price": 749,
    "productCategoryId": "1483c868-aaf7-6a9b-0165-a31381241120",
    "prohibitedToSaleOn": [],
    "type": "dish",
    "useBalanceForSell": false,
    "weight": 0.92,
    "isIncludedInMenu": true,
    "order": 10,
    "isDeleted": false,
    "modifiers": [],
    "tags": [],
    "balance": -1,
    "slug": "evropejskaya",
    "hash": -374730368,
    "composition": null,
    "visible": null,
    "modifier": null,
    "promo": null,
    "workTime": null
} 

describe('Dish', function () {
  it('Test DishGenerator', async () => {
    for (let index = 0; index < 3; index++) {
      try {
        var result =  groupGenerator({name: "test"});
      } catch (error) {
    
      }
    } 
    //expect(result['InitPaymentAdapter'].adapter).to.equal("test-payment-system");
  });  

  it('getDishes', function(){
    // it's planned implement after connect @webresto/worktime
    expect(Dish.getDishes).to.not.equals(undefined);
  });
});
