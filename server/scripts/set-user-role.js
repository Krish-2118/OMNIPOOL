const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("../src/models/User");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const nextValue = args[index + 1];

    if (arg === "--email" || arg === "-e") {
      options.email = nextValue;
      index += 1;
    } else if (arg === "--id" || arg === "-i") {
      options.id = nextValue;
      index += 1;
    } else if (arg === "--role" || arg === "-r") {
      options.role = nextValue;
      index += 1;
    }
  }

  return options;
};

const main = async () => {
  const { id, email, role } = parseArgs();
  const targetRole = role || "admin";

  if (!["viewer", "admin"].includes(targetRole)) {
    throw new Error("Invalid role. Use viewer or admin.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in your .env file.");
  }

  if (!id && !email) {
    throw new Error("Provide either --id or --email.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const filter = id ? { _id: id } : { email: email.toLowerCase() };
  const user = await User.findOne(filter);

  if (!user) {
    throw new Error("User not found.");
  }

  user.role = targetRole;
  await user.save();

  console.log(`Updated ${user.email} to role=${user.role}`);
  console.log(`User id: ${user._id}`);
};

main()
  .catch((error) => {
    console.error(`Failed to update role: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
