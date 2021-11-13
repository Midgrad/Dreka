var EQUATORIAL_RADIUS = 6378137.0;

// All in radians
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
