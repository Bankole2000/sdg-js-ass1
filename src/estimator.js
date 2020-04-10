const normalizeDays = (periodType, timeToElapse) => {
  let days;
  if (periodType === 'weeks') {
    days = timeToElapse * 7;
  } else if (periodType === 'months') {
    days = timeToElapse * 30;
  } else if (periodType === 'days') {
    days = timeToElapse;
  }
  return days;
};

const eCurrentlyInfected = ({ reportedCases }) => {
  const icurrentlyInfected = reportedCases * 10;
  const scurrentlyInfected = reportedCases * 50;
  const obj = {
    impact: {
      currentlyInfected: icurrentlyInfected
    },
    severeImpact: {
      currentlyInfected: scurrentlyInfected
    }
  };
  return obj;
};

const eProjectedInfections = ({ periodType, timeToElapse }, { currentlyInfected }) => {
  const days = normalizeDays(periodType, timeToElapse);
  const factor = Math.trunc(days / 3);
  const possiblyInfected = currentlyInfected * (2 ** factor);
  return possiblyInfected;
};

const eAvailableBeds = ({ totalHospitalBeds }, { severeCasesByRequestedTime }) => {
  const availableBeds = Math.ceil(0.35 * totalHospitalBeds);
  const beds = availableBeds - severeCasesByRequestedTime;
  return beds;
};

const eDollarsInFlight = ({ infectionsByRequestedTime }, data) => {
  const { avgDailyIncomeInUSD, avgDailyIncomePopulation } = data.region;
  const { periodType, timeToElapse } = data;
  const days = normalizeDays(periodType, timeToElapse);
  const income = infectionsByRequestedTime * avgDailyIncomeInUSD * avgDailyIncomePopulation;
  const dollarsInFlight = Math.trunc(income / days);
  return dollarsInFlight;
};

const covid19ImpactEstimator = (data) => {
  const estimate = eCurrentlyInfected(data);
  const { impact } = estimate;
  const { severeImpact } = estimate;

  impact.infectionsByRequestedTime = eProjectedInfections(data, impact);
  severeImpact.infectionsByRequestedTime = eProjectedInfections(data, severeImpact);

  impact.severeCasesByRequestedTime = 0.15 * impact.infectionsByRequestedTime;
  severeImpact.severeCasesByRequestedTime = 0.15 * severeImpact.infectionsByRequestedTime;

  impact.hospitalBedsByRequestedTime = eAvailableBeds(data, impact);
  severeImpact.hospitalBedsByRequestedTime = eAvailableBeds(data, severeImpact);

  impact.casesForICUByRequestedTime = Math.trunc(0.05 * impact.infectionsByRequestedTime);
  const sevInfsByReqTime = severeImpact.infectionsByRequestedTime;
  severeImpact.casesForICUByRequestedTime = Math.trunc(0.05 * sevInfsByReqTime);

  impact.casesForVentilatorsByRequestedTime = 0.02 * impact.infectionsByRequestedTime;
  severeImpact.casesForVentilatorsByRequestedTime = 0.02 * impact.infectionsByRequestedTime;

  impact.dollarsInFlight = eDollarsInFlight(impact, data);
  severeImpact.dollarsInFlight = eDollarsInFlight(severeImpact, data);

  return {
    data,
    impact,
    severeImpact
  };
};

export default covid19ImpactEstimator;
