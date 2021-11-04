#include "waypoint_edit_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

WaypointEditController::WaypointEditController(QObject* parent) :
    QObject(parent),
    m_routesRepository(md::app::Locator::get<IRoutesRepository>())
{
}
