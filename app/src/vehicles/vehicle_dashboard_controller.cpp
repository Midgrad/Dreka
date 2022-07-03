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
            &VehicleDashboardController::telemetryChanged);
}

QString VehicleDashboardController::selectedVehicleId() const
{
    return m_selectedVehicleId;
}

QVariantMap VehicleDashboardController::telemetry() const
{
    return m_pTree->properties(m_selectedVehicleId);
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

void VehicleDashboardController::sendCommand(const QString& commandId, const QVariantList& args)
{
    if (m_selectedVehicleId.isNull())
        return;

    emit m_commands->requestCommand(commandId)->exec(m_selectedVehicleId, args);
}

void VehicleDashboardController::selectVehicle(const QString& vehicleId)
{
    if (m_selectedVehicleId == vehicleId)
        return;

    m_selectedVehicleId = vehicleId;
    emit selectedVehicleChanged();
    emit telemetryChanged();
}
