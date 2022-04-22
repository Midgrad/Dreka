#ifndef VEHICLES_CONTROLLER_H
#define VEHICLES_CONTROLLER_H

#include "i_command_service.h"
#include "i_property_tree.h"
#include "i_vehicles_features.h"

#include <QJsonArray>

namespace md::presentation
{
class VehicleDashboardController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant selectedVehicle READ selectedVehicle WRITE selectVehicle NOTIFY
                   selectedVehicleChanged)
    Q_PROPERTY(bool tracking READ isTracking WRITE setTracking NOTIFY trackingChanged)
    Q_PROPERTY(int trackLength READ trackLength NOTIFY trackLengthChanged)

public:
    explicit VehicleDashboardController(QObject* parent = nullptr);

    QVariant selectedVehicle() const;
    bool isTracking() const;
    int trackLength() const;

    Q_INVOKABLE QVariantMap vehicleData(const QVariant& vehicleId) const;
    Q_INVOKABLE QVariantList instruments(const QString& typeId) const;

public slots:
    void selectVehicle(const QVariant& vehicleId);
    void setTracking(bool tracking);
    void sendCommand(const QString& commandId, const QVariantList& args);

signals:
    void selectedVehicleChanged(QVariant vehicleId);
    void trackingChanged();
    void trackLengthChanged(int trackLength);

    void vehicleDataChanged(QVariant vehicleId, QVariantMap data);

private:
    domain::IPropertyTree* const m_pTree;
    domain::IVehiclesFeatures* const m_features;
    domain::ICommandsService* const m_commands;
    QVariant m_selectedVehicleId;
    bool m_tracking = false;
};
} // namespace md::presentation

#endif // VEHICLES_CONTROLLER_H
