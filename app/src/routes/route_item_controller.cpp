#include "route_item_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RouteItemController::RouteItemController(QObject* parent) :
    QObject(parent),
    m_routesService(md::app::Locator::get<IRoutesService>())
{
    connect(m_routesService, &IRoutesService::routeRemoved, this, [this](Route* route) {
        if (m_route != route)
            return;

        m_route = nullptr;
        emit routeChanged();
        this->setIndex(-1);
    });
}

QJsonObject RouteItemController::routeItem() const
{
    if (!m_routeItem)
        return QJsonObject();

    QVariantMap routeItem = m_routeItem->toVariantMap();

    if (m_route)
        routeItem.insert(props::route, m_route->id);

    return QJsonObject::fromVariantMap(routeItem);
}

int RouteItemController::inRouteIndex() const
{
    if (!m_route || !m_routeItem)
        return -1;

    return m_route->index(m_routeItem);
}

int RouteItemController::routeItemsCount() const
{
    if (!m_route)
        return -1;

    return m_route->count();
}

QJsonArray RouteItemController::itemTypes() const
{
    if (!m_route)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : m_route->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

QJsonObject RouteItemController::itemParameters() const
{
    if (!m_routeItem)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_routeItem->parameters());
}

QJsonArray RouteItemController::typeParameters(const QString& typeId)
{
    if (!m_routeItem)
        return QJsonArray();

    QJsonArray jsons;
    for (auto parameter : m_routeItem->type()->parameters.values())
    {
        jsons.append(QJsonObject::fromVariantMap(parameter->toVariantMap()));
    }

    return jsons;
}

void RouteItemController::invokeMenu(const QVariant& routeId, int index, double x, double y)
{
    this->setRouteItem(routeId, index);

    if (m_routeItem)
        emit menuInvoked(x, y);
}

void RouteItemController::setRouteItem(const QVariant& routeId, int index)
{
    Route* route = m_routesService->route(routeId);
    if (m_route != route)
    {
        if (m_route)
            disconnect(m_route, nullptr, this, nullptr);

        m_route = route;

        if (m_route)
        {
            connect(m_route, &Route::itemRemoved, this, [this](int index, RouteItem* routeItem) {
                if (m_routeItem == routeItem)
                    this->setIndex(-1);
            });
        }

        emit routeChanged();
    }

    this->setIndex(index);
}

void RouteItemController::setIndex(int index)
{
    RouteItem* routeItem = m_route ? m_route->item(index) : nullptr;

    if (m_routeItem == routeItem)
        return;

    if (m_routeItem)
        disconnect(m_routeItem, nullptr, this, nullptr);

    m_routeItem = routeItem;

    if (m_routeItem)
    {
        emit itemSelected(m_route->id, index);
        connect(m_routeItem, &RouteItem::changed, this, &RouteItemController::routeItemChanged);
    }
    else
    {
        emit itemSelected(QVariant(), index);
        emit closeEditor();
    }

    emit routeItemChanged();
}

void RouteItemController::updatePopupPosition(double x, double y)
{
    emit updatePosition(x, y);
}

void RouteItemController::rename(const QString& name)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->name = name;
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemController::changeItemType(const QString& typeId)
{
    if (!m_route || !m_routeItem)
        return;

    const RouteItemType* type = m_route->type()->itemType(typeId);
    if (!type)
        return;

    if (m_routeItem->type() == type)
        return;

    m_routeItem->setType(type);
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemController::setPosition(double latitude, double longitude, float altitude)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->position.set(Geodetic(latitude, longitude, altitude));
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->setAndCheckParameter(parameterId, value);
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemController::remove()
{
    if (!m_route || !m_routeItem)
        return;

    m_route->removeItem(m_routeItem);
    m_routesService->saveRoute(m_route);
}
