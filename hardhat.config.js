require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY_1, PRIVATE_KEY_2, AVALANCHE_FUJI_RPC } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    fuji: {
      url: AVALANCHE_FUJI_RPC,
      accounts: [PRIVATE_KEY_1, PRIVATE_KEY_2], // Multiple accounts supported
    },
  },
};
