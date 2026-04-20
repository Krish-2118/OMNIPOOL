const express = require("express");
const router = express.Router();
const {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
  clearRequestMessages,
} = require("../controllers/request.controller");
const auth = require("../middleware/auth");

router.route("/").post(auth, createRequest).get(auth, getRequests);

router.delete("/:id/messages", auth, clearRequestMessages);
router.route("/:id").put(auth, updateRequest).delete(auth, deleteRequest);

module.exports = router;
