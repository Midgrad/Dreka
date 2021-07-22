#ifndef MAP_VIEWPORT_CONTROLLER_H
#define MAP_VIEWPORT_CONTROLLER_H

#include "map_coordinate.h"

class MapViewportController : public QObject {
  Q_OBJECT

  Q_PROPERTY(MapCoordinate* cursorPosition MEMBER cursorPosition CONSTANT)
  Q_PROPERTY(MapCoordinate* position MEMBER position CONSTANT)

  Q_PROPERTY(float heading MEMBER heading NOTIFY headingChanged)
  Q_PROPERTY(float pitch MEMBER pitch NOTIFY pitchChanged)

  Q_PROPERTY(
      double metersInPixel MEMBER metersInPixel NOTIFY metersInPixelChanged)

 public:
  explicit MapViewportController(QObject* parent = nullptr);

  MapCoordinate* const cursorPosition;
  MapCoordinate* const position;

  float heading = qQNaN();
  float pitch = qQNaN();
  double metersInPixel = 0.0;

 public slots:
  void save();
  void restore();

 signals:
  void headingChanged();
  void pitchChanged();
  void metersInPixelChanged();

  void flyTo(double latitude, double longitude, float height, float heading,
             float pitch, float duration = 0.0);
  void lookTo(float heading, float pitch, float duration = 0.0);
};

#endif  // MAP_VIEWPORT_CONTROLLER_H
