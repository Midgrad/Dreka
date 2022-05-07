#ifndef MISSION_EDIT_CONTROLLER_H
#define MISSION_EDIT_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionEditController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE selectMission NOTIFY missionChanged)
    Q_PROPERTY(QVariant operation READ operation NOTIFY operationChanged)

public:
    explicit MissionEditController(QObject* parent = nullptr);

    QVariant missionId() const;
    QVariant operation() const;

public slots:
    void selectMission(const QVariant& missionId);
    void upload();
    void download();
    void clear();
    void cancel();

signals:
    void missionChanged();
    void operationChanged();

private:
    domain::IMissionsService* const m_missions;
    domain::Mission* m_mission = nullptr;
    domain::MissionOperation* m_operation = nullptr;
};
} // namespace md::presentation

#endif // MISSION_EDIT_CONTROLLER_H
