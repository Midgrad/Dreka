#include "map_ruler_controller.h"

MapRulerController::MapRulerController(QObject *parent) : QObject(parent) {}

void MapRulerController::addPoint(double latitude, double longitude,
                                  float height, int index) {
  coordinates.insert(index, new MapCoordinate());
  emit coordinatesChanged();
}

void MapRulerController::removePoint(int index) {
  if (index < 0 || index < coordinates.size()) return;

  coordinates.removeAt(index);
  emit coordinatesChanged();
}
