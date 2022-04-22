#include "vehicle_dashboard_controller.h"

#include <QDebug>

#include "locator.h"

namespace
{
const QString GenericInstruments = "GenericInstruments.qml";
}

using namespace md::domain;
using namespace md::presentation;

VehicleDashboardController::VehicleDashboardController(QObject* parent) :
    QObject(parent),
    m_pTree(md::app::Locator::get<IPropertyTree>()),
    m_features(md::app::Locator::get<IVehiclesFeatures>()),
    m_commands(md::app::Locator::get<ICommandsService>())
{
    Q_ASSERT(m_pTree);
    Q_ASSERT(m_features);
    Q_ASSERT(m_commands);

    connect(m_pTree, &IPropertyTree::propertiesChanged, this,
            &VehicleDashboardController::vehicleDataChanged);
}

QVariant VehicleDashboardController::selectedVehicle() const
{
    return m_selectedVehicleId;
}

bool VehicleDashboardController::isTracking() const
{
    return m_tracking;
}

int VehicleDashboardController::trackLength() const
{
    return 1000; // TODO: settings
}

QVariantMap VehicleDashboardController::vehicleData(const QVariant& vehicleId) const
{
    return m_pTree->properties(vehicleId.toString());
}

QVariantList VehicleDashboardController::instruments(const QString& typeId) const
{
    // If no vehicle type, return nothing
    if (typeId.isNull())
        return QVariantList();

    QString dashboard = m_features->feature(typeId, features::instruments).toString();
    // If no dashborad for vehicle's type, show generic dashboard
    if (dashboard.isEmpty())
        dashboard = ::GenericInstruments;

    return { dashboard };
}

void VehicleDashboardController::setTracking(bool tracking)
{
    if (m_tracking == tracking)
        return;

    m_tracking = tracking;
    emit trackingChanged();
}

void VehicleDashboardController::sendCommand(const QString& commandId, const QVariantList& args)
{
    if (m_selectedVehicleId.isNull())
        return;

    emit m_commands->requestCommand(commandId)->exec(m_selectedVehicleId, args);
}

void VehicleDashboardController::selectVehicle(const QVariant& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    this->setTracking(false);

    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged(vehicleId);
}
