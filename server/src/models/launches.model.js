
const launchDatabase = require("./launches.schema");
const Planet = require("./planets.schema");

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
const DEFAULT_FLIGHTNUMBER = 1;

async function saveLaunch (newLaunch) {
    try{
        const result = await launchDatabase.findOneAndUpdate(
            {flightNumber: newLaunch.flightNumber},
             newLaunch,
            {upsert: true}, 
        );
        if(!result) {
            console.log("Launch document successfully upsert");
        } 
    } catch(err) {
        console.error(`Could not save Launch... ${err}`)
    }
};


async function populateLaunchDatabase() {
    console.log("Downloading data...")
    try{
        const response = await fetch(SPACEX_API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                query: {},
                options: {
                    pagination: false,
                    populate: [
                        {
                            path:"rocket",
                            select: {
                                "name": 1
                            }
                        },
                        {
                            path: "payloads",
                            select: {
                                "customers": 1
                            }
                        }
                    ]
                }
            })
        })
        if(response.status !== 200) {
            console.log("Problem downloading launch data")
            throw new Error (`Launch data download failed: Error status ${response.status}`)
        };
        const data = await response.json();
        const launchDocs = data.docs; 
        
        for(const launchDoc of launchDocs) {
            const payloads = launchDoc["payloads"];
            const customers = payloads.flatMap((payload) => {
                return payload["customers"];
            });
            const launch = {
                flightNumber: launchDoc["flight_number"], 
                mission: launchDoc["name"], 
                rocket: launchDoc["rocket"]["name"],
                launchDate: launchDoc["date_local"],
                upcoming: launchDoc["upcoming"],
                success: launchDoc["success"],
                customers,
            }
        console.log(`${launch.flightNumber} ${launch.mission}`)
        await saveLaunch(launch);
        }
    } catch(err) {
        console.error(`Could not populate launch...${err}`)
    }
};


async function loadLaunchData () {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: "Falcon 1",
        mission: "FalconSat", 
    });
    if(firstLaunch) {
        console.log("launch data already loaded!")
    } else {
        await populateLaunchDatabase();
    }   
};


async function getAllLaunches (skip, limit) {
    try {
        return await launchDatabase
            .find({}, {"_id":0, "__v":0,})
            .sort({flightNumber: 1})
            .skip(skip)
            .limit(limit);  
    
        } catch(err) {
        console.error(`Could not get Launch... ${err}`)
    }
};


async function getLatestFlightNumber() {
    const latestLaunchNumber = await launchDatabase.findOne().sort({"flightNumber": -1 }).exec();
    if(!latestLaunchNumber) {
        return DEFAULT_FLIGHTNUMBER;
    }
    return latestLaunchNumber.flightNumber
};


async function scheduleNewLaunch(launch) {
    try {
        const targetPlanet = await Planet.findOne({keplerName: launch.target}).exec();
        if(!targetPlanet) {
            throw new Error("No matching planet found")
        }
        const newFlightNumber = await getLatestFlightNumber() +1;
        const newLaunch = {
            ...launch,
            succes: true,
            upcoming: true,
            customers: ["Zero to Master", "Nasa"],
            flightNumber: newFlightNumber,
        }
        await saveLaunch(newLaunch);
        return newLaunch;
    } catch(err) {
        console.error(`Could not schedule Launch... ${err}`)
    }
};

async function findLaunch(filter) {
    return await launchDatabase.findOne(filter).exec();
};

async function searchLaunchById (flightNumberID) {
    return await findLaunch({flightNumber: flightNumberID});
};


async function abortLaunchById (flightNumberID) {
    try {
        const abortedLaunch = await launchDatabase.updateOne(
            {flightNumber: flightNumberID},
            {$set: {upcoming: false, success: false}}
        );
        return abortedLaunch.acknowledged;
    } catch(err) {
        console.error(`Could not abort Launch... ${err}`)    
    }
};

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    searchLaunchById,
    abortLaunchById,
}