
const mongoose = require("mongoose");
const MONGO_URL = process.env.DATABASE_ACCESS;

mongoose.connection.once('open', () => {
    console.log("MongoDB connection ready!");
});
mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    try {
        await mongoose.connect(MONGO_URL)  
        
    } catch (err) {
        console.log(err)
    }
}; 

async function mongoDisconnect() {
    await mongoose.disconnect();  
};

module.exports = {
    mongoConnect,
    mongoDisconnect
};