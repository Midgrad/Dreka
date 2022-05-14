#ifndef VEHICLE_LIST_CONTROLLER_H
#define VEHICLE_LIST_CONTROLLER_H

#include "i_vehicles_service.h"

namespace md::presentation
{
class VehicleListController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariantList vehicleTypes READ vehicleTypes NOTIFY vehicleTypesChanged)
    Q_PROPERTY(QVariantList vehicles READ vehicles NOTIFY vehiclesChanged)

public:
    explicit VehicleListController(QObject* parent = nullptr);

    QVariantList vehicleTypes() const;
    QVariantList vehicles() const;

    Q_INVOKABLE QVariant vehicle(const QVariant& vehicleId) const;
    Q_INVOKABLE QVariant vehicleType(const QString& typeId) const;

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
