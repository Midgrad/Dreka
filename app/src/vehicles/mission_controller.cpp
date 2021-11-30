#include "mission_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionController::MissionController(QObject* parent) :
    QObject(parent),
    m_missionsService(md::app::Locator::get<IMissionsService>())
{
    Q_ASSERT(m_missionsService);

    connect(m_missionsService, &IMissionsService::missionChanged, this, [this](Mission* mission) {
        if (m_mission == mission)
            emit missionChanged();
    });
    connect(m_missionsService, &IMissionsService::missionRemoved, this, [this](Mission* mission) {
        if (m_mission == mission)
            this->setMission(nullptr);
    });
    connect(m_missionsService, &IMissionsService::operationStarted, this,
            [this](MissionOperation* operation) {
                if (m_mission && m_mission == operation->mission())
                    this->setOperation(operation);
            });
    connect(m_missionsService, &IMissionsService::operationEnded, this,
            [this](MissionOperation* operation) {
                if (m_operation == operation)
                    this->setOperation(nullptr);
            });
}

QVariant MissionController::vehicleId() const
{
    if (!m_mission)
        return QVariant();

    return m_mission->vehicleId();
}

QJsonObject MissionController::mission() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->toVariantMap());
}

QJsonObject MissionController::home() const
{
    if (!m_mission)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_mission->homePoint()->toVariantMap());
}

QJsonObject MissionController::operation() const
{
    if (!m_operation)
        return QJsonObject();

    return QJsonObject::fromVariantMap(m_operation->toVariantMap());
}

QStringList MissionController::items() const
{
    if (!m_mission)
        return QStringList();

    QStringList list;

    list.append(m_mission->homePoint()->underlyingItem()->name());

    if (m_mission->route())
    {
        int index = 1;
        for (MissionRouteItem* item : m_mission->route()->items())
        {
            list.append(item->underlyingItem()->name() + " " + QString::number(index));
            index++;
        }
    }

    return list;
}

int MissionController::currentItem() const
{
    if (!m_mission || !m_mission->route())
        return -1;

    return m_mission->route()->currentItem();
}

void MissionController::setVehicleId(const QVariant& vehicleId)
{
    this->setMission(m_missionsService->missionForVehicle(vehicleId));
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
        connect(mission->homePoint(), &RouteItem::changed, this, [this]() {
            emit homeChanged(this->home());
        });

        // TODO: separate mission route
        connect(mission->route(), &MissionRoute::itemsChanged, this,
                &MissionController::itemsChanged);
        connect(mission->route(), &MissionRoute::currentItemChanged, this,
                &MissionController::currentItemChanged);
    }

    emit missionChanged();
    emit operationChanged();
    emit homeChanged(this->home());
}

void MissionController::save(const QJsonObject& data)
{
    if (!m_mission)
        return;

    m_mission->fromVariantMap(data.toVariantMap());
    m_missionsService->saveMission(m_mission);
}

void MissionController::remove()
{
    if (!m_mission)
        return;

    m_missionsService->removeMission(m_mission);
}

void MissionController::upload()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Upload);
}

void MissionController::download()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Download);
}

void MissionController::clear()
{
    if (!m_mission)
        return;

    m_missionsService->startOperation(m_mission, MissionOperation::Clear);
}

void MissionController::cancel()
{
    if (!m_operation)
        return;

    m_missionsService->endOperation(m_operation);
}

void MissionController::switchItem(int index)
{
    if (!m_mission)
        return;

    emit m_mission->route()->switchCurrentItem(index);
}

void MissionController::setOperation(domain::MissionOperation* operation)
{
    if (m_operation == operation)
        return;

    if (m_operation)
        disconnect(m_operation, nullptr, this, nullptr);

    m_operation = operation;

    if (m_operation)
        connect(m_operation, &MissionOperation::changed, this, &MissionController::operationChanged);

    emit operationChanged();
}
