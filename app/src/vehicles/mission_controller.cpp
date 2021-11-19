#include "mission_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionController::MissionController(QObject* parent) :
    QObject(parent),
    m_missionsRepository(md::app::Locator::get<IMissionsRepository>())
{
    Q_ASSERT(m_missionsRepository);

    connect(m_missionsRepository, &IMissionsRepository::missionChanged, this,
            [this](Mission* mission) {
                if (m_mission == mission)
                    emit missionChanged();
            });
    connect(m_missionsRepository, &IMissionsRepository::missionRemoved, this,
            [this](Mission* mission) {
                if (m_mission == mission)
                    this->setMission(nullptr);
            });
}

QJsonObject MissionController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QJsonObject MissionController::operation() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->operation()->toVariantMap());
}

QStringList MissionController::items() const
{
    if (!m_mission)
        return QStringList();

    QStringList list;
    int index = 0;
    for (WaypointItem* item : m_mission->route()->items())
    {
        list.append(item->name() + " " + QString::number(index));
        index++;
    }

    return list;
}

int MissionController::currentItem() const
{
    if (!m_mission)
        return -1;

    return m_mission->route()->currentItem();
}

void MissionController::setVehicleId(const QVariant& vehicleId)
{
    this->setMission(m_missionsRepository->missionForVehicle(vehicleId));
}

void MissionController::setMission(Mission* mission)
{
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    m_mission = mission;

    if (mission)
    {
        connect(mission->operation(), &MissionOperation::changed, this,
                &MissionController::operationChanged);
        connect(mission->route(), &MissionRoute::itemsChanged, this,
                &MissionController::itemsChanged);
        connect(mission->route(), &MissionRoute::currentItemChanged, this,
                &MissionController::currentItemChanged);
    }

    emit missionChanged();
    emit operationChanged();
}

void MissionController::save(const QJsonObject& data)
{
    if (!m_mission)
        return;

    m_mission->fromVariantMap(data.toVariantMap());
    m_missionsRepository->saveMission(m_mission);
}

void MissionController::remove()
{
    if (!m_mission)
        return;

    m_missionsRepository->removeMission(m_mission);
}

void MissionController::upload()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->upload();
}

void MissionController::download()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->download();
}

void MissionController::clear()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->clear();
}

void MissionController::cancel()
{
    if (!m_mission)
        return;

    emit m_mission->operation()->cancel();
}

void MissionController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->route()->switchCurrentItem(index);
}
