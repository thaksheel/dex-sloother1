const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Alchemy, Network } = require("alchemy-sdk");

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
        if (resPoolDetail.status === 200 && dataPoolDetail.length !== 0)
          console.log("dataPoolDetail:", dataPoolDetail);
        // arrayPoolsList.push(each);
      });
    }

    // console.log("arrayPoolsList:", arrayPoolsList);
  } catch (error) {
    console.log("--- error of pool list --- :", error);
  }
});

module.exports = router;
