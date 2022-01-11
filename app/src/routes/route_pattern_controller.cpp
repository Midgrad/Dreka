#include "route_pattern_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RoutePatternController::RoutePatternController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    Q_ASSERT(m_routesService);
}
