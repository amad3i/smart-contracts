require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "mumbai",
  networks: {
    mumbai: {
      url: process.env.MUMBAI_ALCHEMY_API,
      accounts: [process.env.PRIVATE_KEY_MUMBAI],
      gasPrice: 40e9
    },
  }
};
