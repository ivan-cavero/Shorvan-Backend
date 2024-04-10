type RequestCounts = {
    [key: string]: { count: number, lastRequestTime: number }
};
  
const requestCounts: RequestCounts = {};

const RATE_LIMIT = 5
const TIME_FRAME = 60 * 1000;
  
export const rateLimiter = (ipAddress: string) => {
  const currentTime = Date.now();
  const requestInfo = requestCounts[ipAddress] || { count: 0, lastRequestTime: currentTime };

  if (currentTime - requestInfo.lastRequestTime > TIME_FRAME) {
    requestInfo.count = 1;
    requestInfo.lastRequestTime = currentTime;
  } else {
    if (requestInfo.count >= RATE_LIMIT) {
      const timeLeft = ((requestInfo.lastRequestTime + TIME_FRAME) - currentTime) / 1000;
      throw new Error(`Rate limit exceeded: ${requestInfo.count}/${RATE_LIMIT}. Reset in ${Math.round(timeLeft)} seconds.`);
    }
    requestInfo.count++;
  }

  requestCounts[ipAddress] = requestInfo;
};
  
export const getRateLimitInfo = (ipAddress: string) => {
  const requestInfo = requestCounts[ipAddress] || { count: 0, lastRequestTime: 0 };
  const currentTime = Date.now();
  let timeLeft = 0;
  if (currentTime - requestInfo.lastRequestTime < TIME_FRAME) {
    timeLeft = ((requestInfo.lastRequestTime + TIME_FRAME) - currentTime) / 1000;
  }
  return `Requests: ${requestInfo.count}/${RATE_LIMIT}. Reset in ${Math.round(timeLeft)} seconds.`;
};
  