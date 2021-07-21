#ifndef MAP_VIEWPORT_CONTROLLER_H
#define MAP_VIEWPORT_CONTROLLER_H

#include <QObject>

class Coordinate : public QObject {
  Q_OBJECT

  Q_PROPERTY(double latitude MEMBER latitude NOTIFY changed)
  Q_PROPERTY(double longitude MEMBER longitude NOTIFY changed)
  Q_PROPERTY(bool valid READ isValid NOTIFY changed)

 public:
  explicit Coordinate(QObject* parent = nullptr);

  double latitude = qQNaN();
  double longitude = qQNaN();

  bool isValid() const;

 public slots:
  void invalidate();

 signals:
  void changed();
};

class MapViewportController : public QObject {
  Q_OBJECT

  Q_PROPERTY(Coordinate* cursorPosition MEMBER cursorPosition CONSTANT)
  Q_PROPERTY(double heading MEMBER heading NOTIFY headingChanged)
  Q_PROPERTY(double pitch MEMBER pitch NOTIFY pitchChanged)

 public:
  explicit MapViewportController(QObject* parent = nullptr);

  double heading = qQNaN();
  double pitch = qQNaN();

  Coordinate* const cursorPosition;

 signals:
  void headingChanged();
  void pitchChanged();

  void flyTo(double latitude, double longitude, float height, float heading,
             float pitch, float duration = 0.0);
  void headingTo(double heading, float duration = 0.0);
};

#endif  // MAP_VIEWPORT_CONTROLLER_H
