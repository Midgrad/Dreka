#ifndef MISSION_OPERATION_CONTROLLER_H
#define MISSION_OPERATION_CONTROLLER_H

#include "i_missions_service.h"
#include "i_routes_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionOperationController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE setMissionId NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject mission READ mission NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject operation READ operation NOTIFY operationChanged)

    Q_PROPERTY(QJsonArray routes READ routes NOTIFY routesChanged)

public:
    explicit MissionOperationController(QObject* parent = nullptr);

    QVariant missionId() const;
    QJsonObject mission() const;
    QJsonObject operation() const;

    QJsonArray routes() const;

public slots:
    void setMissionId(const QVariant& missionId);
    void setMission(domain::Mission* mission);

    void assignRoute(const QVariant& routeId);
    void rename(const QString& name);

    void remove();
    void upload();
    void download();
    void clear();
    void cancel();

signals:
    void missionChanged();
    void operationChanged();
    void routesChanged();

private:
    void setOperation(domain::MissionOperation* operation);

    domain::IMissionsService* const m_missionsService;
    domain::IRoutesService* const m_routesService;

    domain::Mission* m_mission = nullptr;
    domain::MissionOperation* m_operation = nullptr;
};
} // namespace md::presentation

#endif // MISSION_OPERATION_CONTROLLER_H
