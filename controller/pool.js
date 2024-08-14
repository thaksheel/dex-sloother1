const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Alchemy, Network } = require("alchemy-sdk");
const { CovalentClient } = require("@covalenthq/client-sdk");
const { formatUnits } = require("ethers");
const pools = require("@bgd-labs/aave-address-book");
const xlsx = require("xlsx");

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
      tokenAddress,
      { pageSize: 100, pageNumber: 0 }
    )) {
      console.log("token holder:", resp);
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

// using GoldRush's SDK

router.get("/get_all_assets", async (req, res) => {
  const mainnetAaveV3 = [
    "AaveV3Ethereum",
    // "AaveV3Polygon",
    // "AaveV3Avalanche",
    // "AaveV3Base",
    // "AaveV3Metis",
    // "AaveV3Gnosis",
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
    let arrayAllNetworkAssets = [];
    for (let i = 0; i < mainnetAaveV3.length; i++) {
      let detailNetwork = pools[mainnetAaveV3[i]];
      // console.log("detailNetwork:", detailNetwork.ASSETS);

      let arrayAssets = Object.entries(detailNetwork.ASSETS).map(
        ([key, value]) => {
          return { assetName: key, ...value };
        }
      );
      // console.log("assetsArray:", arrayAssets);

      let network;
      if (mainnetAaveV3[i] === "AaveV3Ethereum") {
        network = "eth-mainnet";
      } else if (mainnetAaveV3[i] === "AaveV3Polygon") {
        network = "matic-mainnet";
      } else if (mainnetAaveV3[i] === "AaveV3BNB") {
        network = "bsc-mainnet";
      } else if (mainnetAaveV3[i] === "AaveV3Avalanche") {
        network = "avalanche-mainnet";
      } else {
        network = "not_support";
      }
      console.log("network:", network);

      const client = new CovalentClient(process.env.API_KEY_COVALENTHQ);
      let assetDetail = [];
      for (let j = 0; j < arrayAssets.length; j++) {
        let tokenHolders = [];
        if (network === "not_support") {
          tokenHolders.push("not_support");
          return;
        }
        const addressAToken = arrayAssets[j].A_TOKEN;
        console.log("addressAToken:", addressAToken);

        // // using GoldRush's SDK to get all holders
        // for await (const resp of client.BalanceService.getTokenHoldersV2ForTokenAddress(
        //   network,
        //   arrayAssets[j].A_TOKEN,
        // )) {
        //   // console.log("token holder:", resp);

        //   const objectResp = {
        //     // contract_decimals: resp.contract_decimals,
        //     contract_name: resp.contract_name,
        //     contract_ticker_symbol: resp.contract_ticker_symbol,
        //     contract_address: resp.contract_address,
        //     supports_erc: resp.supports_erc,
        //     logo_url: resp.logo_url,
        //     address: resp.address,
        //     balance: BigInt(resp.balance).toString(),
        //     total_supply: BigInt(resp.total_supply).toString(),
        //     block_height: resp.block_height,
        //   };

        //   console.log("asset details:", objectResp);
        //   tokenHolders.push(objectResp);
        // }

        // using covalenthq's api
        const url = `https://api.covalenthq.com/v1/${network}/tokens/${addressAToken}/token_holders_v2/`;
        const params = {
          key: process.env.API_KEY_COVALENTHQ,
          "page-number": 0,
        };

        const responseTopHolders = await axios.get(url, {
          params: params,
        });

        // console.log("responseTopHolders:", responseTopHolders.data);
        tokenHolders = responseTopHolders.data.data.items;

        // console.log("tokenTopHolders:", tokenHolders);

        let assetEach = {
          assetName: arrayAssets[j].assetName,
          decimals: arrayAssets[j].decimals,
          addressUnderlying: arrayAssets[j].UNDERLYING,
          addressAToken: arrayAssets[j].A_TOKEN,
          tokenHolders: tokenHolders,
        };

        assetDetail.push(assetEach);
      }

      let objectNetwork = {
        chainId: detailNetwork.CHAIN_ID,
        networkName: mainnetAaveV3[i],
        assets: assetDetail,
      };

      // console.log("objectNetwork:", objectNetwork);
      arrayAllNetworkAssets.push(objectNetwork);
      // return res.json({
      //   isSuccess: true,
      //   assets: objectNetwork,
      // });
    }

    return res.json({
      isSuccess: true,
      assets: arrayAllNetworkAssets,
    });
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

router.post("/get_balances", async (req, res) => {
  console.log("token address:", req.body.addressWallet);
  try {
    const client = new CovalentClient(process.env.API_KEY_COVALENTHQ);
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      "eth-mainnet",
      req.body.addressWallet,
      { quoteCurrency: "USD" }
    );
    console.log("resp.data:", resp.data);
    const dataResData = resp.data;
    const dataResBalances = resp.data.items;
    let arrayHolders = [];
    for (let i = 0; i < dataResBalances.length; i++) {
      console.log("wallet balances:", dataResBalances[i]);
      const objectResp = dataResBalances[i];
      objectResp.balance = formatUnits(
        dataResBalances[i].balance,
        dataResBalances[i].contract_decimals
      );
      objectResp.balance_24h = formatUnits(
        dataResBalances[i].balance_24h,
        dataResBalances[i].contract_decimals
      );
      arrayHolders.push(objectResp);
    }
    dataResData.items = arrayHolders;
    return res.json(resp.data);
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

// router.get("/get_all_balances", async (req, res) => {
//   try {
//     // Read the Excel file
//     const workbook = xlsx.readFile("./data/asset_data1.xlsx");
//     // Get the first sheet name
//     const sheetName = workbook.SheetNames[0];
//     // Get the worksheet
//     const worksheet = workbook.Sheets[sheetName];
//     // Convert the worksheet to JSON
//     const dataXlsx = xlsx.utils.sheet_to_json(worksheet);

//     const client = new CovalentClient(process.env.API_KEY_COVALENTHQ);
//     const networks = ["eth-mainnet", "bsc-mainnet", "matic-mainnet"];
//     console.log("total holders:", dataXlsx.length);
//     if (dataXlsx.length === 0) {
//       return res.json({
//         isSuccess: false,
//         errorMsg: "Couldn't read xlsx file.",
//       });
//     }
//     let dataAllHoldersBalances = [];
//     for (let i = 0; i < dataXlsx.length; i++) {
//       console.log("index holder:", i);
//       const addressHolder = dataXlsx[i].wallet_holder_address;
//       // console.log("addressHolder:", addressHolder);
//       let dataEachHolderBalances = [];
//       if (addressHolder === "0x000000000000000000000000000000000000dead") {
//         dataAllHoldersBalances.push({
//           address: addressHolder,
//           balances: "DeadWallet",
//         });
//       } else {
//         for (let j = 0; j < networks.length; j++) {
//           const resp =
//             await client.BalanceService.getTokenBalancesForWalletAddress(
//               networks[j],
//               addressHolder,
//               { quoteCurrency: "USD" }
//             );
//           let dataResData;
//           if (resp.data === null || resp.data === undefined) {
//             dataResData = [];
//           } else {
//             dataResData = resp.data;
//           }
//           // console.log("dataResData:", resp);
//           if (resp.data.items === null || resp.data.items === undefined) {
//             dataResData.items = [];
//           }
//           const dataResBalances = resp.data.items;
//           let arrayHolders = [];
//           for (let k = 0; k < dataResBalances.length; k++) {
//             const objectResp = dataResBalances[k];
//             // objectResp.balance = formatUnits(
//             //   dataResBalances[k].balance,
//             //   dataResBalances[k].contract_decimals
//             // );
//             // objectResp.balance_24h = formatUnits(
//             //   dataResBalances[k].balance_24h,
//             //   dataResBalances[k].contract_decimals
//             // );
//             objectResp.balance = BigInt(dataResBalances[k].balance).toString();
//             objectResp.balance_24h = BigInt(
//               dataResBalances[k].balance_24h
//             ).toString();
//             arrayHolders.push(objectResp);
//           }
//           dataResData.items = arrayHolders;

//           const eachDataHolderBalances = {
//             network: networks[j],
//             assets: dataResData.items,
//           };

//           dataEachHolderBalances.push(eachDataHolderBalances);
//         }
//       }

//       dataAllHoldersBalances.push({
//         address: addressHolder,
//         balances: dataEachHolderBalances,
//       });
//     }

//     // console.log("dataAllHoldersBalances:", dataAllHoldersBalances);
//     return res.json({
//       isSuccess: true,
//       data: dataAllHoldersBalances,
//     });
//   } catch (error) {
//     console.log("error of getting all networks:", error);
//   }
// });

const fetchBalancesForHolder = async (addressHolder) => {
  // if (addressHolder === "0x000000000000000000000000000000000000dead") {
  //   return {
  //     address: addressHolder,
  //     balances: "DeadWallet",
  //   };
  // }
  const client = new CovalentClient(process.env.API_KEY_COVALENTHQ);
  const networks = ["eth-mainnet", "bsc-mainnet", "matic-mainnet"];
  const balancePromises = networks.map(async (network, index) => {
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      network,
      addressHolder,
      { quoteCurrency: "USD" }
    );

    const dataResData = resp.data || { items: [] };
    const dataResBalances = dataResData.items || [];

    const arrayHolders = dataResBalances.map((objectResp) => ({
      ...objectResp,
      balance: BigInt(objectResp.balance).toString(),
      balance_24h: BigInt(objectResp.balance_24h).toString(),
    }));

    return {
      network,
      assets: arrayHolders,
    };
  });

  const dataEachHolderBalances = await Promise.all(balancePromises);

  return {
    address: addressHolder,
    balances: dataEachHolderBalances,
  };
};

router.get("/get_all_balances", async (req, res) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile("./data/asset_data1.xlsx");
    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    // Convert the worksheet to JSON
    const dataXlsx = xlsx.utils.sheet_to_json(worksheet);

    const dataAllHoldersBalances = await Promise.all(
      dataXlsx.map((holder) =>
        fetchBalancesForHolder(holder.wallet_holder_address)
      )
    );

    console.log("dataAllHoldersBalances:", dataAllHoldersBalances);
    return res.json({
      isSuccess: true,
      data: dataAllHoldersBalances,
    });
  } catch (error) {
    console.log("error of getting all networks:", error);
  }
});

module.exports = router;
