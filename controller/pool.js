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
  // it supports ethereum, polygon and bnb networks for now.

  const mainnetAaveV3 = [
    "AaveV3Ethereum",
    "AaveV3BNB",
    "AaveV3Polygon",
    // "AaveV3Avalanche",
    // "AaveV3Base",
    // "AaveV3Metis",
    // "AaveV3Gnosis",
    // "AaveV3PolygonZkEvm",
    // "AaveV3Arbitrum",
    // "AaveV3Optimism",
    // "AaveV3Scroll",
    // "AaveV3Fantom",
    // "AaveV3Harmony",
    // "AaveV3EthereumLido",
  ];

  try {
    const arrayAllNetworkAssets = await Promise.all(
      mainnetAaveV3.map(async (networkName) => {
        let detailNetwork = pools[networkName];

        let arrayAssets = Object.entries(detailNetwork.ASSETS).map(
          ([key, value]) => ({
            assetName: key,
            ...value,
          })
        );

        // console.log("arrayAssets:", arrayAssets);

        let network;
        switch (networkName) {
          case "AaveV3Ethereum":
            network = "eth-mainnet";
            break;
          case "AaveV3Polygon":
            network = "matic-mainnet";
            break;
          case "AaveV3BNB":
            network = "bsc-mainnet";
            break;
          case "AaveV3Avalanche":
            network = "avalanche-mainnet";
            break;
          default:
            network = "not_support";
        }

        if (network === "not_support") {
          return { networkName, assets: "not_support" };
        }

        const assetDetail = await Promise.all(
          arrayAssets.map(async (asset) => {
            const addressAToken = asset.A_TOKEN;
            const url = `https://api.covalenthq.com/v1/${network}/tokens/${addressAToken}/token_holders_v2/`;
            const params = {
              key: process.env.API_KEY_COVALENTHQ,
              "page-number": 0, // top 100 holders
            };

            try {
              const responseTopHolders = await axios.get(url, { params });

              const tokenTop100Holders = responseTopHolders.data.data.items.map(
                (objectResp) => ({
                  ...objectResp,
                  balanceRaw: objectResp.balance,
                  balance: formatUnits(
                    objectResp.balance,
                    objectResp.contract_decimals
                  ),
                })
              );

              const tokenHoldersTotalCount =
                responseTopHolders.data.data.pagination.total_count;

              return {
                assetName: asset.assetName,
                decimals: asset.decimals,
                addressUnderlying: asset.UNDERLYING,
                addressAToken: asset.A_TOKEN,
                tokenHoldersTotalCount: tokenHoldersTotalCount,
                tokenTop100Holders: tokenTop100Holders,
              };
            } catch (error) {
              console.error(
                `Error fetching token holders for ${asset.assetName}:`,
                error
              );
              return {
                assetName: asset.assetName,
                error: "Failed to fetch token holders",
              };
            }
          })
        );

        return {
          chainId: detailNetwork.CHAIN_ID,
          networkName: networkName,
          assets: assetDetail,
        };
      })
    );

    return res.json({
      isSuccess: true,
      assets: arrayAllNetworkAssets,
    });
  } catch (error) {
    console.error("Error of getting all networks:", error);
    return res
      .status(500)
      .json({ isSuccess: false, error: "Internal Server Error" });
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
