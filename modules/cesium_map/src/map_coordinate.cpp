#include "map_coordinate.h"

MapCoordinate::MapCoordinate(double latitude, double longitude, float height,
                             QObject *parent)
    : QObject(parent),
      latitude(latitude),
      longitude(longitude),
      height(height) {}

MapCoordinate::MapCoordinate(QObject *parent)
    : MapCoordinate(qQNaN(), qQNaN(), 0, parent) {}

bool MapCoordinate::isValid() const {
  return !qIsNaN(latitude) && !qIsNaN(longitude);
}

void MapCoordinate::invalidate() {
  latitude = qQNaN();
  longitude = qQNaN();
  height = 0;

  emit changed();
}
