const express = require("express");
const  fs = require("fs") //The fs module allows you to interact with the file system on your computer, enabling you to read, write, update, and delete files and directories.
let users = require("./MOCK_DATA.json");  // Use let here to allow reassignment

const app=express();
const PORT= 8000;

//using middleware for post operation , it acts as a plugin
//It pushes the input data from the user to the form 
//It takes the data ,makes javascript object out of it and inserts it into the body.
app.use(express.urlencoded({extended:false}))

app.use(express.json()); // This is needed to handle JSON in PATCH and POST requests

// GET all users
app.get("/users", (req, res) => {
  const html = `
    <ul>
      ${users.map((user) => `<li>${user.first_name}</li>`).join("")}
    </ul>
  `;
  res.send(html);
});

// GET API for all users
app.get("/api/users", (req, res) => {
  return res.json(users);
});

// PATCH and DELETE for a specific user by id
app.route('/api/users/:id')
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    if (user) {
      return res.json(user);
    }
    return res.status(404).json({ message: "User not found" });
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex > -1) {
      const updatedUser = { ...users[userIndex], ...req.body };
      users[userIndex] = updatedUser;
      
      fs.writeFileSync('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error updating user" });
        }
      });
      
      return res.json({ status: "Success", user: updatedUser });
    }

    return res.status(404).json({ message: "User not found" });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const newUsers = users.filter(user => user.id !== id);

    if (newUsers.length !== users.length) {
      users = newUsers;
      
      fs.writeFileSync('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error deleting user" });
        }
      });

      return res.json({ status: "Success", message: "User deleted" });
    }

    return res.status(404).json({ message: "User not found" });
  });

// POST a new user
app.post("/api/users", (req, res) => {
  const body = req.body;
  const newUser = { id: users.length + 1, ...body };
  users.push(newUser);

  fs.writeFileSync('./MOCK_DATA.json', JSON.stringify(users), (err) => {
    if (err) {
      return res.status(500).json({ message: "Error creating user" });
    }
  });

  return res.json({ status: "Success", id: users.length });
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));