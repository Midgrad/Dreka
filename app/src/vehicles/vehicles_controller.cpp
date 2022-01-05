#include "vehicles_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehiclesController::VehiclesController(QObject* parent) :
    QObject(parent),
    m_pTree(md::app::Locator::get<IPropertyTree>()),
    m_vehiclesService(md::app::Locator::get<IVehiclesService>()),
    m_commandsService(md::app::Locator::get<ICommandsService>())
{
    Q_ASSERT(m_pTree);
    Q_ASSERT(m_vehiclesService);
    Q_ASSERT(m_commandsService);

    connect(m_pTree, &IPropertyTree::propertiesChanged, this,
            &VehiclesController::vehicleDataChanged);

    connect(m_vehiclesService, &IVehiclesService::vehicleAdded, this,
            &VehiclesController::onVehicleAdded);
    connect(m_vehiclesService, &IVehiclesService::vehicleRemoved, this,
            &VehiclesController::onVehicleRemoved);

    for (Vehicle* vehicle : m_vehiclesService->vehicles())
    {
        this->onVehicleAdded(vehicle);
    }
}

QJsonArray VehiclesController::vehicles() const
{
    QJsonArray vehicles;
    for (Vehicle* vehicle : m_vehiclesService->vehicles())
    {
        vehicles += QJsonObject::fromVariantMap(vehicle->toVariantMap());
    }
    return vehicles;
}

QVariant VehiclesController::selectedVehicle() const
{
    return m_selectedVehicleId;
}

bool VehiclesController::isTracking() const
{
    return m_tracking;
}

int VehiclesController::trackLength() const
{
    return 1000; // TODO: settings
}

QJsonObject VehiclesController::vehicle(const QVariant& vehicleId) const
{
    Vehicle* vehicle = m_vehiclesService->vehicle(vehicleId);
    if (vehicle)
        return QJsonObject::fromVariantMap(vehicle->toVariantMap());

    return QJsonObject();
}

QVariantMap VehiclesController::vehicleData(const QString& vehicleId) const
{
    return m_pTree->properties(vehicleId);
}

void VehiclesController::setTracking(bool tracking)
{
    if (m_tracking == tracking)
        return;

    m_tracking = tracking;
    emit trackingChanged();
}

void VehiclesController::sendCommand(const QString& commandId, const QVariantList& args)
{
    if (m_selectedVehicleId.isNull())
        return;

    emit m_commandsService->requestCommand(commandId)->exec(m_selectedVehicleId, args);
}

void VehiclesController::selectVehicle(const QVariant& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    this->setTracking(false);

    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged(vehicleId);
}

void VehiclesController::onVehicleAdded(Vehicle* vehicle)
{
    connect(vehicle, &Vehicle::changed, this, [this, vehicle]() {
        emit vehicleChanged(vehicle->id, vehicle->toVariantMap());
    });
    emit vehiclesChanged();

    if (m_selectedVehicleId.isNull())
    {
        this->selectVehicle(vehicle->id());
    }
}

void VehiclesController::onVehicleRemoved(Vehicle* vehicle)
{
    if (m_selectedVehicleId == vehicle->id)
    {
        this->selectVehicle(QVariant());
    }

    disconnect(vehicle, nullptr, this, nullptr);
    emit vehiclesChanged();
}
