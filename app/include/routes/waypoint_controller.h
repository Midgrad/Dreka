#ifndef WAYPOINT_CONTROLLER_H
#define WAYPOINT_CONTROLLER_H

#include "i_routes_repository.h"

namespace md::presentation
{
class WaypointController : public QObject
{
    Q_OBJECT

public:
    explicit WaypointController(QObject* parent = nullptr);

public slots:
    void invokeWaypointMenu(const QVariant& routeId, int index, double x, double y);
    void setWaypoint(const QVariant& routeId, int index);
    void remove();

signals:
    void waypointChanged();

    void invokeMenu(double x, double y);

private:
    domain::IRoutesRepository* const m_routesRepository;
    domain::Route* m_route = nullptr;
    domain::Waypoint* m_waypoint = nullptr;
};
} // namespace md::presentation

#endif // WAYPOINT_CONTROLLER_H
