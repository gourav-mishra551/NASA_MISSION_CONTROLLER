const API_URL = 'v1';

async function httpGetPlanets() {
  // Load planets and return as JSON
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/launches`);
  const launchesData = await response.json();
  return launchesData.sort((a, b) => {
    return a.flightNumber - b.flightNumber
  });
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    return await fetch(`${API_URL}/launches`, {
      method: 'POST',
      headers: {'content-Type': 'application/json'},
      body: JSON.stringify(launch)
    })
  } catch(err) {
    console.log(err);
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'DELETE',
    });
  } catch(err) {
    console.log(err);
    return {
      ok: false
    };
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};