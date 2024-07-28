const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Alchemy, Network } = require("alchemy-sdk");

const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

router.post("/list", async (req, res) => {
  console.log("id:", req.body);

  try {
    //moralis

    // await Moralis.start({
    //   apiKey: process.env.API_KEY_MORALIS,
    //   // ...and any other configuration
    // });

    // const address = "0xF4422C1D5C8f1088659A874655Ea4253394B61a3";

    // const chain = EvmChain.ETHEREUM;

    // const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    //   address,
    //   chain,
    // });

    // // console.log(response.toJSON());
    // console.log((response.toJSON()).page)

    // alchemy
    // const config = {
    //   apiKey: "SWVhmC47hTF030ouhPRSCgETkfh6mTlv",
    //   network: Network.ETH_MAINNET,
    // };

    // const alchemy = new Alchemy(config);

    // const toAddress = "0xF4422C1D5C8f1088659A874655Ea4253394B61a3";

    // const res = await alchemy.core.getAssetTransfers({
    //   fromBlock: "0x0",
    //   // fromAddress: "0x0000000000000000000000000000000000000000",
    //   to: toAddress,
    //   excludeZeroValue: true,
    //   category: ["external", "internal", "erc20", "erc721", "erc1155"], // "external", "internal", "erc20", "erc721", "erc1155"
    // });

    // console.log("res:", res.transfers.length);

    // let data = JSON.stringify({
    //   jsonrpc: "2.0",
    //   id: 0,
    //   method: "alchemy_getAssetTransfers",
    //   params: [
    //     {
    //       fromBlock: "0x0",
    //       toBlock: "latest",
    //       toAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    //       // fromAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    //       category: ["external", "internal", "erc20", "erc721", "erc1155"],
    //       withMetadata: false,
    //       excludeZeroValue: true,
    //     },
    //   ],
    // });

    // var requestOptions = {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: data,
    //   redirect: "follow",
    // };

    // const apiKey = "SWVhmC47hTF030ouhPRSCgETkfh6mTlv";
    // const baseURL = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    // const axiosURL = `${baseURL}`;

    // axios(axiosURL, requestOptions)
    //   .then((response) => {
    //     console.log(JSON.stringify(response.data, null, 2));
    //     // const temp = JSON.stringify(response.data, null, 2);
    //     // console.log(
    //     //   "length of tx lists:",
    //     //   response.data.result.transfers.length
    //     // );
    //   })
    //   .catch((error) => console.log(error));
    const res = await axios.get(
      "https://api.etherscan.io/api?module=account&action=txlist&address=0xF4422C1D5C8f1088659A874655Ea4253394B61a3&startblock=0&endblock=99999999&sort=asc&apikey=GKT561CCZZB4PWB94HAPCSAD1R5BPXQTUA"
    );
    console.log("res:", res.data.result.length);
  } catch (error) {
    console.log("--- error of pool list --- :", error);
  }
});

module.exports = router;
