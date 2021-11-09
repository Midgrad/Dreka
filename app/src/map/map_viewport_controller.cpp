#include "map_viewport_controller.h"

#include <QDebug>
#include <QSettings>

namespace viewport_settings
{
constexpr char camera[] = "viewport/camera";
constexpr char heading[] = "viewport/heading";
constexpr char pitch[] = "viewport/pitch";

const md::domain::Geodetic deafultCamera(55.97101, 37.10610, 400.0);
constexpr float defaultHeading = 0.0;
constexpr float defaultPitch = -15.0;
} // namespace viewport_settings

using namespace md::presentation;

MapViewportController::MapViewportController(QObject* parent) : QObject(parent)
{
}

QJsonObject MapViewportController::cursorPosition() const
{
    return QJsonObject::fromVariantMap(m_cursorPosition.toVariantMap());
}

QJsonObject MapViewportController::centerPosition() const
{
    return QJsonObject::fromVariantMap(m_centerPosition.toVariantMap());
}

QJsonObject MapViewportController::cameraPosition() const
{
    return QJsonObject::fromVariantMap(m_cameraPosition.toVariantMap());
}

float MapViewportController::heading() const
{
    return m_heading;
}

float MapViewportController::pitch() const
{
    return m_pitch;
}

double MapViewportController::pixelScale() const
{
    return m_pixelScale;
}

void MapViewportController::save()
{
    if (!m_cameraPosition.isValid())
        return;

    QSettings settings;

    settings.setValue(::viewport_settings::camera, m_cameraPosition.toVariantMap());
    settings.setValue(::viewport_settings::heading, m_heading);
    settings.setValue(::viewport_settings::pitch, m_pitch);
}

void MapViewportController::restore()
{
    QSettings settings;

    QVariantMap camera = settings.value(::viewport_settings::camera).toMap();
    if (camera.isEmpty())
        camera = ::viewport_settings::deafultCamera.toVariantMap();

    float heading =
        settings.value(::viewport_settings::heading, ::viewport_settings::defaultHeading).toReal();
    float pitch = settings.value(::viewport_settings::pitch, ::viewport_settings::defaultPitch)
                      .toReal();

    emit flyTo(QJsonObject::fromVariantMap(camera), heading, pitch);
}

void MapViewportController::setCursorPosition(const QJsonObject& cursorPosition)
{
    m_cursorPosition = md::domain::Geodetic(cursorPosition.toVariantMap());
    emit cursorPositionChanged();
}

void MapViewportController::setCenterPosition(const QJsonObject& centerPosition)
{
    m_centerPosition = md::domain::Geodetic(centerPosition.toVariantMap());
    emit centerPositionChanged();
}

void MapViewportController::setCameraPosition(const QJsonObject& cameraPosition)
{
    m_cameraPosition = md::domain::Geodetic(cameraPosition.toVariantMap());
    emit cameraPositionChanged();
}

void MapViewportController::setHeading(float heading)
{
    if (qFuzzyCompare(m_heading, heading))
        return;

    m_heading = heading;
    emit headingChanged();
}

void MapViewportController::setPitch(float pitch)
{
    if (qFuzzyCompare(m_pitch, pitch))
        return;

    m_pitch = pitch;
    emit pitchChanged();
}

void MapViewportController::setPixelScale(double pixelScale)
{
    if (qFuzzyCompare(m_pixelScale, pixelScale))
        return;

    m_pixelScale = pixelScale;
    emit pixelScaleChanged();
}
