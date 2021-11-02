#include "vehicles_controller.h"

#include <QDebug>

#include "locator.h"

using namespace md::domain;
using namespace md::presentation;

VehiclesController::VehiclesController(QObject* parent) :
    QObject(parent),
    m_pTree(md::app::Locator::get<IPropertyTree>()),
    m_vehiclesRepository(md::app::Locator::get<IVehiclesRepository>()),
    m_commandsService(md::app::Locator::get<ICommandsService>())
{
    Q_ASSERT(m_pTree);
    Q_ASSERT(m_vehiclesRepository);
    Q_ASSERT(m_commandsService);

    connect(m_pTree, &IPropertyTree::propertiesChanged, this,
            &VehiclesController::vehicleDataChanged);

    connect(m_vehiclesRepository, &IVehiclesRepository::vehicleAdded, this,
            &VehiclesController::onVehiclesChanged);
    connect(m_vehiclesRepository, &IVehiclesRepository::vehicleRemoved, this,
            &VehiclesController::onVehiclesChanged);
    this->onVehiclesChanged();
}

QJsonArray VehiclesController::vehicles() const
{
    return m_vehicles;
}

QString VehiclesController::selectedVehicle() const
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

void VehiclesController::selectVehicle(const QString& selectedVehicleId)
{
    if (m_selectedVehicleId == selectedVehicleId)
        return;

    this->setTracking(false);
    m_selectedVehicleId = selectedVehicleId;
    emit selectedVehicleChanged();
}

void VehiclesController::onVehiclesChanged()
{
    m_vehicles = QJsonArray();
    for (domain::Vehicle* vehicle : m_vehiclesRepository->vehicles())
    {
        m_vehicles += QJsonObject::fromVariantMap(vehicle->toVariantMap());
    }
    emit vehiclesChanged();

    if (m_selectedVehicleId.isNull() && m_vehicles.count())
    {
        this->selectVehicle(m_vehicles.first().toObject().value(params::id).toString());
    }
}
