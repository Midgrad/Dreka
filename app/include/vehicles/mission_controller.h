#ifndef MISSION_CONTROLLER_H
#define MISSION_CONTROLLER_H

#include "i_missions_repository.h"
#include "i_property_tree.h"

namespace md::presentation
{
class MissionController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QString vehicleId WRITE setVehicleId)
    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject missionStatus READ missionStatus NOTIFY missionStatusChanged)
    Q_PROPERTY(QJsonObject route READ route NOTIFY routeChanged)
    Q_PROPERTY(QStringList waypoints READ waypoints NOTIFY routeChanged)
    Q_PROPERTY(int currentWaypoint READ currentWaypoint NOTIFY currentWaypointChanged)

public:
    explicit MissionController(QObject* parent = nullptr);

    QJsonObject mission() const;
    QJsonObject missionStatus() const;
    QJsonObject route() const;
    QStringList waypoints() const;
    int currentWaypoint() const;

public slots:
    void setVehicleId(const QString& vehicleId);
    void setMission(domain::Mission* mission);

    void save(const QJsonObject& data);
    void remove();
    void upload();
    void download();
    void clear();
    void cancel();
    void switchWaypoint(int index);

signals:
    void missionChanged();
    void missionStatusChanged();
    void routeChanged();
    void currentWaypointChanged();

private:
    domain::IMissionsRepository* const m_missionsRepository;
    domain::Mission* m_mission = nullptr;
};
} // namespace md::presentation

#endif // MISSION_CONTROLLER_H
