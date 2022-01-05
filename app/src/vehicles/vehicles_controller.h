#ifndef VEHICLES_CONTROLLER_H
#define VEHICLES_CONTROLLER_H

#include "i_command_service.h"
#include "i_property_tree.h"
#include "i_vehicles_service.h"

#include <QJsonArray>

namespace md::presentation
{
class VehiclesController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonArray vehicles READ vehicles NOTIFY vehiclesChanged)
    Q_PROPERTY(QVariant selectedVehicle READ selectedVehicle NOTIFY selectedVehicleChanged)
    Q_PROPERTY(bool tracking READ isTracking WRITE setTracking NOTIFY trackingChanged)
    Q_PROPERTY(int trackLength READ trackLength NOTIFY trackLengthChanged)

public:
    explicit VehiclesController(QObject* parent = nullptr);

    QJsonArray vehicles() const;
    QVariant selectedVehicle() const;
    bool isTracking() const;
    int trackLength() const;

    Q_INVOKABLE QVariantMap vehicleData(const QString& vehicle) const;

public slots:
    void selectVehicle(const QVariant& vehicleId);
    void setTracking(bool tracking);
    void sendCommand(const QString& commandId, const QVariantList& args);

signals:
    void vehiclesChanged();
    void selectedVehicleChanged();
    void trackingChanged();
    void trackLengthChanged(int trackLength);

    void vehicleDataChanged(QVariant vehicleId, QVariantMap data);

private slots:
    void onVehiclesChanged();

private:
    domain::IPropertyTree* const m_pTree;
    domain::IVehiclesService* const m_vehiclesService;
    domain::ICommandsService* const m_commandsService;
    QJsonArray m_vehicles;
    domain::Vehicle* m_selectedVehicle = nullptr;
    bool m_tracking = false;
};
} // namespace md::presentation

#endif // VEHICLES_CONTROLLER_H
