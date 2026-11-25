require('dotenv').config({ quiet: true }); // reads .env into process.env
const express = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
id: { type: Number, required: true, trim: true },
email: { type: String, required: true, trim: true },
username: {type: String}
},
{ timestamps: true } 
);

const user = mongoose.model('User', userSchema);


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // reads JSON request bodies into req.body
// A first route, to check the server is up
app.get('/', (req, res) => {
res.json({ message: 'Welcome to the API' });
});
// Connect to MongoDB first; only then start listening for requests
async function start() {
try {
if (!process.env.MONGODB_URI) {
throw new Error('MONGODB_URI is not set in .env');
}
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');
app.listen(port, () => {
console.log(`API listening on http://localhost:${port}`);
});
} catch (err) {
console.error('Could not connect to MongoDB:', err.message);
process.exit(1);
}
}

app.get('/get', async (req, res) => {
    try {
        const users = await user.find();

        res.status(200).json(users);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/get/getrandomuser', async (req, res) => {
  try {
    const found = await user.aggregate([
      { $sample: { size: 1 } }
    ]);

    if (found.length === 0) {
      return res.status(404).json({ message: 'Users not found' });
    }
    return res.status(200).json(found[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/get/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'id must be an integer' });
  }
  try {
    const found = await user.findOne({ id });
    if (!found) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(found);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post('/newuser', async (req, res) => {
    try {
        const newUser = new user({
            id: req.body.id,
            username: req.body.username,
            email: req.body.email
        });

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/modify/:id', async (req, res) => {
    try{
    const { id, email, username } = req.body;
    const hold = await user.findByIdAndUpdate(
    req.params.id,
    { id, email, username },
    { returnDocument: 'after', runValidators: true }
    );
    if (!hold) {
    return res.status(404).json({ message: 'user not found.' });
    }
    res.json(hold);
} catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/user/delete/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const deletedUser = await user.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user: deletedUser
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

start();