#ifndef MISSION_ROUTE_CONTROLLER_H
#define MISSION_ROUTE_CONTROLLER_H

#include "i_missions_service.h"

namespace md::presentation
{
class MissionRouteController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant vehicleId READ vehicleId WRITE setVehicleId NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject home READ home NOTIFY homeChanged)
    Q_PROPERTY(QStringList routeItems READ routeItems NOTIFY routeItemsChanged)
    Q_PROPERTY(int currentItem READ currentItem NOTIFY currentItemChanged)

public:
    explicit MissionRouteController(QObject* parent = nullptr);

    QVariant vehicleId() const;
    QJsonObject mission() const;
    QJsonObject home() const;
    QStringList routeItems() const;
    int currentItem() const;

public slots:
    void setVehicleId(const QVariant& vehicleId);
    void setMission(domain::Mission* mission);

    void switchItem(int index);

signals:
    void missionChanged();
    void routeItemsChanged();
    void currentItemChanged();
    void homeChanged(QJsonObject home);

private:
    domain::IMissionsService* const m_missionsService;
    domain::Mission* m_mission = nullptr;
};
} // namespace md::presentation

#endif // MISSION_ROUTE_CONTROLLER_H
