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
      // console.log("token holder:", resp);
      const objectResp = {
        contract_decimals: resp.contract_decimals,
        contract_name: resp.contract_name,
        contract_ticker_symbol: resp.contract_ticker_symbol,
        contract_address: resp.contract_address,
        supports_erc: resp.supports_erc,
        logo_url: resp.logo_url,
        address: resp.address,
        balance: BigInt(resp.balance).toString(),
        total_supply: BigInt(resp.total_supply).toString(),
        block_height: resp.block_height,
      };
      arrayHolders.push(objectResp);
    }
    console.log("token holders lists:", arrayHolders);
    console.log("token holders count:", arrayHolders.length);

    return res.send({
      isSuccess: true,
      network: network,
      tokenAddress: tokenAddress,
      holders: arrayHolders,
    });
  } catch (error) {
    console.log("error of token holders", error);
  }
});

router.get("/get_all_networks", async (req, res) => {
  try {
    let networks = Object.keys(pools);
    if (networks.length !== 0) {
      console.log("networks:", networks);
      return res.json({
        isSuccess: true,
        assets: networks,
      });
    }
    return res.json({
      isSuccess: false,
    });
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

router.post("/get_network_assets", async (req, res) => {
  try {
    let network = req.body.network;
    console.log("network:", network);
    let networkAaveV3 = "AaveV3" + network;
    console.log("networkAaveV3:", networkAaveV3);

    let arrayAssets = pools[networkAaveV3];

    const dataNetworkAssets = {
      networkName: networkAaveV3,
    };

    console.log("arrayAssets:", arrayAssets);

    return res.json({
      isSuccess: false,
      assets: arrayAssets,
    });
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

router.get("/get_all_assets", async (req, res) => {
  const mainnetAaveV3 = [
    "AaveV3Ethereum",
    // "AaveV3Polygon",
    // "AaveV3Avalanche",
    // "AaveV3Base",
    // "AaveV3Metis",
    // "AaveV3Gnosis",r
    // "AaveV3PolygonZkEvm",
    // "AaveV3BNB",
    // "AaveV3Arbitrum",
    // "AaveV3Optimism",
    // "AaveV3Scroll",
    // "AaveV3Fantom",
    // "AaveV3Harmony",
    // "AaveV3EthereumLido",
  ];

  try {
    for (let i = 0; i < mainnetAaveV3.length; i++) {
      let detailNetwork = pools[mainnetAaveV3[i]];
      console.log("detailNetwork:", detailNetwork.ASSETS);

      let objectNetwork = {
        chainId: detailNetwork.CHAIN_ID,
        networkName: mainnetAaveV3[i],
        // assets: ,
      };
      // for (let j = 0; j < detailNetwork.ASSETS.length; j++) {
      //   console.log("detailNetwork:", detailNetwork.ASSETS[j]);
      // }
    }

    // return res.json({
    //   isSuccess: false,
    //   assets: detailNetwork,
    // });
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

module.exports = router;
