const { getAllLaunches,
        scheduleNewLaunch,
        searchLaunchById,
        abortLaunchById, } = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches (req, res) {
    const { skip, limit } = getPagination(req.query);
    const allLaunches = await getAllLaunches(skip, limit)

    return res.status(200).json(allLaunches);
};


async function httpAddNewLaunch (req, res) {
    const launchRequest = req.body;

    if(!launchRequest.mission|| !launchRequest.rocket|| !launchRequest.launchDate
        || !launchRequest.target) {
        return res.status(400).json({
            error: "Missing required launch property"
        })
    };
    launchRequest.launchDate = new Date(launchRequest.launchDate);
        
    if (isNaN(launchRequest.launchDate)) {
        return res.status(400).json({
            error: "Invalid launch Date"
        })
    };
    const newLaunch = await scheduleNewLaunch(launchRequest);
    return res.status(201).json(newLaunch);
};


async function httpAbortLaunch (req, res) {
    const launchId = Number(req.params.id);
    const result = await searchLaunchById(launchId);
    
    if(!result) {
        return res.status(404).json({
            error: "Launch not found"
        })
    };  
    const aborted = await abortLaunchById(launchId)
    if(!aborted) {
        return res.statut(400).json({
            error: "Launch not aborted"
        })
    };
    return res.status(200).json({
        ok: true
    }); 
};

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
};