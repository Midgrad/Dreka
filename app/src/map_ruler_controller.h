#ifndef MAP_RULER_CONTROLLER_H
#define MAP_RULER_CONTROLLER_H

#include <QObject>

class MapRulerController : public QObject {
  Q_OBJECT

  Q_PROPERTY(bool rulerMode MEMBER rulerMode NOTIFY rulerModeChanged)
  Q_PROPERTY(float distance MEMBER distance NOTIFY distanceChanged)
  Q_PROPERTY(bool empty MEMBER empty NOTIFY emptyChanged)

 public:
  explicit MapRulerController(QObject* parent = nullptr);

  bool rulerMode = false;
  float distance = 0;
  bool empty = true;

 signals:
  void rulerModeChanged();
  void distanceChanged();
  void emptyChanged();

  Q_INVOKABLE void clear();
};

#endif  // MAP_RULER_CONTROLLER_H
