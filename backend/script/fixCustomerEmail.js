require("../config/env");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const WRONG = "drisrykumari13@gmail.com";
const RIGHT = "dristykumari13@gmail.com";

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  for (const email of [WRONG, RIGHT]) {
    const c = await Customer.findOne({ email });
    const orders = await Order.countDocuments({ "user_info.email": email });
    console.log("---", email);
    if (c) {
      console.log("  name:", c.name, "| id:", c._id, "| verified:", c.emailVerified);
    } else console.log("  (no account)");
    console.log("  orders:", orders);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
