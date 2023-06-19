const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number, 
        require: true,
    },
     mission: {
        type: String,
        require: true,
    },
    rocket: {
        type: String,
        require: true,
    },
    launchDate: {
        type: Date,
        require: true,
    },
    target: String,
    customers: [ String ],
    upcoming: {
        type: Boolean,
        require: true,
    },
    success: {
        type: Boolean,
        require: true,
        default: true,
    } 
});

const launchDatabase = mongoose.model("Launch", launchesSchema);

module.exports = launchDatabase;