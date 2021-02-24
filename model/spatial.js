const pgConfig = require('./pgConfig');
const pg = require('pg');
const pool = new pg.Pool(pgConfig);

let spatial = {
  // 动态矢量切片
  getMvt: function (req, res, next) {
    let txyz = {
      x: parseInt(req.url.split('/')[3]),
      y: parseInt(req.url.split('/')[4]),
      z: parseInt(req.url.split('/')[2]),
    }
    let [xmin, ymin] = xyz2lonlat(txyz.x, txyz.y, txyz.z)
    let [xmax, ymax] = xyz2lonlat(txyz.x + 1, txyz.y + 1, txyz.z)
    // point
    let sql1 =
      ` 
      SELECT  ST_AsMVT(P,'point',4096,'geom') AS "mvt"
      FROM
      (
	      SELECT  ST_AsMVTGeom(ST_Transform(geom,3857),ST_Transform(ST_MakeEnvelope (${xmin},${ymin},${xmax},${ymax},4326),3857),4096,64,TRUE) geom
	      FROM "osm_pois_pt" 
      ) AS P
      `

    // polyline
    let sql2 =
      ` 
      SELECT  ST_AsMVT ( P,'line',4096,'geom' ) AS "mvt"
      FROM
      (
	      SELECT  ST_AsMVTGeom (ST_Transform (geom, 3857 ),ST_Transform (ST_MakeEnvelope ( ${xmin},${ymin},${xmax},${ymax},4326 ),3857),4096,64,TRUE ) geom
	      FROM "osm_roads_ln" 
      ) AS P 
      `

    // polygon
    let sql3 =
      ` 
      SELECT  ST_AsMVT ( P,'polygon',4096,'geom' ) AS "mvt"
      FROM
      (
	      SELECT  ST_AsMVTGeom (ST_Transform (ST_Simplify(geom, 0.0),3857 ),ST_Transform (ST_MakeEnvelope ( ${xmin},${ymin},${xmax},${ymax},4326 ),3857),4096,64,TRUE ) geom
	      FROM "osm_landuse_pn" 
      ) AS P
      `

    let SQL = `SELECT (${sql1})||(${sql2})||(${sql3}) AS mvt`;
    pool.connect((isErr, client, done) => {
      client.query(
        SQL,
        function (isErr, result) {
          done();
          if (isErr) {
            res.json(isErr);
          } else {
            res.send(result.rows[0].mvt);
          }
        }
      );
    })
  },
};

/**
 * 瓦片编号转经纬度
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z
 */
function xyz2lonlat (x, y, z) {
  const n = Math.pow(2, z);
  const lon_deg = (x / n) * 360.0 - 180.0;
  const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat_deg = (180 * lat_rad) / Math.PI;
  return [lon_deg, lat_deg];
}

/**
 * 查询结果转geojson
 * @param {Object} rows 
 */
function rows2geojson (rows) {
  let geojson = {
    type: "FeatureCollection",
    features: []
  }
  rows.forEach(row => {
    let feature = {
      type: "Feature",
      properties: {},
      geometry: null
    };
    for (let item in row) {
      if (item === "geometry") {
        feature.geometry = JSON.parse(row[item])
      } else if (item !== "geom") {
        feature.properties[item] = row[item]
      }
    }
    geojson.features.push(feature)
  })
  return geojson
}

module.exports = spatial

