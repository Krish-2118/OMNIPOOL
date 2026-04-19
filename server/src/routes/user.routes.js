const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  loginUser,
  googleAuth,
  syncUser,
  getUserById,
  updateUser,
  applyEnterprise,
  getEnterpriseApplications,
  updateEnterpriseStatus,
} = require("../controllers/user.controller");
const auth = require("../middleware/auth");

router.route("/").get(getUsers).post(createUser);

router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/sync", syncUser);

// Admin Enterprise Routes
router.get("/enterprise/applications", auth, getEnterpriseApplications);
router.put("/enterprise/:id/status", auth, updateEnterpriseStatus);

// Regular Enterprise Apply Route
router.post("/enterprise", auth, applyEnterprise);

router.route("/:id").get(getUserById).put(auth, updateUser);

module.exports = router;
