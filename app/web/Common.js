var EQUATORIAL_RADIUS = 6378137.0;

// Get new coordinates by the distance and beraing, all data in radians
function projectPoint(latitude, longitude, altitude, bearing, distance)
{
    let angDisRad = distance / EQUATORIAL_RADIUS;
    let sinLat2 = Math.sin(latitude) * Math.cos(angDisRad) + Math.cos(latitude) *
                  Math.sin(angDisRad) * Math.cos(bearing);
    let resultLatitude = Math.asin(sinLat2);
    let y = Math.sin(bearing) * Math.sin(angDisRad) * Math.cos(latitude);
    let x = Math.cos(angDisRad) - Math.sin(latitude) * sinLat2;
    let resultLongitude = longitude + Math.atan2(y, x);

    return Cesium.Cartesian3.fromRadians(resultLongitude, resultLatitude, altitude);
}

// Get new cartesian3 between first and second
function intermediate(first, second) {
    var scratch = new Cesium.Cartesian3();

    var difference = Cesium.Cartesian3.subtract(first, second, scratch);
    var distance = -0.5 * Cesium.Cartesian3.magnitude(difference);
    var direction = Cesium.Cartesian3.normalize(difference, scratch);

    return Cesium.Cartesian3.add(first, Cesium.Cartesian3.multiplyByScalar(
                                        direction, distance, scratch), scratch);
}
