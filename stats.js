const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "users.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return { users: [] };
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function registerUser(jid) {
  const data = load();
  if (!data.users.includes(jid)) {
    data.users.push(jid);
    save(data);
  }
  return data.users.length;
}

function totalUsers() {
  return load().users.length;
}

module.exports = { registerUser, totalUsers };
