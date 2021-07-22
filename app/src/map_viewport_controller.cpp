#include "map_viewport_controller.h"

#include <QSettings>

namespace viewport_settings {
constexpr char latitude[] = "viewport/latitude";
constexpr char longitude[] = "viewport/longitude";
constexpr char height[] = "viewport/height";
constexpr char heading[] = "viewport/heading";
constexpr char pitch[] = "viewport/pitch";

constexpr double defaultLatitude = 55.97101;
constexpr double defaultLongitude = 37.10610;
constexpr double defaultHeight = 400;
constexpr double defaultHeading = 0.0;
constexpr double defaultPitch = -15.0;
}  // namespace viewport_settings

Coordinate::Coordinate(QObject *parent) : QObject(parent) {}

bool Coordinate::isValid() const {
  return !qIsNaN(latitude) && !qIsNaN(longitude);
}

void Coordinate::invalidate() {
  latitude = qQNaN();
  longitude = qQNaN();
  height = 0;

  emit changed();
}

MapViewportController::MapViewportController(QObject *parent)
    : QObject(parent),
      cursorPosition(new Coordinate(this)),
      position(new Coordinate(this)) {}

void MapViewportController::save() {
  if (!position->isValid()) return;

  QSettings settings;

  settings.setValue(::viewport_settings::latitude, position->latitude);
  settings.setValue(::viewport_settings::longitude, position->longitude);
  settings.setValue(::viewport_settings::height, position->height);
  settings.setValue(::viewport_settings::heading, heading);
  settings.setValue(::viewport_settings::pitch, pitch);
}

void MapViewportController::restore() {
  QSettings settings;

  double latitude = settings
                        .value(::viewport_settings::latitude,
                               ::viewport_settings::defaultLatitude)
                        .toReal();
  double longitude = settings
                         .value(::viewport_settings::longitude,
                                ::viewport_settings::defaultLongitude)
                         .toReal();
  double height = settings
                      .value(::viewport_settings::height,
                             ::viewport_settings::defaultHeight)
                      .toReal();
  double heading = settings
                       .value(::viewport_settings::heading,
                              ::viewport_settings::defaultHeading)
                       .toReal();
  double pitch =
      settings
          .value(::viewport_settings::pitch, ::viewport_settings::defaultPitch)
          .toReal();

  emit flyTo(latitude, longitude, height, heading, pitch);
}
