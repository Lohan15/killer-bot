const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "rank.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addPoint(jid, name) {
  const data = load();
  if (!data[jid]) data[jid] = { name, points: 0 };
  data[jid].name = name || data[jid].name;
  data[jid].points += 1;
  save(data);
  return data[jid].points;
}

function topRank(limit = 10) {
  const data = load();
  return Object.values(data)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

module.exports = { addPoint, topRank };
