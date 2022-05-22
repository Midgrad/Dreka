#include "mission_route_item_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionRouteItemController::MissionRouteItemController(QObject* parent) :
    QObject(parent),
    m_missions(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missions);
}

QVariant MissionRouteItemController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

int MissionRouteItemController::inRouteIndex() const
{
    return m_inRouteIndex;
}

QVariantMap MissionRouteItemController::routeItem() const
{
    if (!m_routeItem)
        return QVariantMap();

    return m_routeItem->toVariantMap();
}

QVariantList MissionRouteItemController::itemTypes() const
{
    if (!m_mission)
        return QVariantList();

    QVariantList list;
    for (auto itemType : m_mission->type()->itemTypes)
    {
        list.append(itemType->toVariantMap());
    }
    return list;
}

QVariantList MissionRouteItemController::typeParameters() const
{
    if (!m_routeItem)
        return QVariantList();

    QVariantList list;
    for (auto parameter : m_routeItem->type()->parameters.values())
    {
        list.append(parameter->toVariantMap());
    }
    return list;
}

QVariantMap MissionRouteItemController::itemParameters() const
{
    if (!m_routeItem)
        return QVariantMap();

    return m_routeItem->parametersMap();
}

void MissionRouteItemController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missions->mission(missionId);

    if (m_mission)
    {
        disconnect(m_mission->route(), nullptr, this, nullptr);
    }

    if (m_mission == mission)
        return;

    m_mission = mission;

    if (m_mission)
    {
        // FIXME: external item select
        connect(m_mission->route(), &MissionRoute::itemRemoved, this,
                [this](int index, domain::MissionRouteItem* item) {
                    if (m_routeItem == item)
                        this->setRouteIndex(index - 1);
                });
    }

    emit missionChanged();

    this->setRouteIndex(mission && mission->route()->count() ? 0 : -1);
}

void MissionRouteItemController::setRouteIndex(int inRouteIndex)
{
    MissionRouteItem* item = m_mission->route()->item(inRouteIndex);

    if (m_inRouteIndex == inRouteIndex && m_routeItem == item)
        return;

    if (m_routeItem)
    {
        disconnect(m_routeItem, nullptr, this, nullptr);
    }

    m_routeItem = item;
    m_inRouteIndex = inRouteIndex;

    if (m_routeItem)
    {
        connect(m_routeItem, &MissionRouteItem::changed, this,
                &MissionRouteItemController::routeItemChanged);
    }

    emit routeItemChanged();
}

void MissionRouteItemController::remove()
{
    if (!m_routeItem || !m_mission)
        return;

    m_mission->route()->removeItem(m_routeItem);
    m_missions->saveMission(m_mission);
}

void MissionRouteItemController::rename(const QString& name)
{
    if (!m_routeItem || !m_mission)
        return;

    m_routeItem->name = name;
    m_missions->saveItem(m_mission->route, m_routeItem);
}

void MissionRouteItemController::changeItemType(const QString& typeId)
{
    if (!m_routeItem || !m_mission)
        return;

    const MissionItemType* type = m_mission->type()->itemType(typeId);
    if (!type || m_routeItem->type() == type)
        return;

    m_routeItem->setType(type);
    m_missions->saveItem(m_mission->route, m_routeItem);
}

void MissionRouteItemController::setPosition(const QVariantMap& position)
{
    if (!m_routeItem || !m_mission)
        return;

    m_routeItem->position.set(Geodetic(position));
    m_missions->saveItem(m_mission->route, m_routeItem);
}

void MissionRouteItemController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_routeItem || !m_mission)
        return;

    m_routeItem->parameter(parameterId)->setValue(value);
    m_missions->saveItem(m_mission->route, m_routeItem);
}

void MissionRouteItemController::addNewItem(const QString& typeId, const QVariantMap& position)
{
    if (!m_mission)
        return;

    const MissionItemType* type = m_mission->type()->itemType(typeId);
    if (!type)
        return;

    MissionRoute* route = m_mission->route();

    // Special case for altitude
    QVariantMap parameters = type->defaultParameters();
    int count = route->count();
    float altitude = count ? route->item(count - 1)->position().altitude()
                           : position.value(geo::altitude, 0).toFloat();
    QVariantMap newPosition = position;
    newPosition[geo::altitude] = altitude;

    MissionRouteItem* item = new MissionRouteItem(type, type->shortName, utils::generateId(),
                                                  parameters, newPosition);
    item->setParameters(parameters);
    route->addItem(item);

    m_missions->saveItem(route, item);
    this->setRouteIndex(count);
}
