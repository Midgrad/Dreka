#ifndef MISSION_OPERATION_CONTROLLER_H
#define MISSION_OPERATION_CONTROLLER_H

#include "i_missions_service.h"

namespace md::presentation
{
class MissionOperationController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE setMissionId NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject operation READ operation NOTIFY operationChanged)

public:
    explicit MissionOperationController(QObject* parent = nullptr);

    QVariant missionId() const;
    QJsonObject mission() const;
    QJsonObject operation() const;

public slots:
    void setMissionId(const QVariant& missionId);
    void setMission(domain::Mission* mission);

    void save(const QJsonObject& data);
    void remove();
    void upload();
    void download();
    void clear();
    void cancel();

signals:
    void missionChanged();
    void operationChanged();

private:
    void setOperation(domain::MissionOperation* operation);

    domain::IMissionsService* const m_missionsService;
    domain::Mission* m_mission = nullptr;
    domain::MissionOperation* m_operation = nullptr;
};
} // namespace md::presentation

#endif // MISSION_OPERATION_CONTROLLER_H
