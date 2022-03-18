#include "mission_item_edit_controller.h"

#include <QDebug>

#include "locator.h"
#include "mission_traits.h"

using namespace md::domain;
using namespace md::presentation;

MissionItemEditController::MissionItemEditController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        if (m_mission != mission)
            return;

        m_mission = nullptr;
        emit missionChanged();
        this->setInRouteIndex(-1);
    });
}

QVariant MissionItemEditController::mission() const
{
    return m_mission ? m_mission->id() : QVariant();
}

int MissionItemEditController::inRouteIndex() const
{
    if (!m_mission || !m_routeItem)
        return -1;

    return m_mission->route()->index(m_routeItem);
}

QJsonObject MissionItemEditController::routeItem() const
{
    if (!m_routeItem)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_routeItem->toVariantMap());
}

int MissionItemEditController::routeItemsCount() const
{
    if (!m_mission)
        return -1;

    return m_mission->route()->count();
}

QJsonArray MissionItemEditController::itemTypes() const
{
    if (!m_mission)
        return QJsonArray();

    QJsonArray jsons;
    for (auto wptType : m_mission->type()->itemTypes)
    {
        jsons.append(QJsonObject::fromVariantMap(wptType->toVariantMap()));
    }
    return jsons;
}

QJsonObject MissionItemEditController::itemParameters() const
{
    if (!m_routeItem)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_routeItem->parametersMap());
}

QJsonArray MissionItemEditController::typeParameters(const QString& typeId)
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

void MissionItemEditController::setMission(const QVariant& missionId)
{
    Mission* mission = m_missionsService->mission(missionId);
    if (m_mission == mission)
        return;

    if (m_mission)
        disconnect(m_mission, nullptr, this, nullptr);

    m_mission = mission;

    if (mission)
    {
        connect(mission->route, &MissionRoute::itemRemoved, this,
                [this](int index, MissionRouteItem* routeItem) {
                    if (m_routeItem == routeItem)
                        this->setInRouteIndex(-1);
                    // To update index in route
                    emit routeItemChanged();
                });
    }

    emit missionChanged();
}

void MissionItemEditController::setInRouteIndex(int index)
{
    MissionRouteItem* routeItem = m_mission ? m_mission->route()->item(index) : nullptr;

    if (m_routeItem == routeItem)
        return;

    if (m_routeItem)
        disconnect(m_routeItem, nullptr, this, nullptr);

    m_routeItem = routeItem;

    if (m_routeItem)
        connect(m_routeItem, &MissionRouteItem::changed, this,
                &MissionItemEditController::routeItemChanged);

    emit routeItemChanged();
}

void MissionItemEditController::rename(const QString& name)
{
    if (!m_mission || !m_routeItem)
        return;

    m_routeItem->name = name;
    m_missionsService->saveItem(m_mission->route, m_routeItem);
}

void MissionItemEditController::changeItemType(const QString& typeId)
{
    if (!m_mission || !m_routeItem)
        return;

    const MissionItemType* type = m_mission->type()->itemType(typeId);
    if (!type)
        return;

    if (m_routeItem->type() == type)
        return;

    m_routeItem->setType(type);
    m_missionsService->saveItem(m_mission->route, m_routeItem);
}

void MissionItemEditController::setPosition(double latitude, double longitude, float altitude)
{
    if (!m_mission || !m_routeItem)
        return;

    m_routeItem->position.set(Geodetic(latitude, longitude, altitude));
    m_missionsService->saveItem(m_mission->route, m_routeItem);
}

void MissionItemEditController::setParameter(const QString& parameterId, const QVariant& value)
{
    if (!m_mission || !m_routeItem)
        return;

    m_routeItem->parameter(parameterId)->setValue(value);
    m_missionsService->saveItem(m_mission->route, m_routeItem);
}
