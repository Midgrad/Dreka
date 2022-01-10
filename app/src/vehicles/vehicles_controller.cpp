#include "vehicles_controller.h"

#include <QDebug>

#include "locator.h"

namespace
{
const QString genericDashboard = "GenericDashboard.qml";
}

using namespace md::domain;
using namespace md::presentation;

VehiclesController::VehiclesController(QObject* parent) :
    QObject(parent),
    m_pTree(md::app::Locator::get<IPropertyTree>()),
    m_vehicles(md::app::Locator::get<IVehiclesService>()),
    m_features(md::app::Locator::get<IVehiclesFeatures>()),
    m_commands(md::app::Locator::get<ICommandsService>())
{
    Q_ASSERT(m_pTree);
    Q_ASSERT(m_vehicles);
    Q_ASSERT(m_features);
    Q_ASSERT(m_commands);

    connect(m_pTree, &IPropertyTree::propertiesChanged, this,
            &VehiclesController::vehicleDataChanged);

    connect(m_vehicles, &IVehiclesService::vehicleTypesChanged, this,
            &VehiclesController::vehicleTypesChanged);
    connect(m_vehicles, &IVehiclesService::vehicleAdded, this, &VehiclesController::onVehicleAdded);
    connect(m_vehicles, &IVehiclesService::vehicleRemoved, this,
            &VehiclesController::onVehicleRemoved);

    for (Vehicle* vehicle : m_vehicles->vehicles())
    {
        this->onVehicleAdded(vehicle);
    }
}

QVariantList VehiclesController::vehicleTypes() const
{
    QVariantList list;
    for (const VehicleType* type : m_vehicles->vehicleTypes())
    {
        list.append(type->toVariantMap());
    }

    return list;
}

QJsonArray VehiclesController::vehicles() const
{
    QJsonArray vehicles;
    for (Vehicle* vehicle : m_vehicles->vehicles())
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
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (vehicle)
        return QJsonObject::fromVariantMap(vehicle->toVariantMap());

    return QJsonObject();
}

QVariantMap VehiclesController::vehicleData(const QVariant& vehicleId) const
{
    return m_pTree->properties(vehicleId.toString());
}

QVariantList VehiclesController::dashboardModel(const QVariant& vehicleId) const
{
    Vehicle* vehicle = m_vehicles->vehicle(m_selectedVehicleId);
    // If no vehicle, return generic dashboard
    if (!vehicle)
        return QVariantList({ ::genericDashboard });

    QString dashboard = m_features->feature(vehicle->type()->id, features::dashboard).toString();
    // If no dashborad for vehicle's type, show generic dashboard
    if (dashboard.isEmpty())
        dashboard = ::genericDashboard;

    return { dashboard };
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

    emit m_commands->requestCommand(commandId)->exec(m_selectedVehicleId, args);
}

void VehiclesController::addNewVehicle(const QString& typeId)
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
    this->selectVehicle(vehicle->id);
}

void VehiclesController::removeVehicle(const QVariant& vehicleId)
{
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (!vehicle)
        return;

    m_vehicles->removeVehicle(vehicle);

    if (m_selectedVehicleId == vehicleId)
    {
        QVariantList ids = m_vehicles->vehicleIds();
        this->selectVehicle(ids.length() ? ids.last() : QVariant());
    }
}

void VehiclesController::selectVehicle(const QVariant& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    this->setTracking(false);

    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged(vehicleId);
}

void VehiclesController::rename(const QVariant& vehicleId, const QString& name)
{
    Vehicle* vehicle = m_vehicles->vehicle(vehicleId);
    if (!vehicle)
        return;

    vehicle->name.set(name);
    m_vehicles->saveVehicle(vehicle);
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
