#ifndef MAP_RULER_CONTROLLER_H
#define MAP_RULER_CONTROLLER_H

#include <QObject>

namespace md::presentation
{
class MapRulerController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool rulerMode MEMBER rulerMode NOTIFY rulerModeChanged)
    Q_PROPERTY(float distance MEMBER distance NOTIFY distanceChanged)
    Q_PROPERTY(bool empty READ isEmpty NOTIFY distanceChanged)

public:
    explicit MapRulerController(QObject* parent = nullptr);

    bool rulerMode = false;
    float distance = 0;

    bool isEmpty() const;

signals:
    void rulerModeChanged();
    void distanceChanged();

    Q_INVOKABLE void clear();
};
} // namespace dreka::presentation

#endif // MAP_RULER_CONTROLLER_H
