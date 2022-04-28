#ifndef VEHICLES_MAP_CONTROLLER_H
#define VEHICLES_MAP_CONTROLLER_H

#include "i_command_service.h"
#include "i_property_tree.h"
#include "i_vehicles_service.h"

#include <QJsonArray>

namespace md::presentation
{
class VehiclesMapController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant selectedVehicleId READ selectedVehicleId WRITE selectVehicle NOTIFY
                   selectedVehicleChanged)

    Q_PROPERTY(bool tracking READ isTracking WRITE setTracking NOTIFY trackingChanged)
    Q_PROPERTY(int trackLength READ trackLength NOTIFY trackLengthChanged)

public:
    explicit VehiclesMapController(QObject* parent = nullptr);

    QVariant selectedVehicleId() const;

    bool isTracking() const;
    int trackLength() const;

    Q_INVOKABLE QJsonArray vehicles() const;
    Q_INVOKABLE QJsonObject vehicle(const QVariant& vehicleId) const;
    Q_INVOKABLE QVariantMap telemetry(const QVariant& vehicleId) const;

public slots:
    void selectVehicle(const QVariant& vehicleId);
    void sendCommand(const QVariant& vehicleId, const QString& commandId, const QVariantList& args);

    void setTracking(bool tracking);

signals:
    void selectedVehicleChanged(QVariant vehicleId);

    void trackingChanged();
    void trackLengthChanged(int trackLength);

    void vehicleAdded(QVariant vehicleId, QVariantMap vehicle);
    void vehicleChanged(QVariant vehicleId, QVariantMap vehicle);
    void vehicleRemoved(QVariant vehicleId);
    void telemetryChanged(QVariant vehicleId, QVariantMap data);

private:
    domain::IVehiclesService* const m_vehicles;
    domain::IPropertyTree* const m_pTree;
    domain::ICommandsService* const m_commands;

    QVariant m_selectedVehicleId;
    bool m_tracking = false;
};
} // namespace md::presentation

#endif // VEHICLES_MAP_CONTROLLER_H
