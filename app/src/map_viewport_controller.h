#ifndef MAP_CONTROLLER_H
#define MAP_CONTROLLER_H

#include <QObject>

class MapViewportController : public QObject {
  Q_OBJECT

  Q_PROPERTY(double cursorLatitude READ cursorLatitude WRITE setCursorLatitude
                 NOTIFY cursorLatitudeChanged)
  Q_PROPERTY(double cursorLongitude READ cursorLongitude WRITE
                 setCursorLongitude NOTIFY cursorLongitudeChanged)
 public:
  explicit MapViewportController(QObject* parent = nullptr);

  double cursorLatitude() const;
  double cursorLongitude() const;

 public slots:
  void setCursorLatitude(double newCursorLatitude);
  void setCursorLongitude(double newCursorLongitude);

 signals:
  void cursorLatitudeChanged();
  void cursorLongitudeChanged();

  Q_INVOKABLE void flyTo(double latitude, double longitude, float height,
                         float heading, float pitch);

 private:
  double m_cursorLatitude = qQNaN();
  double m_cursorLongitude = qQNaN();
};

#endif  // MAP_CONTROLLER_H
