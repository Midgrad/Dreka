#include "map_viewport_controller.h"

Coordinate::Coordinate(QObject *parent) : QObject(parent) {}

bool Coordinate::isValid() const {
  return !qIsNaN(latitude) && !qIsNaN(longitude);
}

void Coordinate::invalidate() {
  latitude = qQNaN();
  longitude = qQNaN();

  emit changed();
}

MapViewportController::MapViewportController(QObject *parent)
    : QObject(parent), cursorPosition(new Coordinate(this)) {}
