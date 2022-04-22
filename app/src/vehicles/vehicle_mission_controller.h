//#ifndef VEHICLE_MISSION_CONTROLLER_H
//#define VEHICLE_MISSION_CONTROLLER_H

//#include "i_missions_service.h"

//namespace md::presentation
//{
//class VehicleMissionController : public QObject
//{
//    Q_OBJECT

//    Q_PROPERTY(QVariant vehicleId READ vehicleId WRITE setVehicleId NOTIFY missionChanged)
//    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)
//    Q_PROPERTY(QJsonObject home READ home NOTIFY homeChanged)
//    Q_PROPERTY(QJsonObject target READ target NOTIFY targetChanged)
//    Q_PROPERTY(QStringList routeItems READ routeItems NOTIFY routeItemsChanged)
//    Q_PROPERTY(int currentItem READ currentItem NOTIFY currentChanged)

//public:
//    explicit VehicleMissionController(QObject* parent = nullptr);

//    QVariant vehicleId() const;
//    QJsonObject mission() const;
//    QJsonObject home() const;
//    QJsonObject target() const;
//    QStringList routeItems() const;
//    int currentItem() const;

//public slots:
//    void setVehicleId(const QVariant& vehicleId);
//    void setMission(domain::Mission* mission); // FIXME: unify setMission & setRoute
//    void setRoute(domain::MissionRoute* route);

//    void switchItem(int index);
//    void navTo(double latitude, double longitude);

//signals:
//    void missionChanged();
//    void routeItemsChanged();
//    void currentChanged();
//    void homeChanged(QJsonObject home);
//    void targetChanged(QJsonObject home);

//private:
//    domain::IMissionsService* const m_missionsService;
//    domain::Mission* m_mission = nullptr;
//    domain::MissionRoute* m_route = nullptr;
//};
//} // namespace md::presentation

//#endif // VEHICLE_MISSION_CONTROLLER_H
