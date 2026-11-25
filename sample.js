require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
// the same schema and model as in server.js
const User = mongoose.model('User', new mongoose.Schema(
{
id: { type: Number, required: true, trim: true },
email: { type: String, required: true, trim: true },
username: {type: String}
},
{ timestamps: true } 
));
const users = [
{id: 1, email: 'words', username: 'dave'},
{id: 2, email: 'hi hello', username: 'lave'},
{id: 3, email: 'goodbye', username: 'jave'},
{id: 4, email: 'byegood', username: 'nave'},
];
async function seed() {
if (!process.env.MONGODB_URI) {
throw new Error('MONGODB_URI is not set in .env');
}
await mongoose.connect(process.env.MONGODB_URI);
try {
const result = await User.bulkWrite(users.map((user) => ({
updateOne: {
filter: { id: user.id },
update: { $set: user },
upsert: true
}
})));
console.log(`Seeded ${result.upsertedCount} new and updated ${result.modifiedCount} existing users`);
} finally {
await mongoose.disconnect();
}
}
seed().catch((err) => {
console.error('Failed to seed users:', err.message);
process.exitCode = 1;
});