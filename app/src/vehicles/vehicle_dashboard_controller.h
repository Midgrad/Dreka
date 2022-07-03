#ifndef VEHICLE_DASHBOARD_CONTROLLER_H
#define VEHICLE_DASHBOARD_CONTROLLER_H

#include "i_command_service.h"
#include "i_property_tree.h"
#include "i_vehicles_features.h"

#include <QJsonArray>

namespace md::presentation
{
class VehicleDashboardController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QString selectedVehicleId READ selectedVehicleId WRITE selectVehicle NOTIFY
                   selectedVehicleChanged)
    Q_PROPERTY(QVariantMap telemetry READ telemetry NOTIFY telemetryChanged)

public:
    explicit VehicleDashboardController(QObject* parent = nullptr);

    QString selectedVehicleId() const;
    QVariantMap telemetry() const;

    Q_INVOKABLE QVariantList instruments(const QString& typeId) const;

public slots:
    void selectVehicle(const QString& vehicleId);
    void sendCommand(const QString& commandId, const QVariantList& args);

signals:
    void selectedVehicleChanged();
    void telemetryChanged();

private:
    domain::IPropertyTree* const m_pTree;
    domain::IVehiclesFeatures* const m_features;
    domain::ICommandsService* const m_commands;

    QString m_selectedVehicleId;
};
} // namespace md::presentation

#endif // VEHICLE_DASHBOARD_CONTROLLER_H
