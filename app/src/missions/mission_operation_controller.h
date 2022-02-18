#ifndef MISSION_OPERATION_CONTROLLER_H
#define MISSION_OPERATION_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionOperationController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonObject operation READ operation NOTIFY operationChanged)

public:
    explicit MissionOperationController(QObject* parent = nullptr);

    QJsonObject operation() const;

public slots:
    void upload(const QVariant& missionId);
    void download(const QVariant& missionId);
    void clear(const QVariant& missionId);
    void cancel(const QVariant& missionId);

signals:
    void operationChanged();

private:
    void startOperation(const QVariant& missionId, domain::MissionOperation::Type type);
    void setOperation(domain::MissionOperation* operation);

    domain::IMissionsService* const m_missionsService;

    domain::MissionOperation* m_operation = nullptr;
    QVariant m_missionId;
};
} // namespace md::presentation

#endif // MISSION_OPERATION_CONTROLLER_H
