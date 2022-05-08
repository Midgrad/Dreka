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

    connect(m_vehicles, &IVehiclesService::vehicleAdded, this,
            &MissionEditController::vehiclesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleRemoved, this,
            &MissionEditController::vehiclesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleChanged, this, [this](Vehicle* vehicle) {
        if (m_mission && m_mission->vehicleId() == vehicle->id())
        {
            emit vehicleChanged();
        }
        emit vehiclesChanged();
    });
}

QVariant MissionEditController::missionId() const
{
    return m_mission ? m_mission->id() : QVariant();
}

QVariant MissionEditController::vehicle() const
{
    if (!m_mission)
        return QVariant();

    if (Vehicle* vehicle = m_vehicles->vehicle(m_mission->vehicleId))
    {
        return vehicle->toVariantMap();
    }
    return QVariant();
}

QStringList MissionEditController::vehicles() const
{
    QStringList vehicles;
    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        vehicles.append(vehicle->name);
    }
    return vehicles;
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

    m_mission = mission;

    if (m_mission)
    {
        connect(m_mission, &Mission::changed, this, &MissionEditController::missionChanged);
        connect(m_mission, &Mission::changed, this, &MissionEditController::vehicleChanged);
    }

    emit missionChanged();
    emit vehicleChanged();
}

void MissionEditController::assignVehicle(const QVariant& vehicleId)
{
}

void MissionEditController::upload()
{
    qDebug() << "upload";
}

void MissionEditController::download()
{
    qDebug() << "download";
}

void MissionEditController::clear()
{
    qDebug() << "clear";
}

void MissionEditController::cancel()
{
    if (!m_operation)
        return;

    m_missions->endOperation(m_operation, MissionOperation::Canceled);
}
