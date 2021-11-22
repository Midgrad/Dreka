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
            &VehiclesController::onVehiclesChanged);
    connect(m_vehiclesService, &IVehiclesService::vehicleRemoved, this,
            &VehiclesController::onVehiclesChanged);
    this->onVehiclesChanged();
}

QJsonArray VehiclesController::vehicles() const
{
    return m_vehicles;
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
    m_commandsService->requestCommand(commandId)->exec(m_selectedVehicleId, args);
}

void VehiclesController::selectVehicle(const QVariant& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    this->setTracking(false);
    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged();
}

void VehiclesController::onVehiclesChanged()
{
    m_vehicles = QJsonArray();
    for (domain::Vehicle* vehicle : m_vehiclesService->vehicles())
    {
        m_vehicles += QJsonObject::fromVariantMap(vehicle->toVariantMap());
    }
    emit vehiclesChanged();

    if (m_selectedVehicleId.isNull() && m_vehicles.count())
    {
        this->selectVehicle(m_vehicles.first().toObject().value(props::id).toString());
    }
}
