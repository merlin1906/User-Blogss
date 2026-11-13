
/* global use, db */

// Select database
const database = "GO_FOOD";
const collection = "users";

// Create database and collection
use(database);

db.createCollection(collection);

// Insert a sample document
db.users.insertOne({
    name: "Test User",
    email: "test@gmail.com",
    createdAt: new Date()
});

// Display created database
db.getCollectionNames();
