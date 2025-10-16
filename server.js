

const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json()); 

const FILE = "users.json";

function readUsers() {
  if (!fs.existsSync(FILE)) return [];
  const data = fs.readFileSync(FILE, "utf8");
  return JSON.parse(data || "[]");
}

function saveUsers(users) {
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2));
}

app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.get("/users/search", (req, res) => {
  const keyword = (req.query.name || "").toLowerCase();
  if (!keyword) return res.status(400).json({ error: "Please provide ?name=keyword" });

  const users = readUsers();
  const result = users.filter(u => u.name.toLowerCase().includes(keyword));
  res.json(result);
});

app.post("/users", (req, res) => {
  const { name, age } = req.body;
  if (!name || !age) return res.status(400).json({ error: "Name and age are required" });

  const users = readUsers();
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    age
  };
  users.push(newUser);
  saveUsers(users);
  res.status(201).json(newUser);
});

app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body;
  const users = readUsers();

  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (name) user.name = name;
  if (age) user.age = age;

  saveUsers(users);
  res.json(user);
});

app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let users = readUsers();

  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "User not found" });

  users.splice(index, 1);
  saveUsers(users);
  res.json({ message: `User ${id} deleted` });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
