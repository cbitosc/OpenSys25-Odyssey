import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { staticData } from "./staticdata";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function timeFromStart(seconds) {
  const points = [400, 350, 320, 300, 250, 200, 100, 100];
  const times = [0, 100, 300, 600, 900, 1200, 1800, Infinity];

  for (let i = 0; i < times.length - 1; i++) {
    if (times[i] <= seconds && seconds < times[i + 1]) {
      const t1 = times[i];
      const t2 = times[i + 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      return p1 + ((p2 - p1) * (seconds - t1)) / (t2 - t1);
    }
  }
  return points[points.length - 1];
}

function timeFromLaunch(seconds) {
  const points = [2000, 1500, 1000, 800, 600, 500, 400, 200, 100, 100];
  const times = [0, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, Infinity];

  for (let i = 0; i < times.length - 1; i++) {
    if (times[i] <= seconds && seconds < times[i + 1]) {
      const t1 = times[i];
      const t2 = times[i + 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      return p1 + ((p2 - p1) * (seconds - t1)) / (t2 - t1);
    }
  }
  return points[points.length - 1];
}

const axios = require("axios");

export async function getIndianEpochTimeFromWorldTimeAPI() {
  try {
    const response = await axios.get(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kolkata"
    );
    const { year, month, day, hour, minute, seconds } = response.data;
    return Math.floor(new Date(year, month - 1, day, hour, minute, seconds).getTime() / 1000);
  } catch (error) {
    return null;
  }
}

getIndianEpochTimeFromWorldTimeAPI();

export async function levelScore(level, startTime, curscore) {
  const curTime = await getIndianEpochTimeFromWorldTimeAPI();
  const solveTime = curTime - startTime;
  const totalTime = curTime - staticData.startTimes[level];

  const timeStartPoints = timeFromStart(solveTime);
  const timeLaunchPoints = timeFromLaunch(totalTime);
  const weightage = staticData.levelWeightage[level];
  const finalScore = (timeStartPoints + timeLaunchPoints) * weightage;

  return curscore + finalScore;
}

export function convertDotsToUnderscores(str) {
  return str.replace(/\./g, "_");
}
