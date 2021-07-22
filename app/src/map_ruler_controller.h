#ifndef MAP_RULER_CONTROLLER_H
#define MAP_RULER_CONTROLLER_H

#include "map_coordinate.h"

class MapRulerController : public QObject {
  Q_OBJECT

  Q_PROPERTY(QList<MapCoordinate*> coordinates MEMBER coordinates NOTIFY
                 coordinatesChanged)
  Q_PROPERTY(double rulerMode MEMBER rulerMode NOTIFY rulerModeChanged)

 public:
  explicit MapRulerController(QObject* parent = nullptr);

  QList<MapCoordinate*> coordinates;
  bool rulerMode = false;

 public slots:
  void addPoint(double latitude, double longitude, float height,
                int index = INT_MAX);
  void removePoint(int index);

 signals:
  void coordinatesChanged();
  void rulerModeChanged();
};

#endif  // MAP_RULER_CONTROLLER_H
