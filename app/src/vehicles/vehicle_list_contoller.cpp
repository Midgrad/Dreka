#include "vehicle_list_contoller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehicleListController::VehicleListController(QObject* parent) :
    QObject(parent),
    m_vehicles(md::app::Locator::get<IVehiclesService>())
{
    Q_ASSERT(m_vehicles);

    connect(m_vehicles, &IVehiclesService::vehicleTypesChanged, this,
            &VehicleListController::vehicleTypesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleAdded, this,
            &VehicleListController::onVehicleAdded);
    connect(m_vehicles, &IVehiclesService::vehicleRemoved, this,
            &VehicleListController::onVehicleRemoved);

    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        this->onVehicleAdded(vehicle);
    }
}

QVariantList VehicleListController::vehicleTypes() const
{
    QVariantList list;
    for (const VehicleType* type : m_vehicles->vehicleTypes())
    {
        list.append(type->toVariantMap());
    }

    return list;
}

QVariantList VehicleListController::vehicles() const
{
    QVariantList vehicles;
    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        vehicles.append(vehicle->toVariantMap());
    }
    return vehicles;
}

QVariant VehicleListController::vehicle(const QVariant& vehicleId) const
{
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (vehicle)
        return vehicle->toVariantMap();

    return QVariant();
}

QVariant VehicleListController::vehicleType(const QString& typeId) const
{
    const VehicleType* type = m_vehicles->vehicleType(typeId);
    if (!type)
        return QVariant();

    return type->toVariantMap();
}

void VehicleListController::addVehicle(const QString& typeId)
{
    const VehicleType* type = m_vehicles->vehicleType(typeId);
    if (!type)
        return;

    QStringList vehicleNames;
    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        vehicleNames += vehicle->name;
    }

    auto vehicle = new Vehicle(type, utils::nameFromType(type->name, vehicleNames));
    m_vehicles->saveVehicle(vehicle);
}

void VehicleListController::remove(const QVariant& vehicleId)
{
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (!vehicle)
        return;

    m_vehicles->removeVehicle(vehicle);
}

void VehicleListController::rename(const QVariant& vehicleId, const QString& name)
{
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (!vehicle)
        return;

    vehicle->name.set(name);
    m_vehicles->saveVehicle(vehicle);
}

void VehicleListController::onVehicleAdded(Vehicle* vehicle)
{
    connect(vehicle, &Vehicle::changed, this, [this, vehicle]() {
        emit vehiclesChanged();
    });
    emit vehiclesChanged();
}

void VehicleListController::onVehicleRemoved(Vehicle* vehicle)
{
    disconnect(vehicle, nullptr, this, nullptr);
    emit vehiclesChanged();
}
