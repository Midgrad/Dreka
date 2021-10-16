#ifndef MAP_VIEWPORT_CONTROLLER_H
#define MAP_VIEWPORT_CONTROLLER_H

#include <QObject>

#include "geodetic.h"

namespace md::presentation
{
class MapViewportController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject cursorPosition READ cursorPosition WRITE setCursorPosition NOTIFY
                   cursorPositionChanged)
    Q_PROPERTY(QJsonObject centerPosition READ centerPosition WRITE setCenterPosition NOTIFY
                   centerPositionChanged)
    Q_PROPERTY(QJsonObject cameraPosition READ cameraPosition WRITE setCameraPosition NOTIFY
                   cameraPositionChanged)

    Q_PROPERTY(float heading READ heading WRITE setHeading NOTIFY headingChanged)
    Q_PROPERTY(float pitch READ pitch WRITE setPitch NOTIFY pitchChanged)
    Q_PROPERTY(double pixelScale READ pixelScale WRITE setPixelScale NOTIFY pixelScaleChanged)

public:
    explicit MapViewportController(QObject* parent = nullptr);

    QJsonObject cursorPosition() const;
    QJsonObject centerPosition() const;
    QJsonObject cameraPosition() const;

    float heading() const;
    float pitch() const;
    double pixelScale() const;

public slots:
    void setCursorPosition(const QJsonObject& cursorPosition);
    void setCenterPosition(const QJsonObject& centerPosition);
    void setCameraPosition(const QJsonObject& cameraPosition);

    void setHeading(float heading);
    void setPitch(float pitch);
    void setPixelScale(double pixelScale);

    void save();
    void restore();

signals:
    void cursorPositionChanged();
    void centerPositionChanged();
    void cameraPositionChanged();

    void headingChanged();
    void pitchChanged();
    void pixelScaleChanged();

    void flyTo(QJsonObject center, float heading, float pitch, float duration = 0.0);
    void lookTo(float heading, float pitch, float duration = 0.0);

private:
    md::domain::Geodetic m_cursorPosition;
    md::domain::Geodetic m_centerPosition;
    md::domain::Geodetic m_cameraPosition;

    float m_heading = qQNaN();
    float m_pitch = qQNaN();
    double m_pixelScale = 0.0;
};
} // namespace md::presentation

#endif // MAP_VIEWPORT_CONTROLLER_H
