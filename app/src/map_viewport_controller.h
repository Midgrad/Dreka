#ifndef MAP_VIEWPORT_CONTROLLER_H
#define MAP_VIEWPORT_CONTROLLER_H

#include <QObject>

#include "geodetic.h"

namespace dreka::endpoint
{
class MapViewportController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject cursorPosition READ cursorPosition WRITE setCursorPosition NOTIFY
                   cursorPositionChanged)
    Q_PROPERTY(QJsonObject centerPosition READ centerPosition WRITE setCenterPosition NOTIFY
                   centerPositionChanged)

    Q_PROPERTY(float heading MEMBER heading NOTIFY headingChanged)
    Q_PROPERTY(float pitch MEMBER pitch NOTIFY pitchChanged)

    Q_PROPERTY(double metersInPixel MEMBER metersInPixel NOTIFY metersInPixelChanged)

public:
    explicit MapViewportController(QObject* parent = nullptr);

    QJsonObject cursorPosition() const;
    QJsonObject centerPosition() const;

    float heading = qQNaN();
    float pitch = qQNaN();
    double metersInPixel = 0.0;

public slots:
    void setCursorPosition(const QJsonObject& cursorPosition);
    void setCenterPosition(const QJsonObject& centerPosition);

    void save();
    void restore();

signals:
    void cursorPositionChanged();
    void centerPositionChanged();

    void headingChanged();
    void pitchChanged();
    void metersInPixelChanged();

    void flyTo(double latitude, double longitude, float height, float heading, float pitch,
               float duration = 0.0);
    void lookTo(float heading, float pitch, float duration = 0.0);

private:
    jord::domain::Geodetic m_cursorPosition;
    jord::domain::Geodetic m_centerPosition;
};
} // namespace dreka::endpoint

#endif // MAP_VIEWPORT_CONTROLLER_H
