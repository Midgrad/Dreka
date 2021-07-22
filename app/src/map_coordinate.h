#ifndef MAP_COORDINATE_H
#define MAP_COORDINATE_H

#include <QObject>

class MapCoordinate : public QObject {
  Q_OBJECT

  Q_PROPERTY(double latitude MEMBER latitude NOTIFY changed)
  Q_PROPERTY(double longitude MEMBER longitude NOTIFY changed)
  Q_PROPERTY(double height MEMBER height NOTIFY changed)
  Q_PROPERTY(bool valid READ isValid NOTIFY changed)

 public:
  explicit MapCoordinate(QObject* parent = nullptr);

  double latitude = qQNaN();
  double longitude = qQNaN();
  float height = 0;

  bool isValid() const;

 public slots:
  void invalidate();

 signals:
  void changed();
};

#endif  // MAP_COORDINATE_H
