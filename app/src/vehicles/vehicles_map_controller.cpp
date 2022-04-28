#include "vehicles_map_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehiclesMapController::VehiclesMapController(QObject* parent) :
    QObject(parent),
    m_vehicles(md::app::Locator::get<IVehiclesService>()),
    m_pTree(md::app::Locator::get<IPropertyTree>()),
    m_commands(md::app::Locator::get<ICommandsService>())
{
    Q_ASSERT(m_vehicles);
    Q_ASSERT(m_pTree);
    Q_ASSERT(m_commands);

    connect(m_vehicles, &IVehiclesService::vehicleAdded, this,
            &VehiclesMapController::vehiclesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleRemoved, this,
            &VehiclesMapController::vehiclesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleChanged, this,
            &VehiclesMapController::vehiclesChanged);

    connect(m_pTree, &IPropertyTree::propertiesChanged, this,
            &VehiclesMapController::telemetryChanged);
}

QVariant VehiclesMapController::selectedVehicleId() const
{
    return m_selectedVehicleId;
}

bool VehiclesMapController::isTracking() const
{
    return m_tracking;
}

int VehiclesMapController::trackLength() const
{
    return 1000; // TODO: settings
}

QJsonArray VehiclesMapController::vehicles() const
{
    QJsonArray vehicles;
    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        vehicles += QJsonObject::fromVariantMap(vehicle->toVariantMap());
    }
    return vehicles;
}

QJsonObject VehiclesMapController::vehicle(const QVariant& vehicleId) const
{
    domain::Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (!vehicle)
        return QJsonObject();

    return QJsonObject::fromVariantMap(vehicle->toVariantMap());
}

QVariantMap VehiclesMapController::telemetry(const QVariant& vehicleId) const
{
    return m_pTree->properties(vehicleId.toString());
}

void VehiclesMapController::setTracking(bool tracking)
{
    if (m_tracking == tracking)
        return;

    m_tracking = tracking;
    emit trackingChanged();
}

void VehiclesMapController::sendCommand(const QVariant& vehicleId, const QString& commandId,
                                        const QVariantList& args)
{
    emit m_commands->requestCommand(commandId)->exec(vehicleId, args);
}

void VehiclesMapController::selectVehicle(const QVariant& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    this->setTracking(false);

    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged();
}
