#ifndef VEHICLE_LIST_CONTROLLER_H
#define VEHICLE_LIST_CONTROLLER_H

#include "i_vehicles_service.h"

#include <QJsonArray>

namespace md::presentation
{
class VehicleListController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariantList vehicleTypes READ vehicleTypes NOTIFY vehicleTypesChanged)
    Q_PROPERTY(QJsonArray vehicles READ vehicles NOTIFY vehiclesChanged)

public:
    explicit VehicleListController(QObject* parent = nullptr);

    QVariantList vehicleTypes() const;
    QJsonArray vehicles() const;

    Q_INVOKABLE QJsonObject vehicle(const QVariant& vehicleId) const;

public slots:
    void addVehicle(const QString& typeId);
    void remove(const QVariant& vehicleId);
    void rename(const QVariant& vehicleId, const QString& name);

signals:
    void vehicleTypesChanged();
    void vehiclesChanged();

private slots:
    void onVehicleAdded(domain::Vehicle* vehicle);
    void onVehicleRemoved(domain::Vehicle* vehicle);

private:
    domain::IVehiclesService* const m_vehicles;
};
} // namespace md::presentation

#endif // VEHICLE_LIST_CONTROLLER_H
