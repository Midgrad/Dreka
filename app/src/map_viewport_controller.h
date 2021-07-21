#ifndef MAP_CONTROLLER_H
#define MAP_CONTROLLER_H

#include <QObject>

class MapViewportController : public QObject {
  Q_OBJECT

  Q_PROPERTY(double cursorLatitude READ cursorLatitude WRITE setCursorLatitude
                 NOTIFY cursorLatitudeChanged)
  Q_PROPERTY(double cursorLongitude READ cursorLongitude WRITE
                 setCursorLongitude NOTIFY cursorLongitudeChanged)

  Q_PROPERTY(double heading READ heading WRITE setHeading NOTIFY headingChanged)
  Q_PROPERTY(double pitch READ pitch WRITE setPitch NOTIFY pitchChanged)

 public:
  explicit MapViewportController(QObject* parent = nullptr);

  double cursorLatitude() const;
  double cursorLongitude() const;
  double heading() const;
  double pitch() const;

 public slots:
  void setCursorLatitude(double cursorLatitude);
  void setCursorLongitude(double cursorLongitude);
  void setHeading(double heading);
  void setPitch(double pitch);

 signals:
  void cursorLatitudeChanged();
  void cursorLongitudeChanged();
  void headingChanged();
  void pitchChanged();

  void flyTo(double latitude, double longitude, float height, float heading,
             float pitch, float duration = 0.0);
  void headingTo(double heading, float duration = 0.0);

 private:
  double m_cursorLatitude = qQNaN();
  double m_cursorLongitude = qQNaN();
  double m_heading = qQNaN();
  double m_pitch = qQNaN();
};

#endif  // MAP_CONTROLLER_H
