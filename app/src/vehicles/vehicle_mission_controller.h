#ifndef VEHICLE_MISSION_CONTROLLER_H
#define VEHICLE_MISSION_CONTROLLER_H

#include "i_vehicle_missions.h"

namespace md::presentation
{
class VehicleMissionController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant vehicleId READ vehicleId WRITE setVehicleId NOTIFY vehicleIdChanged)
    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)

    Q_PROPERTY(QStringList routeItems READ routeItems NOTIFY routeItemsChanged)
    Q_PROPERTY(int currentItem READ currentItem NOTIFY currentItemChanged)

public:
    explicit VehicleMissionController(QObject* parent = nullptr);

    QVariant vehicleId() const;
    QJsonObject mission() const;
    QStringList routeItems() const;
    int currentItem() const;

public slots:
    void setVehicleId(const QVariant& vehicleId);
    void setMission(domain::Mission* mission);
    void setRoute(domain::MissionRoute* route);
    void switchCurrentItem(int index);

signals:
    void vehicleIdChanged();
    void missionChanged();
    void routeItemsChanged();
    void currentItemChanged();

private:
    domain::IVehicleMissions* const m_vehicleMissions;

    QVariant m_vehicleId;
    domain::Mission* m_mission = nullptr;
    domain::MissionRoute* m_route = nullptr;
};
} // namespace md::presentation

#endif // VEHICLE_MISSION_CONTROLLER_H
