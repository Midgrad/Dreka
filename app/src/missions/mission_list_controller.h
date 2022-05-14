#ifndef MISSION_LIST_CONTROLLER_H
#define MISSION_LIST_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionListController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariantList missionTypes READ missionTypes NOTIFY missionTypesChanged)
    Q_PROPERTY(QJsonArray missions READ missions NOTIFY missionsChanged)

public:
    explicit MissionListController(QObject* parent = nullptr);

    QVariantList missionTypes() const;
    QJsonArray missions() const;

    Q_INVOKABLE QJsonObject mission(const QVariant& missionId) const;

public slots:
    void addMission(const QString& typeId);
    void remove(const QVariant& missionId);
    void rename(const QVariant& missionId, const QString& name);

signals:
    void missionTypesChanged();
    void missionsChanged();
    void missionChanged(QVariant missionId, QVariantMap mission);

private slots:
    void onMissionAdded(domain::Mission* mission);
    void onMissionRemoved(domain::Mission* mission);

private:
    domain::IMissionsService* const m_missions;
};
} // namespace md::presentation

#endif // MISSION_LIST_CONTROLLER_H
