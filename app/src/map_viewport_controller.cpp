#include "map_viewport_controller.h"

MapViewportController::MapViewportController(QObject *parent)
    : QObject(parent) {}

double MapViewportController::cursorLatitude() const {
  return m_cursorLatitude;
}

double MapViewportController::cursorLongitude() const {
  return m_cursorLongitude;
}

double MapViewportController::heading() const { return m_heading; }
double MapViewportController::pitch() const { return m_pitch; }

void MapViewportController::setCursorLatitude(double cursorLatitude) {
  if (qFuzzyCompare(m_cursorLatitude, cursorLatitude)) return;
  m_cursorLatitude = cursorLatitude;
  emit cursorLatitudeChanged();
}

void MapViewportController::setCursorLongitude(double cursorLongitude) {
  if (qFuzzyCompare(m_cursorLongitude, cursorLongitude)) return;
  m_cursorLongitude = cursorLongitude;
  emit cursorLongitudeChanged();
}

void MapViewportController::setHeading(double heading) {
  if (qFuzzyCompare(m_heading, heading)) return;
  m_heading = heading;
  emit headingChanged();
}

void MapViewportController::setPitch(double pitch) {
  if (qFuzzyCompare(m_pitch, pitch)) return;
  m_pitch = pitch;
  emit pitchChanged();
}
