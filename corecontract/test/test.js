const { expect } = require("chai");

// テストケースの記述
describe("Market", function () {
    it("Deployment should", async function () {
        const [owner] = await ethers.getSigners();
    
        const market = await ethers.getContractFactory("Market");
    
        const testMarket = await market.deploy();

        expect(await testMarket.getAccount(0xB390bEF1CeeC84C193e346732D15c1d0528B976E,1)).to.equal(0x565BC1292Db2f06eC17fF8517aFd57D7B888A74C);
      });
  });