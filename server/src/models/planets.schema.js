const mongoose = require("mongoose");

const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        require: true,
    }
});

const Planet = mongoose.model("Planet", planetSchema);

module.exports = Planet;