#ifndef MISSION_EDIT_CONTROLLER_H
#define MISSION_EDIT_CONTROLLER_H

#include "i_missions_service.h"
#include "i_vehicles_service.h"

namespace md::presentation
{
class MissionEditController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE selectMission NOTIFY missionChanged)
    Q_PROPERTY(QVariant mission READ mission NOTIFY missionChanged)
    Q_PROPERTY(QString vehicleName READ vehicleName NOTIFY vehicleChanged)
    Q_PROPERTY(bool online READ isOnline NOTIFY vehicleChanged)

    Q_PROPERTY(int operationProgress READ operationProgress NOTIFY operationProgressChanged)

public:
    explicit MissionEditController(QObject* parent = nullptr);

    QVariant missionId() const;
    QVariant mission() const;
    QString vehicleName() const;
    bool isOnline() const;
    int operationProgress() const;

public slots:
    void selectMission(const QVariant& missionId);
    void upload();
    void download();
    void clear();
    void cancel();

signals:
    void missionChanged();
    void vehicleChanged();
    void operationProgressChanged();

private:
    domain::IMissionsService* const m_missions;
    domain::IVehiclesService* const m_vehicles;
    domain::Mission* m_mission = nullptr;
    domain::Vehicle* m_vehicle = nullptr;
    domain::MissionOperation* m_operation = nullptr;
};
} // namespace md::presentation

#endif // MISSION_EDIT_CONTROLLER_H
