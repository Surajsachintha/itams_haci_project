const db = require('../config/db');

exports.fetchStationIdForUnit = (unitId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT station_id FROM code_stations WHERE unit_id = ?`;
    
    db.query(query, [unitId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        const stationIds = result.map(row => row.station_id);
        resolve(stationIds);
      }
    });
  });
};
