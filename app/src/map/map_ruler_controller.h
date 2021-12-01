#ifndef MAP_RULER_CONTROLLER_H
#define MAP_RULER_CONTROLLER_H

#include <QObject>

namespace md::presentation
{
class MapRulerController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool rulerMode READ rulerMode WRITE setRulerMode NOTIFY rulerModeChanged)
    Q_PROPERTY(float distance READ distance WRITE setDistance NOTIFY distanceChanged)
    Q_PROPERTY(bool empty READ isEmpty NOTIFY distanceChanged)

public:
    explicit MapRulerController(QObject* parent = nullptr);

    bool rulerMode() const;
    float distance() const;
    bool isEmpty() const;

public slots:
    void setRulerMode(bool rulerMode);
    void setDistance(float distance);
    void clear();

signals:
    void rulerModeChanged(bool rulerMode);
    void distanceChanged(float distance);

    void cleared();

private:
    bool m_rulerMode = false;
    float m_distance = 0.0;
};
} // namespace md::presentation

#endif // MAP_RULER_CONTROLLER_H
