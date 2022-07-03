#include "mission_edit_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

MissionEditController::MissionEditController(QObject* parent) :
    QObject(parent),
    m_missions(md::app::Locator::get<IMissionsService>()),
    m_vehicles(md::app::Locator::get<IVehiclesService>())
{
    Q_ASSERT(m_missions);
    Q_ASSERT(m_vehicles);

    connect(m_missions, &IMissionsService::operationStarted, this,
            [this](MissionOperation* operation) {
                if (m_mission == operation->mission())
                {
                    if (m_operation)
                        disconnect(m_operation, nullptr, this, nullptr);

                    m_operation = operation;

                    if (m_operation)
                        connect(m_operation, &MissionOperation::changed, this,
                                &MissionEditController::operationProgressChanged);

                    emit operationProgressChanged();
                }
            });
    connect(m_missions, &IMissionsService::operationEnded, this,
            [this](MissionOperation* operation) {
                if (m_operation == operation)
                {
                    disconnect(m_operation, nullptr, this, nullptr);
                    m_operation = nullptr;

                    emit operationProgressChanged();
                }
            });
}

QVariant MissionEditController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QVariant MissionEditController::mission() const
{
    return m_mission ? m_mission->toVariantMap() : QVariant();
}

QString MissionEditController::vehicleName() const
{
    return m_vehicle ? m_vehicle->name() : QString();
}

bool MissionEditController::isOnline() const
{
    return m_vehicle && m_vehicle->online();
}

int MissionEditController::operationProgress() const
{
    if (!m_operation)
        return -1;

    return m_operation->progress * 100.0 / m_operation->total;
}

void MissionEditController::selectMission(const QVariant& missionId)
{
    Mission* mission = m_missions->mission(missionId);
    if (m_mission == mission)
        return;

    if (m_mission)
    {
        disconnect(m_mission, nullptr, this, nullptr);
    }

    if (m_vehicle)
    {
        disconnect(m_vehicle, nullptr, this, nullptr);
    }

    m_mission = mission;
    m_vehicle = mission ? m_vehicles->vehicle(mission->vehicleId) : nullptr;

    if (m_mission)
    {
        connect(m_mission, &Mission::changed, this, &MissionEditController::missionChanged);
    }

    if (m_vehicle)
    {
        connect(m_vehicle, &Vehicle::changed, this, &MissionEditController::vehicleChanged);
    }

    emit missionChanged();
    emit vehicleChanged();
}

void MissionEditController::upload()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Upload);
}

void MissionEditController::download()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Download);
}

void MissionEditController::clear()
{
    if (!m_mission)
        return;

    m_missions->startOperation(m_mission, MissionOperation::Clear);
}

void MissionEditController::cancel()
{
    if (!m_operation)
        return;

    m_missions->endOperation(m_operation, MissionOperation::Canceled);
}
