#include "map_coordinate.h"

MapCoordinate::MapCoordinate(QObject *parent) : QObject(parent) {}

bool MapCoordinate::isValid() const {
  return !qIsNaN(latitude) && !qIsNaN(longitude);
}

void MapCoordinate::invalidate() {
  latitude = qQNaN();
  longitude = qQNaN();
  height = 0;

  emit changed();
}
