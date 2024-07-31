const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Alchemy, Network } = require("alchemy-sdk");
const { CovalentClient } = require("@covalenthq/client-sdk");

const pools = require("@bgd-labs/aave-address-book");

router.post("/list", async (req, res) => {
  console.log("investmentId:", req.body.investmentId);
  try {
    const configPoolsList = {
      method: "post",
      url: process.env.API_URL_OKX_POOL_LIST,
      params: {
        investmentId: req.body.investmentId,
      },
    };
    let resPoolsList = await axios(configPoolsList);
    let resDataPoolsList = resPoolsList.data.data;
    // console.log("=== resPoolLists ===", resArrayPoolList);

    // let arrayPoolsList = [];
    if (resPoolsList.status === 200 && resDataPoolsList.length !== 0) {
      resDataPoolsList.forEach(async (eachPool) => {
        console.log("each Pool:", eachPool);

        const configPoolDetail = {
          method: "get",
          url: process.env.API_URL_OKX_POOL_DETAIL,
          params: {
            investmentId: eachPool.investmentId,
          },
        };
        let resPoolDetail = await axios(configPoolDetail);
        let dataPoolDetail = resPoolDetail.data.data;
        if (resPoolDetail.status === 200 && dataPoolDetail.length !== 0) {
          console.log("dataPoolDetail:", dataPoolDetail.network);
          const networkPoolDetail = dataPoolDetail.network;
          switch (networkPoolDetail) {
            case "Ethereum":
              // // using scan's api endpoints:
              // const configScanPoolTxLists = {
              //   method: "get",
              //   url: process.env.API_URL_ETHERSCAN + `/api`,
              //   params: {
              //     module: "account",
              //     action: "txlist",
              //     address: dataPoolDetail.contract,
              //     startblock: 0,
              //     endblock: 99999999,
              //     sort: "asc",
              //     apikey: "GKT561CCZZB4PWB94HAPCSAD1R5BPXQTUA",
              //   },
              // };
              // const resTxLists = await axios(configScanPoolTxLists);
              // console.log("resTxLists:", resTxLists.data.result);

              // using alchemy's api endpoint:
              const configAlchemyPoolLists = {
                apiKey: process.env.API_KEY_ALCHEMY,
                network: Network.ETH_MAINNET,
              };

              const alchemyPoolLists = new Alchemy(configAlchemyPoolLists);
              const addressContract = dataPoolDetail.contract;
              const resAlchemyPoolLists =
                await alchemyPoolLists.core.getAssetTransfers({
                  fromBlock: "0x0",
                  // fromAddress: "0x0000000000000000000000000000000000000000",
                  to: addressContract,
                  excludeZeroValue: true,
                  category: [
                    "external",
                    "internal",
                    "erc20",
                    "erc721",
                    "erc1155",
                  ], // "external", "internal", "erc20", "erc721", "erc1155"
                });

              console.log(
                "resAlchemyPoolLists:",
                resAlchemyPoolLists.transfers
              );

            // case "Base":

            // case "Polygon":
            default:
              break;
          }
        }
        // arrayPoolsList.push(each);
      });
    }

    // console.log("arrayPoolsList:", arrayPoolsList);
  } catch (error) {
    console.log("--- error of pool list --- :", error);
  }
});

router.post("/token_holders", async (req, res) => {
  console.log("network:", req.body.network);
  console.log("token address:", req.body.tokenAddress);
  const network = req.body.network; // "eth-mainnet"
  const tokenAddress = req.body.tokenAddress;
  const client = new CovalentClient(process.env.API_KEY_COVALENTHQ);

  try {
    let arrayHolders = [];
    for await (const resp of client.BalanceService.getTokenHoldersV2ForTokenAddress(
      network,
      tokenAddress
    )) {
      // console.log("token holder:", Object.keys(resp));
      arrayHolders.push(resp);
    }
    console.log("token holders lists:", arrayHolders);
    console.log("token holders count:", arrayHolders.length);
  } catch (error) {
    console.log("error of token holders", error);
  }
});

router.get("/get_all_networks", async (req, res) => {
  try {
    let networks = Object.keys(pools);
    console.log("networks:", networks);
    if (networks.length !== 0) {
      return res.json({
        success: true,
        networks: networks,
      });
    }
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

module.exports = router;
