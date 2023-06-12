require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",

  networks: {
    // goerli: {
    //   url: `${process.env.ALCHEMY_KEY}`,
    //   accounts: [process.env.SEACRET_KEY],
    // }
  },
    // etherscan: {
    //   apiKey: process.env.API_KEY,
    // },
};
