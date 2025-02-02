import { expect } from "chai";

describe("Settings", function () {

  it("Get from memory", async function () {
    await sleep(1000);
    let setting = Settings.get("projectName");
    expect(setting).to.equal("test")
  });

  it("Get from memory afterCreate", async function () {
    await Settings.set("test", {test: true});
    let setting = Settings.get("test");
    expect(setting.test).to.equal(true)
  });

  it("Get from memory afterUpdate", async function () {
    await Settings.update({ key: "test"}, {value: "yep"}).fetch();
    let setting = Settings.get("test");
    expect(setting).to.equal("yep")
  });

});
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
