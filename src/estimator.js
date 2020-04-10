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

const eSevereCases = ({ infectionsByRequestedTime }) => {
  return 0.15 * infectionsByRequestedTime;
};

const eAvailableBeds = ({ totalHospitalBeds }, { severeCasesByRequestedTime }) => {
  return Math.ceil(0.35 * totalHospitalBeds) - severeCasesByRequestedTime;
};

const eCasesForICU = ({ infectionsByRequestedTime }) => 0.05 * infectionsByRequestedTime;

const eCasesForVentilators = ({ infectionsByRequestedTime }) => 0.02 * infectionsByRequestedTime;

const eDollarsInFlight = ({ infectionsByRequestedTime }, { avgDailyIncomeInUSD, avgDailyIncomePopulation }, { periodType, timeToElapse }) => {
  const days = normalizeDays(periodType, timeToElapse);
  return (Math.trunc((infectionsByRequestedTime * avgDailyIncomeInUSD * avgDailyIncomePopulation) / days));
};

const covid19ImpactEstimator = (data) => {
  const estimate = eCurrentlyInfected(data);
  const { impact } = estimate;
  const { severeImpact } = estimate;
  impact.infectionsByRequestedTime = eProjectedInfections(data, impact);
  severeImpact.infectionsByRequestedTime = eProjectedInfections(data, severeImpact);

  impact.severeCasesByRequestedTime = eSevereCases(impact);
  severeImpact.severeCasesByRequestedTime = eSevereCases(severeImpact);

  impact.hospitalBedsByRequestedTime = eAvailableBeds(data, impact);
  severeImpact.hospitalBedsByRequestedTime = eAvailableBeds(data, severeImpact);

  impact.casesForICUByRequestedTime = eCasesForICU(impact);
  severeImpact.casesForICUByRequestedTime = eCasesForICU(severeImpact);

  impact.casesForVentilatorsByRequestedTime = eCasesForVentilators(impact);
  severeImpact.casesForVentilatorsByRequestedTime = eCasesForVentilators(severeImpact);

  impact.dollarsInFlight = eDollarsInFlight(impact, data.region, data);
  severeImpact.dollarsInFlight = eDollarsInFlight(severeImpact, data.region, data);

  return {
    data, 
    impact, 
    severeImpact
  }
};

export default covid19ImpactEstimator;
