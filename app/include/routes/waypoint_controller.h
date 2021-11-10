#ifndef WAYPOINT_CONTROLLER_H
#define WAYPOINT_CONTROLLER_H

#include "i_routes_repository.h"

#include <QJsonArray>

namespace md::presentation
{
class WaypointController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject waypoint READ waypoint NOTIFY waypointChanged)
    Q_PROPERTY(int waypointIndex READ waypointIndex NOTIFY waypointChanged)
    Q_PROPERTY(int waypointsCount READ waypointsCount NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray waypointTypes READ waypointTypes NOTIFY routeChanged)
    Q_PROPERTY(QJsonArray waypointItemTypes READ waypointItemTypes NOTIFY waypointChanged)
    Q_PROPERTY(QJsonArray waypointParameters READ waypointParameters NOTIFY waypointChanged)

public:
    explicit WaypointController(QObject* parent = nullptr);

    QJsonObject waypoint() const;
    int waypointIndex() const;
    int waypointsCount() const;

    QJsonArray waypointTypes() const;
    QJsonArray waypointItemTypes() const;

    QJsonArray waypointParameters() const;

public slots:
    void invokeWaypointMenu(const QVariant& routeId, int index, double x, double y);
    void setWaypoint(const QVariant& routeId, int index);
    void setWaypointIndex(int index);

    void changeWaypointType(const QString& typeId);
    void setWaypointPosition(double latitude, double longitude, float altitude);
    void setWaypointParameter(const QString& parameterId, const QVariant& value);
    void remove();

signals:
    void waypointChanged();
    void routeChanged();

    void invokeMenu(double x, double y);

private:
    domain::IRoutesRepository* const m_routesRepository;
    domain::Route* m_route = nullptr;
    domain::Waypoint* m_waypoint = nullptr;
};
} // namespace md::presentation

#endif // WAYPOINT_CONTROLLER_H
