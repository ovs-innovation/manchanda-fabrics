const router = require("express").Router();
const { isAuth, isAdmin } = require("../config/auth");

const {
  addGlobalSetting,
  getGlobalSetting,
  updateGlobalSetting,
  addStoreSetting,
  getStoreSetting,
  updateStoreSetting,
  getStoreSeoSetting,
  addStoreCustomizationSetting,
  getStoreCustomizationSetting,
  updateStoreCustomizationSetting,
  addVendorSetting,
  getVendorSetting,
  updateVendorSetting,
} = require("../controller/settingController");

//add a global setting
router.post("/global/add", isAuth, isAdmin, addGlobalSetting);

//get global setting
router.get("/global/all", getGlobalSetting);

//update global setting
router.put("/global/update", isAuth, isAdmin, updateGlobalSetting);

//add a store setting
router.post("/store-setting/add", isAuth, isAdmin, addStoreSetting);

//get store setting
router.get("/store-setting/all", getStoreSetting);

//get store setting
router.get("/store-setting/seo", getStoreSeoSetting);

//update store setting
router.put("/store-setting/update", isAuth, isAdmin, updateStoreSetting);

//store customization routes

//add a online store customization setting
router.post("/store/customization/add", isAuth, isAdmin, addStoreCustomizationSetting);

//get online store customization setting
router.get("/store/customization/all", getStoreCustomizationSetting);

//update online store customization setting
router.put("/store/customization/update", isAuth, isAdmin, updateStoreCustomizationSetting);


// AI translation endpoint (NVIDIA Nemotron 3 Ultra via OpenRouter)
router.post("/translate", async (req, res) => {
  try {
    const { text, texts, from = "en", to = "hi" } = req.body;
    const { translateWithNemotron } = require("../utils/fashionTranslator");
    if (Array.isArray(texts)) {
      const results = {};
      for (const item of texts) {
        if (item) {
          results[item] = await translateWithNemotron(item, from, to);
        }
      }
      return res.send({
        translations: results,
        model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
      });
    }
    const translated = await translateWithNemotron(text, from, to);
    return res.send({
      translated,
      model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
    });
  } catch (err) {
    return res.status(500).send({ message: "Translation failed", error: err.message });
  }
});

module.exports = router;
