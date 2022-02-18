#include "route_menu_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RouteMenuController::RouteMenuController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    connect(m_routesService, &IRoutesService::routeRemoved, this, [this](Route* route) {
        if (m_route != route)
            return;

        m_route = nullptr;
        m_routeItem = nullptr;
        emit routeItemChanged();
    });
}

bool RouteMenuController::canGoto() const
{
    return m_route && m_routeItem && m_route->block().length() && !m_routeItem->current();
}

QVariant RouteMenuController::route() const
{
    return m_route ? m_route->id() : QVariant();
}

int RouteMenuController::inRouteIndex() const
{
    if (!m_route || !m_routeItem)
        return -1;

    return m_route->index(m_routeItem);
}

void RouteMenuController::invokeMenu(const QVariant& routeId, int index, double x, double y)
{
    m_route = m_routesService->route(routeId);
    m_routeItem = m_route ? m_route->item(index) : nullptr;

    emit routeItemChanged();

    if (m_routeItem)
        emit menuInvoked(x, y);
}

void RouteMenuController::drop()
{
    emit dropped();
}

void RouteMenuController::remove()
{
    if (!m_route || !m_routeItem)
        return;

    m_route->removeItem(m_routeItem);
    m_routesService->saveRoute(m_route);
}

void RouteMenuController::gotoItem()
{
    if (!m_routeItem)
        return;

    emit m_routeItem->goTo();
}
