#include "map_viewport_controller.h"

MapViewportController::MapViewportController(QObject *parent)
    : QObject(parent) {}

double MapViewportController::cursorLatitude() const {
  return m_cursorLatitude;
}

double MapViewportController::cursorLongitude() const {
  return m_cursorLongitude;
}

void MapViewportController::setCursorLatitude(double newCursorLatitude) {
  if (qFuzzyCompare(m_cursorLatitude, newCursorLatitude)) return;
  m_cursorLatitude = newCursorLatitude;
  emit cursorLatitudeChanged();
}

void MapViewportController::setCursorLongitude(double newCursorLongitude) {
  if (qFuzzyCompare(m_cursorLongitude, newCursorLongitude)) return;
  m_cursorLongitude = newCursorLongitude;
  emit cursorLongitudeChanged();
}
