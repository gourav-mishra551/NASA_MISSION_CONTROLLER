import { useCallback, useEffect, useState } from "react";

import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch,} from './requests';

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([]);
  const [isPendingLaunch, setPendingLaunch] = useState(false);

  const getLaunches = useCallback(async () => {
    const fetchedLaunches = await httpGetLaunches();
    saveLaunches(fetchedLaunches);
  }, []);

  useEffect(() => {
    getLaunches();
  }, [getLaunches]);

  const submitLaunch = useCallback(async (e) => {
    e.preventDefault();
    setPendingLaunch(true);
  try {
    const data = new FormData(e.target);
    const launchDate = new Date(data.get("launch-day"));
    const mission = data.get("mission-name");
    const rocket = data.get("rocket-name");
    const target = data.get("planets-selector");
    const response = await httpSubmitLaunch({
      launchDate,
      mission,
      rocket,
      target,
    });
    
    if (response.ok) {
      getLaunches();
      setTimeout(() => {
        e.target.reset();
        onSuccessSound();
      }, 800);
    } else {
      setTimeout(() => {
        onFailureSound();
      }, 800);
    }
  
  } catch (err) {
    onFailureSound();
    console.log(`Error: ${err}`)
  
  } finally {
    setTimeout(() => {
      setPendingLaunch(false);
    }, 800)
  }
  }, [getLaunches, onSuccessSound, onFailureSound]);

  const abortLaunch = useCallback(async (id) => {
    try {
      const response = await httpAbortLaunch(id);

        if (response.ok) {
          getLaunches();
          onAbortSound();
        } else {
          onFailureSound();
        }
    } catch (err) {
      console.log(err)
    }
  }, [getLaunches, onAbortSound, onFailureSound]);

  return {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch,
  };
}

export default useLaunches;