#include "route_item_edit_controller.h"

#include <QDebug>

#include "locator.h"
#include "route_traits.h"

using namespace md::domain;
using namespace md::presentation;

RouteItemEditController::RouteItemEditController(QObject* parent) :
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

bool RouteItemEditController::canGoto() const
{
    return m_route && m_routeItem && m_route->block().length() && !m_routeItem->current();
}

QJsonObject RouteItemEditController::routeItem() const
{
    if (!m_routeItem)
        return QJsonObject();

    QVariantMap routeItem = m_routeItem->toVariantMap();

    if (m_route)
        routeItem.insert(props::route, m_route->id);

    return QJsonObject::fromVariantMap(routeItem);
}

int RouteItemEditController::inRouteIndex() const
{
    if (!m_route || !m_routeItem)
        return -1;

    return m_route->index(m_routeItem);
}

int RouteItemEditController::routeItemsCount() const
{
    if (!m_route)
        return -1;

    return m_route->count();
}

QJsonArray RouteItemEditController::itemTypes() const
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

QJsonObject RouteItemEditController::itemParameters() const
{
    if (!m_routeItem)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_routeItem->parametersMap());
}

QJsonArray RouteItemEditController::typeParameters(const QString& typeId)
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

void RouteItemEditController::invokeMenu(const QVariant& routeId, int index, double x, double y)
{
    this->setRouteItem(routeId, index);

    if (m_routeItem)
        emit menuInvoked(x, y);
}

void RouteItemEditController::setRouteItem(const QVariant& routeId, int index)
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

void RouteItemEditController::setIndex(int index)
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
        connect(m_routeItem, &RouteItem::changed, this, &RouteItemEditController::routeItemChanged);
    }
    else
    {
        emit itemSelected(QVariant(), index);
        emit closeEditor();
    }

    emit routeItemChanged();
}

void RouteItemEditController::updatePopupPosition(double x, double y)
{
    emit updatePosition(x, y);
}

void RouteItemEditController::rename(const QString& name)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->name = name;
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemEditController::changeItemType(const QString& typeId)
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

void RouteItemEditController::setPosition(double latitude, double longitude, float altitude)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->position.set(Geodetic(latitude, longitude, altitude));
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemEditController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_route || !m_routeItem)
        return;

    m_routeItem->parameter(parameterId)->setValue(value);
    m_routesService->saveItem(m_route, m_routeItem);
}

void RouteItemEditController::remove()
{
    if (!m_route || !m_routeItem)
        return;

    m_route->removeItem(m_routeItem);
    m_routesService->saveRoute(m_route);
}

void RouteItemEditController::gotoItem()
{
    if (!m_routeItem)
        return;

    emit m_routeItem->goTo();
}
