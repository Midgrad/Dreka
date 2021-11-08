#include "waypoint_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

WaypointController::WaypointController(QObject* parent) :
    QObject(parent),
    m_routesRepository(md::app::Locator::get<IRoutesRepository>())
{
}

void WaypointController::invokeWaypointMenu(const QVariant& routeId, int index, double x, double y)
{
    this->setWaypoint(routeId, index);

    if (m_waypoint)
        emit invokeMenu(x, y);
}

void WaypointController::setWaypoint(const QVariant& routeId, int index)
{
    Waypoint* waypoint = nullptr;
    Route* route = m_routesRepository->route(routeId);
    if (route)
    {
        waypoint = route->waypoint(index);
    }

    if (m_waypoint == waypoint)
        return;

    m_waypoint = waypoint;
    emit waypointChanged();
}
