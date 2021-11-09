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
    RouteItem* waypoint = nullptr;
    m_route = m_routesRepository->route(routeId);
    if (m_route)
    {
        waypoint = m_route->waypoint(index);
    }

    if (m_waypoint == waypoint)
        return;

    m_waypoint = waypoint;
    emit waypointChanged();
}

void WaypointController::remove()
{
    if (!m_route || !m_waypoint)
        return;

    m_route->removeWaypoint(m_waypoint);
    m_routesRepository->saveRoute(m_route);
}
