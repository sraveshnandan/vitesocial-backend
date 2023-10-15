const {serverStaus} = require("../controllers/serverStatusController");
const router = require("express").Router();
router.route("/status").get(serverStaus);
module.exports=router;